import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import WorkoutShareModal from "../components/WorkoutShareModal";
import toast from 'react-hot-toast';

export default function Workout() {
    const { routineId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState(null); // The day currently being trained (e.g., "Mon" or "Push")
    const [exerciseLogs, setExerciseLogs] = useState({}); // { index: { weight, reps, completed } }
    const [startTime, setStartTime] = useState(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const [historyLogs, setHistoryLogs] = useState({}); // { exIndex: { setIndex: { weight, reps } } }

    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);
    const [workoutStats, setWorkoutStats] = useState(null);
    const [userStats, setUserStats] = useState(null); // For rich share card

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        fetchRoutine();
    }, [routineId, user]);

    const fetchRoutine = async () => {
        try {
            const { data, error } = await supabase
                .from('routines')
                .select('*')
                .eq('id', routineId)
                .single();

            if (error) throw error;
            setRoutine(data);
        } catch (error) {
            console.error('Error fetching routine:', error);
            toast.error("Error al cargar la rutina.");
            navigate('/profile');
        } finally {
            setLoading(false);
        }
    };

    const handleStartDay = (day) => {
        setActiveDay(day);
        setStartTime(new Date());

        // Initialize logs structure for sets
        const dayExercises = routine.structure.routineExercises[day] || [];
        const initialLogs = {};

        dayExercises.forEach((ex, index) => {
            const numSets = Number(ex.sets) || 3;
            initialLogs[index] = Array(numSets).fill(null).map(() => ({
                weight: '',
                reps: '',
                completed: false
            }));
        });

        setExerciseLogs(initialLogs);
        setExerciseLogs(initialLogs);
        fetchHistory(day); // Fetch history when measuring starts
    };

    const fetchHistory = async (day) => {
        try {
            // Fetch LAST 10 logs to find recent history for these exercises
            const { data, error } = await supabase
                .from('workout_logs')
                .select('exercises, date')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(10); // Look back 10 workouts

            if (error) throw error;

            if (data && data.length > 0) {
                const historyMap = {};
                const currentExercises = routine.structure.routineExercises[day] || [];

                currentExercises.forEach((currentEx, index) => {
                    // Find the most recent log that contains this exercise
                    const lastLog = data.find(log => {
                        // Assuming exercise order/index is consistent for now or falling back to simple match
                        return true;
                    });
                });
            }

            // Fetch last log specifically for this routine Day
            const { data: specificData } = await supabase
                .from('workout_logs')
                .select('exercises')
                .eq('user_id', user.id)
                .eq('routine_day', day)
                .order('date', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (specificData?.exercises) {
                setHistoryLogs(specificData.exercises);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const handleSetChange = (exIndex, setIndex, field, value) => {
        setExerciseLogs(prev => {
            const exerciseSets = [...(prev[exIndex] || [])];
            exerciseSets[setIndex] = { ...exerciseSets[setIndex], [field]: value };
            return { ...prev, [exIndex]: exerciseSets };
        });
    };

    const toggleSetComplete = (exIndex, setIndex) => {
        const currentSet = exerciseLogs[exIndex]?.[setIndex];
        if (!currentSet) return;

        // Validation before checking
        if (!currentSet.completed) {
            if (!currentSet.weight || !currentSet.reps || Number(currentSet.weight) <= 0 || Number(currentSet.reps) <= 0) {
                toast.error("¡Completa los datos del set!");
                return;
            }
            if (navigator.vibrate) navigator.vibrate(50);
        }

        setExerciseLogs(prev => {
            const exerciseSets = [...(prev[exIndex] || [])];
            exerciseSets[setIndex] = { ...exerciseSets[setIndex], completed: !exerciseSets[setIndex].completed };
            return { ...prev, [exIndex]: exerciseSets };
        });
    };

    const finishWorkout = async () => {
        // Confirmation Toast
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-zinc-900 shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-zinc-800`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">
                                ¿Terminar entrenamiento?
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">
                                Asegúrate de haber completado todo.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-zinc-800">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeFinishHelper(); // Call the actual finish logic
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-500 hover:text-green-400 hover:bg-zinc-800 focus:outline-none"
                    >
                        Sí, Terminar
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
        ), { duration: 5000 });
    };

    const executeFinishHelper = async () => {
        setIsFinishing(true);
        const durationMinutes = Math.round((new Date() - startTime) / 60000) || 1;
        // Count exercises as "done" if at least one set is completed
        const exerciseCount = Object.keys(exerciseLogs).filter(idx =>
            exerciseLogs[idx]?.some(set => set.completed)
        ).length;

        try {
            // 1. Create Workout Log
            const { error: logError } = await supabase
                .from('workout_logs')
                .insert([{
                    user_id: user.id,
                    routine_day: activeDay,
                    duration_minutes: durationMinutes,
                    exercises: exerciseLogs // Requires 'exercises' JSONB column in Supabase
                }])
                .select()
                .single();

            if (logError) throw logError;

            // 2. Update Profile Streak
            const { error: profileError } = await supabase.rpc('increment_streak', { user_id_param: user.id });

            // 3. FETCH UPDATED STATS FOR SHARE CARD
            // We need to recalculate them to show the *new* level/rank
            const { data: allLogs } = await supabase
                .from('workout_logs')
                .select('date, exercises')
                .eq('user_id', user.id);

            // Ranks Definition (Copy from Profile - centralized in utils would be better but keeping simple)
            const RANKS = [
                { threshold: 0, name: "RECLUTA", color: "text-zinc-500" },
                { threshold: 30, name: "CONSTANTE", color: "text-green-500" },
                { threshold: 90, name: "DISCIPLINADO", color: "text-blue-500" },
                { threshold: 180, name: "GYMRAT", color: "text-purple-500" },
                { threshold: 365, name: "GYMBOSS", color: "text-yellow-500" },
                { threshold: 730, name: "TITÁN", color: "text-orange-500" },
                { threshold: 1000, name: "DIOS GRIEGO", color: "text-red-500" }
            ];

            const logs = allLogs || [];
            const uniqueDays = new Set(logs.map(log => new Date(log.date).toISOString().split('T')[0])).size;
            const rank = [...RANKS].reverse().find(r => uniqueDays >= r.threshold) || RANKS[0];
            const currentRankIndex = RANKS.findIndex(r => r.name === rank.name);
            const nextRank = RANKS[currentRankIndex + 1];
            const neededXP = nextRank ? nextRank.threshold : uniqueDays * 1.5;
            const prevThreshold = rank.threshold;
            const level = Math.floor(uniqueDays / 7) + 1;

            // Streak Calculation
            const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
            const uniqueLogDates = [...new Set(sortedLogs.map(l => new Date(l.date).toISOString().split('T')[0]))];
            let currentStreak = 0;
            if (uniqueLogDates.length > 0) {
                currentStreak = 1;
                const today = new Date();
                const lastWorkoutDate = new Date(uniqueLogDates[0]);
                const gapDays = (today - lastWorkoutDate) / (1000 * 60 * 60 * 24);

                if (gapDays <= 4) {
                    for (let i = 0; i < uniqueLogDates.length - 1; i++) {
                        const current = new Date(uniqueLogDates[i]);
                        const prev = new Date(uniqueLogDates[i + 1]);
                        const diffTime = Math.abs(current - prev);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays <= 4) currentStreak++;
                        else break;
                    }
                } else {
                    currentStreak = 0;
                }
            }

            const calculatedStats = {
                level,
                currentXP: uniqueDays,
                neededXP,
                prevThreshold,
                rank,
                currentStreak,
                username: user.email?.split('@')[0] // Fallback username
            };
            setUserStats(calculatedStats);

            // Find the split name (e.g., "Push", "Legs") for the active day
            const dayIndex = routine.structure.daysSelected.indexOf(activeDay);
            const splitName = routine.structure.routineSplits[dayIndex] || activeDay;

            setWorkoutStats({
                day: splitName, // Use the split name (e.g., "LEGS") instead of "Wed"
                duration: durationMinutes,
                exerciseCount: exerciseCount
            });
            setShowShareModal(true);

        } catch (error) {
            console.error('Error saving workout:', error);
            alert("Hubo un error al guardar, pero buen entreno.");
            navigate('/profile');
        } finally {
            setIsFinishing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-teko text-2xl animate-pulse">CARGANDO...</div>;
    if (!routine) return <div className="min-h-screen bg-black text-white p-6">Rutina no encontrada.</div>;

    // --- DAY SELECTION VIEW ---
    if (!activeDay) {
        return (
            <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Noise/Gradient */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Back Button - Absolute Positioned */}
                <button
                    onClick={() => navigate('/profile')}
                    className="absolute top-8 left-8 z-50 text-zinc-500 hover:text-white flex items-center gap-2 transition-colors uppercase font-bold text-xs tracking-widest group"
                >
                    <div className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center group-hover:border-zinc-600 group-hover:bg-zinc-800 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </div>
                    <span>Volver al Perfil</span>
                </button>

                <div className="relative z-10 w-full max-w-2xl">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-7xl font-teko text-white uppercase leading-none tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
                            {routine.name}
                        </h1>
                        <p className="text-green-500 font-teko text-xl md:text-2xl uppercase tracking-widest mt-2">
                            Selecciona tu batalla de hoy
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {routine.structure.daysSelected.map((day, idx) => {
                            const splitName = routine.structure.routineSplits[idx];
                            const exerciseCount = (routine.structure.routineExercises[day] || []).length;

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleStartDay(day)}
                                    className="group relative w-full bg-zinc-900/50 border border-zinc-800 hover:border-green-500 p-6 rounded-xl text-left transition-all duration-300 hover:bg-zinc-900 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-hover:to-green-500/5 transition-all duration-500"></div>

                                    <div className="relative z-10 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="bg-zinc-800 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider group-hover:bg-green-500 group-hover:text-black transition-colors">
                                                    {day}
                                                </span>
                                                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                                                    {exerciseCount} Ejercicios
                                                </span>
                                            </div>
                                            <h3 className="text-4xl text-white font-teko uppercase leading-none group-hover:text-green-400 transition-colors">
                                                {splitName}
                                            </h3>
                                        </div>

                                        <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-green-500 group-hover:bg-green-500/10 transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-zinc-500 group-hover:text-green-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 0 1 0 1.971l-11.54 6.347a1.125 1.125 0 0 1-1.667-.985V5.653Z" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // --- ACTIVE WORKOUT VIEW ---
    const dayExercises = routine.structure.routineExercises[activeDay] || [];

    return (
        <div className="min-h-screen bg-black pb-32">
            {/* Minimal Header */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-white font-teko text-3xl uppercase leading-none text-green-500">{activeDay}</h2>
                </div>
                <button
                    onClick={() => setActiveDay(null)}
                    className="text-zinc-600 hover:text-white text-xs font-bold uppercase tracking-widest border border-zinc-800 px-3 py-1.5 rounded bg-zinc-900/50"
                >
                    Cancelar
                </button>
            </div>

            {/* Exercise List */}
            <div className="p-4 space-y-6 max-w-3xl mx-auto mt-2">
                {dayExercises.length === 0 ? (
                    <p className="text-zinc-500 text-center py-20 font-inter">Día de descanso.</p>
                ) : (
                    dayExercises.map((ex, exIdx) => {
                        // Determine if exercise is fully done
                        const sets = exerciseLogs[exIdx] || [];
                        const allDone = sets.length > 0 && sets.every(s => s.completed);

                        return (
                            <div key={exIdx} className={`transition-all duration-500 ${allDone ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                {/* Exercise Header */}
                                <div className="mb-3 px-1">
                                    <h3 className="font-teko text-3xl text-white uppercase leading-none tracking-wide">
                                        {ex.name}
                                    </h3>
                                    {/* History / Previous Performance */}
                                    {historyLogs[exIdx] && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                                Anterior
                                            </span>
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                                {historyLogs[exIdx].map((hSet, hIdx) => {
                                                    if (!hSet.completed) return null;
                                                    return (
                                                        <span key={hIdx} className="text-[10px] text-zinc-400 font-inter whitespace-nowrap">
                                                            {hSet.weight}kg <span className="text-zinc-600">x</span> {hSet.reps}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sets Container */}
                                <div className="flex flex-col gap-2">
                                    {/* Column Labels */}
                                    <div className="grid grid-cols-[3rem_1fr_1fr_3rem] gap-3 px-3 text-zinc-600 text-[10px] font-bold uppercase tracking-widest text-center">
                                        <span>Set</span>
                                        <span>KG</span>
                                        <span>Reps</span>
                                        <span>Check</span>
                                    </div>

                                    {sets.map((setLog, setIdx) => {
                                        const isSetDone = setLog.completed;
                                        return (
                                            <div
                                                key={setIdx}
                                                onClick={(e) => {
                                                    // Allow clicking anywhere on the row to focus inputs if not done, 
                                                    // but primarily this is for visual structure.
                                                }}
                                                className={`grid grid-cols-[3rem_1fr_1fr_3rem] gap-3 items-center p-3 rounded-xl border transition-all duration-200 
                                                    ${isSetDone
                                                        ? 'bg-green-900/10 border-green-900/30'
                                                        : 'bg-zinc-900/40 border-zinc-800'
                                                    }
                                                `}
                                            >
                                                {/* Set Number */}
                                                <div className="flex justify-center">
                                                    <span className={`font-teko text-xl ${isSetDone ? 'text-green-600' : 'text-zinc-500'}`}>
                                                        {setIdx + 1}
                                                    </span>
                                                </div>

                                                {/* Weight Input */}
                                                <div className="h-12 bg-black/30 rounded-lg relative overflow-hidden group-focus-within:ring-1 ring-green-500/50">
                                                    <input
                                                        type="number"
                                                        placeholder={isSetDone ? "" : (historyLogs[exIdx]?.[setIdx]?.weight || "-")}
                                                        value={setLog.weight}
                                                        onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                                                        disabled={isSetDone}
                                                        className={`w-full h-full bg-transparent text-center font-teko text-2xl focus:outline-none placeholder:text-zinc-700/50 ${isSetDone ? 'text-green-500' : 'text-white'}`}
                                                    />
                                                </div>

                                                {/* Reps Input */}
                                                <div className="h-12 bg-black/30 rounded-lg relative overflow-hidden">
                                                    <input
                                                        type="number"
                                                        placeholder={isSetDone ? "" : (historyLogs[exIdx]?.[setIdx]?.reps || "-")}
                                                        value={setLog.reps}
                                                        onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                                                        disabled={isSetDone}
                                                        className={`w-full h-full bg-transparent text-center font-teko text-2xl focus:outline-none placeholder:text-zinc-700/50 ${isSetDone ? 'text-green-500' : 'text-white'}`}
                                                    />
                                                </div>

                                                {/* Check Button */}
                                                <div className="flex justify-center h-12">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSetComplete(exIdx, setIdx);
                                                        }}
                                                        className={`w-12 h-full rounded-lg flex items-center justify-center transition-all active:scale-95 ${isSetDone
                                                            ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                                            : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-400'
                                                            }`}
                                                    >
                                                        {isSetDone ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .207 1.012l-7.5 13a.75.75 0 0 1-1.215 0l-4.5-7.794a.75.75 0 1 1 1.258-.726l3.916 6.782 6.822-11.82a.75.75 0 0 1 1.012-.207Z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Finish Button */}
            {/* Finish Button */}
            <div className="p-4 mt-8 pb-12 w-full z-40">
                <button
                    onClick={finishWorkout}
                    disabled={isFinishing}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-teko text-3xl uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 mx-auto max-w-xl block"
                >
                    {isFinishing ? "GUARDANDO..." : "TERMINAR ENTRENAMIENTO"}
                </button>
            </div>
            {/* Share Modal */}
            {
                showShareModal && (
                    <WorkoutShareModal
                        day={workoutStats.day}
                        duration={workoutStats.duration}
                        exerciseCount={workoutStats.exerciseCount}
                        stats={userStats}
                        onClose={() => navigate('/profile')}
                    />
                )
            }
        </div >
    );
}
