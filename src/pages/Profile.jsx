import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabaseClient";
import { encodeRoutine } from "../utils/urlState";
import toast from 'react-hot-toast';

// Ranks based on UNIQUE TRAINING DAYS (Consistency)
const RANKS = [
    { threshold: 0, name: "NOVATO", color: "text-zinc-500" },
    { threshold: 10, name: "PRINCIPIANTE", color: "text-green-700" }, // ~2 weeks
    { threshold: 30, name: "CONSTANTE", color: "text-green-500" }, // ~1 month
    { threshold: 90, name: "DISCIPLINADO", color: "text-blue-500" }, // ~3 months
    { threshold: 180, name: "GYMRAT", color: "text-purple-500" }, // ~6 months
    { threshold: 365, name: "GYMBOSS", color: "text-yellow-500" }, // 1 year
    { threshold: 730, name: "TITÁN", color: "text-orange-500" }, // ~2 years
    { threshold: 1000, name: "DIOS GRIEGO", color: "text-red-500" } // ~3 years
];

export default function Profile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        level: 1,
        currentXP: 0, // Now represents DAYS
        neededXP: 10, // Days needed for next rank
        rank: RANKS[0],
        totalVolume: 0,
        totalWorkouts: 0,
        currentStreak: 0
    });
    const [uploading, setUploading] = useState(false);

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debe seleccionar una imagen.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to 'avatars' bucket
            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

            // 3. Update User Metadata (Auth)
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: data.publicUrl }
            });

            if (updateError) throw updateError;

            toast.success("Foto actualizada. Recargando...");
            setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error("Error: ¿Existe el bucket 'avatars' en Supabase?");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfileData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // Fetch Routines and Logs in parallel
            const [routinesResult, logsResult] = await Promise.all([
                supabase
                    .from('routines')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('workout_logs')
                    .select('date, exercises') // Need date for unique days check
                    .eq('user_id', user.id)
            ]);

            if (routinesResult.error) throw routinesResult.error;
            if (logsResult.error) throw logsResult.error;

            setRoutines(routinesResult.data || []);
            calculateLevelStats(logsResult.data || []);

        } catch (error) {
            console.error('Error fetching profile data:', error);
            toast.error("Error al cargar perfil.");
        } finally {
            setLoading(false);
        }
    };

    const calculateLevelStats = (logs) => {
        let totalVol = 0;

        // 1. Calculate Volume (Stats only, not leveling)
        logs.forEach(log => {
            if (!log.exercises) return;
            Object.values(log.exercises).forEach(sets => {
                if (Array.isArray(sets)) {
                    sets.forEach(set => {
                        if (set.completed) {
                            totalVol += (Number(set.weight) || 0) * (Number(set.reps) || 0);
                        }
                    });
                }
            });
        });

        // 2. Calculate Unique Days (Consistency)
        // Extract 'YYYY-MM-DD' from created_at ISO string
        const uniqueDays = new Set(logs.map(log => new Date(log.date).toISOString().split('T')[0])).size;

        // 3. Determine Rank based on DAYS
        // Find the highest rank where threshold <= uniqueDays
        const rank = [...RANKS].reverse().find(r => uniqueDays >= r.threshold) || RANKS[0];

        // Find next rank for progress bar
        const currentRankIndex = RANKS.findIndex(r => r.name === rank.name);
        const nextRank = RANKS[currentRankIndex + 1];

        const neededXP = nextRank ? nextRank.threshold : uniqueDays * 1.5; // Cap if max rank
        const prevThreshold = rank.threshold;

        // Level Number: Just simplified day count logic (e.g. Level 1 = 0-5 days, Level 2...) 
        // Or just abstract Level = 1 + Days/7 (Weeks trained). Let's do Weeks.
        const level = Math.floor(uniqueDays / 7) + 1;

        // 4. Calculate Streak (Gap Logic)
        // Sort logs by date desc
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Filter strictly to unique days first
        const uniqueLogDates = [...new Set(sortedLogs.map(l => new Date(l.date).toISOString().split('T')[0]))];

        let currentStreak = 0;
        if (uniqueLogDates.length > 0) {
            currentStreak = 1; // At least today/last workout counts
            const today = new Date();
            const lastWorkoutDate = new Date(uniqueLogDates[0]);

            // Check if streak is alive (Last workout was within 4 days)
            const gapDays = (today - lastWorkoutDate) / (1000 * 60 * 60 * 24);

            // If gap is too big, streak is 0 (broken)
            // But if I trained today or yesterday, streak is valid.
            // Let's accept gap <= 4 days as "Active Streak".
            if (gapDays > 4) {
                currentStreak = 0;
            } else {
                // Count backwards
                for (let i = 0; i < uniqueLogDates.length - 1; i++) {
                    const current = new Date(uniqueLogDates[i]);
                    const prev = new Date(uniqueLogDates[i + 1]);

                    const diffTime = Math.abs(current - prev);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 4) {
                        currentStreak++;
                    } else {
                        break; // Streak broken
                    }
                }
            }
        }

        setStats({
            level,
            currentXP: uniqueDays,
            neededXP,
            prevThreshold,
            rank,
            totalVolume: totalVol,
            totalWorkouts: logs.length,
            currentStreak
        });
    };

    const handleDelete = (id) => {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-zinc-900 shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-zinc-800`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">
                                ¿Borrar esta rutina?
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">
                                Esta acción es permanente.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-zinc-800">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeDelete(id);
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-500 hover:text-red-400 hover:bg-zinc-800 focus:outline-none"
                    >
                        Borrar
                    </button>
                </div>
                <div className="flex border-l border-zinc-800">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ));
    };

    const executeDelete = async (id) => {
        try {
            const { error } = await supabase
                .from('routines')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRoutines(prev => prev.filter(r => r.id !== id));
            toast.success("Rutina eliminada.");
        } catch (error) {
            console.error('Error deleting routine:', error);
            toast.error("Error al eliminar la rutina.");
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-green-500 font-teko text-2xl animate-pulse tracking-widest">
                    CARGANDO PERFIL...
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <p>Inicia sesión para ver tu perfil.</p>
            </div>
        );
    }

    // Progress Calculation
    // We want % of the CURRENT bracket.
    // E.g. Rank: 10 to 30. Current: 15. Progress = (15-10) / (30-10) = 5/20 = 25%
    const progressPercent = stats.neededXP === stats.currentXP
        ? 100
        : Math.max(0, Math.min(100, ((stats.currentXP - stats.prevThreshold) / (stats.neededXP - stats.prevThreshold)) * 100)) || 0;

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADLINE */}
                <div className="mt-8 border-b border-zinc-800 pb-4 flex justify-center items-end">
                    <h1 className="text-xl md:text-2xl font-inter font-bold text-zinc-400 uppercase tracking-widest text-center">
                        BIENVENIDO DE NUEVO
                    </h1>
                </div>

                {/* PLAYER CARD (Gamification) */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                    {/* Decorative Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        {/* Avatar & Level */}
                        <div className="flex flex-col items-center gap-4 shrink-0">
                            <div className="relative group/avatar cursor-pointer">
                                <label htmlFor="avatar-upload" className="cursor-pointer relative block w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl group-hover/avatar:border-green-500 transition-colors">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="User Avatar"
                                            className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-50' : ''}`}
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-zinc-800 flex items-center justify-center transition-opacity ${uploading ? 'opacity-50' : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-zinc-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Overhead overlay */}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        {uploading ? (
                                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={uploadAvatar}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </div>
                            {/* Level Badge */}
                            <div className="absolute -bottom-2 -right-2 bg-zinc-900 border-2 border-green-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
                                <span className="font-teko text-white text-xl pt-1">{stats.level}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-bold font-inter text-white leading-none">
                                {user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </h2>
                            <p className={`text-sm font-bold tracking-widest uppercase ${stats.rank.color} mt-1`}>
                                RANGO {stats.rank.name}
                            </p>
                        </div>
                    </div>

                    {/* Stats & Progress */}
                    <div className="flex-grow flex flex-col justify-center gap-6">
                        {/* XP Bar (Days Driven) */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold font-inter text-zinc-500 uppercase tracking-wider">
                                <span>Nivel {stats.level} ({Math.floor(stats.currentXP)} Días)</span>
                                <span>Siguiente: {stats.neededXP} Días</span>
                            </div>
                            <div className="h-3 bg-black rounded-full overflow-hidden border border-zinc-800">
                                <div
                                    className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-inter text-right">
                                {stats.neededXP - stats.currentXP} días más para subir de rango
                            </p>
                        </div>

                        {/* Stat Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-black/40 border border-zinc-800 p-3 rounded-lg text-center">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Días Totales</p>
                                <p className="text-2xl font-teko text-white mt-1">{stats.currentXP}</p>
                            </div>
                            <div className="bg-black/40 border border-zinc-800 p-3 rounded-lg text-center">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Racha Actual</p>
                                <p className="text-2xl font-teko text-green-500 mt-1">
                                    {stats.currentStreak} Días
                                </p>
                            </div>
                            <div className="bg-black/40 border border-zinc-800 p-3 rounded-lg text-center">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Volumen Histórico</p>
                                <p className="text-2xl font-teko text-white mt-1">{stats.totalVolume > 1000 ? (stats.totalVolume / 1000).toFixed(1) + 'k' : stats.totalVolume} <span className="text-zinc-600 text-sm">KG</span></p>
                            </div>
                            <div className="bg-black/40 border border-zinc-800 p-3 rounded-lg text-center">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Sesiones</p>
                                <p className="text-2xl font-teko text-white mt-1">{stats.totalWorkouts}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROUTINES GRID */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-teko text-white uppercase italic tracking-wide">
                        Planes de Batalla
                    </h2>
                    <Link
                        to="/create"
                        className="bg-zinc-800 hover:bg-green-600 hover:text-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-all border border-zinc-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </Link>
                </div>

                {routines.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
                        <p className="text-zinc-500 mb-4 font-inter">No tienes rutinas creadas aún.</p>
                        <Link
                            to="/create"
                            className="inline-block bg-green-600 hover:bg-green-500 text-black font-teko text-xl px-6 py-2 rounded-lg transition-colors"
                        >
                            CREAR PRIMERA RUTINA
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {routines.map((routine) => (
                            <div
                                key={routine.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative group hover:border-zinc-700 transition-all shadow-lg"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Info */}
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-3xl font-teko text-white uppercase group-hover:text-green-400 transition-colors">
                                                {routine.name}
                                            </h3>
                                            <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                {new Date(routine.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Mini Preview Grid */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {routine.structure.daysSelected.map((day, idx) => (
                                                <div key={idx} className="bg-black/50 border border-zinc-800 px-3 py-1 rounded flex flex-col items-center min-w-[60px]">
                                                    <span className="text-[10px] text-zinc-500 font-bold uppercase">{day}</span>
                                                    <span className="text-xs text-green-500 font-teko tracking-wide">
                                                        {routine.structure.routineSplits[idx]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-3 mt-6">
                                            <Link
                                                to={`/workout/${routine.id}`}
                                                className="w-full bg-green-600 hover:bg-green-500 text-black py-4 rounded-lg font-bold font-inter tracking-wide uppercase text-lg transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                                </svg>
                                                INICIAR ENTRENAMIENTO
                                            </Link>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Link
                                                    to={'/create?data=' + encodeRoutine(routine.structure.daysSelected, routine.structure.routineExercises) + '&id=' + routine.id}
                                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white py-3 rounded-lg font-bold font-inter tracking-wider uppercase text-xs sm:text-sm transition-colors border border-zinc-700 flex items-center justify-center"
                                                >
                                                    EDITAR
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(routine.id)}
                                                    className="bg-red-900/10 hover:bg-red-900/30 text-red-500/80 hover:text-red-500 border border-red-900/20 hover:border-red-500/50 py-3 rounded-lg font-bold font-inter tracking-wider uppercase text-xs sm:text-sm transition-all flex items-center justify-center"
                                                >
                                                    BORRAR
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-zinc-900 pt-8 mt-12 flex justify-center">
                <button
                    onClick={handleSignOut}
                    className="text-zinc-500 hover:text-white font-inter text-sm underline decoration-zinc-700 hover:decoration-white underline-offset-4 transition-all"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    </div >
    );
}
