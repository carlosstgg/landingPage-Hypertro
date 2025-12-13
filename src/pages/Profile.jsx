import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabaseClient";
import { encodeRoutine } from "../utils/urlState";
import toast from 'react-hot-toast';
import StatsChart from "../components/StatsChart";

// Ranks based on UNIQUE TRAINING DAYS (Consistency)
const RANKS = [
    { threshold: 0, name: "RECLUTA", color: "text-zinc-500" },
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
    const [workoutLogs, setWorkoutLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('routines');
    const [stats, setStats] = useState({
        level: 1,
        currentXP: 0, // Now represents DAYS
        neededXP: 10, // Days needed for next rank
        rank: RANKS[0],
        totalVolume: 0,
        totalWorkouts: 0,
        currentStreak: 0
    });

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
            setWorkoutLogs(logsResult.data || []);
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

        // Level Number: Just simplified day count logic
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

    const handleShare = (routine) => {
        const encoded = encodeRoutine(routine.structure.daysSelected, routine.structure.routineExercises);
        const url = `${window.location.origin}/?data=${encoded}`;

        navigator.clipboard.writeText(url).then(() => {
            toast.success("¡Enlace copiado! Compártelo con tu gymbro.");
        }).catch(err => {
            console.error("Failed to copy", err);
            toast.error("Error al copiar enlace.");
        });
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
    const progressPercent = stats.neededXP === stats.currentXP
        ? 100
        : Math.max(0, Math.min(100, ((stats.currentXP - stats.prevThreshold) / (stats.neededXP - stats.prevThreshold)) * 100)) || 0;

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-24 font-inter">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* HEADER SECTION */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-green-500 transition-colors shadow-2xl">
                                {user?.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-zinc-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-black border border-green-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                                <span className="font-teko text-white text-lg pt-0.5">{stats.level}</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-teko uppercase text-white leading-none tracking-wide">
                                {user.user_metadata?.full_name || user.email?.split('@')[0]}
                            </h1>
                            <div className={`text-xs font-bold tracking-[0.2em] uppercase ${stats.rank.color} mt-1 flex items-center gap-2`}>
                                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                                {stats.rank.name}
                            </div>
                        </div>
                    </div>
                </header>

                {/* TABS NAVIGATION */}
                <div className="flex border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('routines')}
                        className={`flex-1 pb-4 text-center font-teko text-xl tracking-widest uppercase transition-colors relative ${activeTab === 'routines' ? 'text-green-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Planes de Batalla
                        {activeTab === 'routines' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 pb-4 text-center font-teko text-xl tracking-widest uppercase transition-colors relative ${activeTab === 'stats' ? 'text-green-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Estadísticas
                        {activeTab === 'stats' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                        )}
                    </button>
                </div>

                {/* TAB CONTENT: ROUTINES */}
                {activeTab === 'routines' && (
                    <section className="animate-enter-fast">
                        {routines.length > 0 && (
                            <div className="flex justify-between items-end mb-6">
                                <p className="text-zinc-500 text-lg font-teko uppercase tracking-wide">
                                    Selecciona un plan para iniciar tu entrenamiento de hoy.
                                </p>
                                <Link
                                    to="/create"
                                    className="text-xs font-bold text-green-500 hover:text-green-400 uppercase tracking-widest transition-colors flex items-center gap-1 bg-zinc-900/50 border border-zinc-800 px-3 py-2 rounded-lg hover:bg-zinc-900 hover:border-green-500/50 whitespace-nowrap"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                    </svg>
                                    Nuevo Plan
                                </Link>
                            </div>
                        )}

                        {routines.length === 0 ? (
                            <div className="text-center py-20 bg-zinc-900/20 rounded-2xl border border-zinc-800 border-dashed">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 bg-zinc-900 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-zinc-500 mb-6 font-medium text-sm">Tu librería de rutinas está vacía.</p>
                                <Link
                                    to="/create"
                                    className="inline-block bg-white hover:bg-zinc-200 text-black font-bold font-inter text-xs px-8 py-3 rounded-lg uppercase tracking-widest transition-colors"
                                >
                                    Crear Rutina
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {routines.map((routine) => (
                                    <div
                                        key={routine.id}
                                        className="bg-black border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group relative overflow-hidden"
                                    >
                                        {/* Background Gradient on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-900/0 via-green-900/0 to-green-900/0 group-hover:via-green-900/5 group-hover:to-green-900/10 transition-all duration-500 pointer-events-none"></div>

                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                                <div>
                                                    <h3 className="text-2xl font-teko text-white uppercase tracking-wide group-hover:text-green-500 transition-colors">
                                                        {routine.name}
                                                    </h3>
                                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                                        Creado: {new Date(routine.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/workout/${routine.id}`}
                                                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-black px-6 py-2 rounded-lg font-bold font-inter text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                                        </svg>
                                                        Entrenar
                                                    </Link>
                                                    <Link
                                                        to={'/create?data=' + encodeRoutine(routine.structure.daysSelected, routine.structure.routineExercises) + '&id=' + routine.id}
                                                        className="p-2 text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-lg transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleShare(routine)}
                                                        className="p-2 text-zinc-500 hover:text-purple-500 border border-zinc-800 hover:border-purple-500/50 rounded-lg transition-colors"
                                                        title="Compartir Rutina"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(routine.id)}
                                                        className="p-2 text-zinc-500 hover:text-red-500 border border-zinc-800 hover:border-red-500/50 rounded-lg transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Weekly Schedule Visualizer */}
                                            <div className="flex flex-wrap gap-2">
                                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => {
                                                    const dayIndex = routine.structure.daysSelected.indexOf(day);
                                                    const isActive = dayIndex !== -1;
                                                    const splitName = isActive ? routine.structure.routineSplits[dayIndex] : null;

                                                    if (!isActive) return null;

                                                    return (
                                                        <div
                                                            key={day}
                                                            className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-700 bg-zinc-900 min-w-[70px] flex-1 md:flex-none"
                                                        >
                                                            <span className="text-xs font-bold uppercase mb-2 text-white">
                                                                {day}
                                                            </span>
                                                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden mb-1">
                                                                <div className="h-full bg-green-500 w-full"></div>
                                                            </div>
                                                            <span className="text-xs text-green-400 font-teko tracking-widest truncate max-w-full">
                                                                {splitName}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* TAB CONTENT: STATS */}
                {activeTab === 'stats' && (
                    <div className="space-y-8 animate-enter-fast">
                        {/* STATS OVERVIEW */}
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-zinc-900/50 transition-colors group">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider group-hover:text-zinc-400">Días Totales</span>
                                <span className="text-3xl font-teko text-white">{stats.currentXP}</span>
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-zinc-900/50 transition-colors group">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider group-hover:text-zinc-400">Racha</span>
                                <span className="text-3xl font-teko text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">{stats.currentStreak} <span className="text-sm text-zinc-600">Días</span></span>
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-zinc-900/50 transition-colors group">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider group-hover:text-zinc-400">Volumen</span>
                                <span className="text-3xl font-teko text-white">{stats.totalVolume > 1000 ? (stats.totalVolume / 1000).toFixed(1) + 'k' : stats.totalVolume} <span className="text-sm text-zinc-600">KG</span></span>
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-zinc-900/50 transition-colors group">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider group-hover:text-zinc-400">Sesiones</span>
                                <span className="text-3xl font-teko text-white">{stats.totalWorkouts}</span>
                            </div>
                        </section>

                        {/* LEVEL PROGRESS */}
                        <section className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                            <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                                <span>Progreso de Rango</span>
                                <span>{stats.currentXP} / {stats.neededXP} XP</span>
                            </div>
                            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-700 to-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-inter mt-3 text-right uppercase tracking-wider">
                                {stats.neededXP - stats.currentXP} días para subir de nivel
                            </p>
                        </section>

                        {/* TRAINING STATS - REAL DATA */}
                        <section>
                            <StatsChart logs={workoutLogs} />
                        </section>
                    </div>
                )}

                {/* LOGOUT BUTTON - BOTTOM (Outside tabs) */}
                <div className="flex justify-center pt-8 border-t border-zinc-900 mt-12">
                    <button
                        onClick={handleSignOut}
                        className="text-xs text-zinc-600 hover:text-white font-bold uppercase tracking-widest transition-colors border border-zinc-800 hover:border-zinc-600 px-8 py-3 rounded hover:bg-zinc-900"
                    >
                        Cerrar Sesión
                    </button>
                </div>

            </div>
        </div>
    );
}
