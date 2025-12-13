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
            // Fetch last log for this routine_day
            const { data, error } = await supabase
                .from('workout_logs')
                .select('exercises')
                .eq('user_id', user.id)
                .eq('routine_day', day)
                .order('date', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) console.error("Error fetching history:", error);

            if (data && data.exercises) {
                // Map the exercises from the last log to the current structure
                // Assuming Index consistency for now (Phase 1 MVP)
                setHistoryLogs(data.exercises);
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
        // Count exercises as "done" if at least one set is completed (or all? usually volume > 0 is good enough for participation)
        // Let's count 'exercises where at least 1 set was logged'.
        const exerciseCount = Object.keys(exerciseLogs).filter(idx =>
            exerciseLogs[idx]?.some(set => set.completed)
        ).length;

        try {
            // 1. Create Workout Log
            const { data: logData, error: logError } = await supabase
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

            // 2. (Optional) We could save specific set data here if we had inputs for actual rep/weight performed.
            // For now, we assume if checked, they did the target sets/reps.
            // Let's increment a 'streak' or something in profile? (Trigger handles profile creation, but specific streak logic is custom).

            // Update Profile Streak (Simple +1 for now)
            const { error: profileError } = await supabase.rpc('increment_streak', { user_id_param: user.id });
            // Note: We need to create this RPC function or just do an update query. 
            // Let's do a simple update for now to avoid SQL complexity unless needed.

            // Simple update approach:
            /* 
            const { data: profile } = await supabase.from('profiles').select('current_streak').eq('id', user.id).single();
            await supabase.from('profiles').update({ current_streak: (profile?.current_streak || 0) + 1 }).eq('id', user.id);
            */

            // INSTEAD OF NAVIGATING, SHOW MODAL
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
            <div className="min-h-screen bg-zinc-950 p-6 flex flex-col items-center justify-center">
                <button
                    onClick={() => navigate('/profile')}
                    className="absolute top-4 left-4 text-zinc-500 hover:text-white"
                >
                    ← Volver
                </button>
                <h1 className="text-4xl md:text-6xl font-teko text-white mb-2 uppercase text-center">
                    {routine.name}
                </h1>
                <p className="text-zinc-400 font-inter mb-10 text-center">¿Qué toca reventar hoy?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    {routine.structure.daysSelected.map((day, idx) => {
                        const splitName = routine.structure.routineSplits[idx];
                        const exerciseCount = (routine.structure.routineExercises[day] || []).length;

                        return (
                            <button
                                key={day}
                                onClick={() => handleStartDay(day)}
                                className="group bg-zinc-900 border border-zinc-800 hover:border-green-500 p-6 rounded-xl text-left transition-all hover:bg-zinc-800 relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider">{day}</span>
                                        <span className="text-green-500 font-teko text-xl">{exerciseCount} Ejercicios</span>
                                    </div>
                                    <h3 className="text-3xl text-white font-teko uppercase">{splitName}</h3>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/5 group-hover:to-green-500/10 transition-all"></div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- ACTIVE WORKOUT VIEW ---
    const dayExercises = routine.structure.routineExercises[activeDay] || [];
    const trainingTime = Math.round((new Date() - startTime) / 60000); // This won't update in real-time without a timer effect, but good enough for start.

    return (
        <div className="min-h-screen bg-black pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900 p-4 flex justify-between items-center">
                <div>
                    <h2 className="text-white font-teko text-3xl leading-none uppercase">{activeDay}</h2>
                    <p className="text-green-500 text-xs font-inter uppercase tracking-widest">En Progreso</p>
                </div>
                <button
                    onClick={() => setActiveDay(null)}
                    className="text-zinc-500 hover:text-white text-sm"
                >
                    Cancelar
                </button>
            </div>

            {/* Exercise List */}
            <div className="p-4 space-y-4 max-w-3xl mx-auto mt-2 pb-32">
                {dayExercises.length === 0 ? (
                    <p className="text-zinc-500 text-center py-10">Día de descanso (o sin ejercicios).</p>
                ) : (
                    dayExercises.map((ex, exIdx) => {
                        // Determine if exercise is fully done (visual flair)
                        const sets = exerciseLogs[exIdx] || [];
                        const allDone = sets.length > 0 && sets.every(s => s.completed);

                        return (
                            <div key={exIdx} className={`rounded-2xl border transition-all duration-300 overflow-hidden ${allDone ? 'border-green-500/30 bg-green-900/5' : 'border-zinc-800 bg-zinc-900'}`}>
                                {/* Header */}
                                <div className="bg-zinc-950/50 p-4 border-b border-zinc-800/50 flex justify-between items-center">
                                    <h3 className={`font-teko text-2xl uppercase ${allDone ? 'text-green-500' : 'text-white'}`}>
                                        {ex.name}
                                    </h3>
                                    <span className="text-xs text-zinc-500 font-inter font-bold tracking-wider">
                                        {sets.length} SETS
                                    </span>
                                </div>

                                {/* Sets List */}
                                <div className="p-2 space-y-1">
                                    {/* Labels Header */}
                                    <div className="grid grid-cols-[0.5fr_1fr_1fr_0.5fr] gap-2 px-2 py-1 text-[10px] items-center text-center text-zinc-600 font-bold uppercase tracking-wider">
                                        <span>Set</span>
                                        <span>KG</span>
                                        <span>Reps</span>
                                        <span>Hecho</span>
                                    </div>

                                    {sets.map((setLog, setIdx) => {
                                        const isSetDone = setLog.completed;
                                        return (
                                            <div key={setIdx} className={`grid grid-cols-[0.5fr_1fr_1fr_0.5fr] gap-2 items-center p-2 rounded-lg transition-colors ${isSetDone ? 'bg-green-500/10' : 'bg-black/20'}`}>
                                                {/* Set Number */}
                                                <div className="flex justify-center">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-bold">
                                                        {setIdx + 1}
                                                    </div>
                                                </div>

                                                {/* Weight Input */}
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        placeholder={isSetDone ? "" : (historyLogs[exIdx]?.[setIdx]?.weight || "0")}
                                                        value={setLog.weight}
                                                        onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                                                        disabled={isSetDone}
                                                        className={`w-full bg-black/40 border ${isSetDone ? 'border-transparent text-green-500' : 'border-zinc-800 text-white focus:border-green-500'} rounded p-2 text-center font-teko text-xl focus:outline-none transition-colors`}
                                                    />
                                                </div>

                                                {/* Reps Input */}
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        placeholder={isSetDone ? "" : (historyLogs[exIdx]?.[setIdx]?.reps || "0")}
                                                        value={setLog.reps}
                                                        onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                                                        disabled={isSetDone}
                                                        className={`w-full bg-black/40 border ${isSetDone ? 'border-transparent text-green-500' : 'border-zinc-800 text-white focus:border-green-500'} rounded p-2 text-center font-teko text-xl focus:outline-none transition-colors`}
                                                    />
                                                </div>

                                                {/* Check Button */}
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => toggleSetComplete(exIdx, setIdx)}
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isSetDone ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700 hover:text-zinc-300'}`}
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
            <div className="fixed bottom-0 left-0 w-full p-4 bg-black border-t border-zinc-900 z-50 shadow-2xl">
                <button
                    onClick={finishWorkout}
                    disabled={isFinishing}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-teko text-3xl uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {isFinishing ? "GUARDANDO..." : "TERMINAR ENTRENAMIENTO"}
                </button>
            </div>
            {/* Share Modal */}
            {showShareModal && (
                <WorkoutShareModal
                    day={workoutStats.day}
                    duration={workoutStats.duration}
                    exerciseCount={workoutStats.exerciseCount}
                    onClose={() => navigate('/profile')}
                />
            )}
        </div>
    );
}
