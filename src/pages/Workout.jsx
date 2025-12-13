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
    const [completedExercises, setCompletedExercises] = useState({}); // {exerciseIndex: true/false}
    const [startTime, setStartTime] = useState(null);
    const [isFinishing, setIsFinishing] = useState(false);

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
        setCompletedExercises({});
    };

    const toggleExercise = (index) => {
        setCompletedExercises(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
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
        const durationMinutes = Math.round((new Date() - startTime) / 60000) || 1; // Ensure at least 1 min
        const exerciseCount = Object.keys(completedExercises).filter(key => completedExercises[key]).length; // Count completed ones

        try {
            // 1. Create Workout Log
            const { data: logData, error: logError } = await supabase
                .from('workout_logs')
                .insert([{
                    user_id: user.id,
                    routine_day: activeDay,
                    duration_minutes: durationMinutes,
                    // routine_id: routineId, // Optional if we want to link it strictly
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
                    dayExercises.map((ex, i) => {
                        const isDone = completedExercises[i];
                        return (
                            <div
                                key={i}
                                onClick={() => toggleExercise(i)}
                                className={`
                                    relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 cursor-pointer select-none
                                    ${isDone
                                        ? "bg-green-900/10 border-green-500/30"
                                        : "bg-zinc-900 border-zinc-800"
                                    }
                                `}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div>
                                        <h3 className={`font-teko text-3xl uppercase transition-colors ${isDone ? "text-green-500 line-through decoration-2" : "text-white"}`}>
                                            {ex.name}
                                        </h3>
                                        <div className="flex gap-4 mt-1">
                                            <div className="bg-black/30 px-3 py-1 rounded text-zinc-400 text-sm font-inter">
                                                <span className="text-white font-bold">{ex.sets || 3}</span> Sets
                                            </div>
                                            <div className="bg-black/30 px-3 py-1 rounded text-zinc-400 text-sm font-inter">
                                                <span className="text-white font-bold">{ex.reps || "8-12"}</span> Reps
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`
                                        w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all
                                        ${isDone
                                            ? "bg-green-500 border-green-500 text-black scale-110 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                            : "border-zinc-700 text-transparent hover:border-zinc-500"
                                        }
                                    `}>
                                        <svg xmlns="http://www.w3.org/2000/svg" strokeWidth="3" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
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
