import { useState, useRef, useEffect } from "react";
import DaySelector from "../components/DaySelector";
import RoutinePreview from "../components/RoutinePreview";
import ExerciseList from "../components/ExerciseList";
import { generateSplit, getSplitRequirements } from "../utils/routineLogic";
import { encodeRoutine, decodeRoutine } from "../utils/urlState";
import exercises from "../data/exercises.json";

export default function Home() {
    const [daysSelected, setDaysSelected] = useState([]);
    const [routineExercises, setRoutineExercises] = useState({});
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const routineRef = useRef(null);

    const [activeAddDay, setActiveAddDay] = useState(null); // { day, split }

    // Load state from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const data = params.get("data");
        if (data) {
            const decoded = decodeRoutine(data);
            if (decoded) {
                setDaysSelected(decoded.daysSelected);
                setRoutineExercises(decoded.routineExercises);

                // Auto-scroll to routine if shared link is opened
                setTimeout(() => {
                    routineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 500);
            }
        }
    }, []);

    const routineSplits = generateSplit(daysSelected);

    const handleShare = () => {
        const encoded = encodeRoutine(daysSelected, routineExercises);
        const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;

        navigator.clipboard.writeText(url).then(() => {
            setShowShareModal(true);
        }).catch(err => {
            console.error("Failed to copy", err);
            alert("No se pudo copiar el enlace. Intenta manualmente.");
        });
    };

    const handleDrop = (day, exercise) => {
        setRoutineExercises((prev) => {
            const currentExercises = prev[day] || [];
            if (currentExercises.some(ex => ex.name === exercise.name)) return prev;

            return {
                ...prev,
                [day]: [...currentExercises, exercise]
            };
        });
    };

    const handleRemove = (day, index) => {
        setRoutineExercises((prev) => {
            const current = prev[day] || [];
            return {
                ...prev,
                [day]: current.filter((_, i) => i !== index)
            };
        });
    };

    const handleAutoFill = () => {
        const newRoutine = {};

        daysSelected.forEach((day, index) => {
            const splitType = routineSplits[index].toLowerCase();
            const requirements = getSplitRequirements(splitType);
            let dayExercises = [];

            if (requirements.length > 0) {
                // Smart Fill based on goals
                requirements.forEach(req => {
                    // Filter exercises that match the split AND the specific muscle
                    const candidates = exercises.filter(ex => {
                        const typeMatch = splitType.includes(ex.type) || (splitType === "full body" && ex.type === "full body");
                        // Loose muscle matching (e.g. "Hombros" matches "Hombro")
                        const muscleMatch = ex.muscle.toLowerCase().includes(req.muscle.toLowerCase()) || req.muscle.toLowerCase().includes(ex.muscle.toLowerCase());
                        return typeMatch && muscleMatch;
                    });

                    // Shuffle and pick
                    const shuffled = candidates.sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, req.count);
                    dayExercises = [...dayExercises, ...selected];
                });
            } else {
                // Fallback: Random exercises matching split type
                const matches = exercises.filter(ex =>
                    splitType.includes(ex.type) || (splitType === "full body" && ex.type === "full body")
                );
                dayExercises = matches.sort(() => 0.5 - Math.random()).slice(0, 6);
            }

            // Remove potential duplicates if any (though logic shouldn't produce them usually)
            newRoutine[day] = [...new Map(dayExercises.map(item => [item.name, item])).values()];
        });

        setRoutineExercises(newRoutine);
    };

    const handleClearClick = () => {
        setShowClearConfirm(true);
    };

    const confirmClear = () => {
        setRoutineExercises({});
        setShowClearConfirm(false);
    };

    // Mobile Logic
    const handleAddManually = (day, split) => {
        setActiveAddDay({ day, split });
    };

    const handleExerciseClick = (exercise) => {
        if (!activeAddDay) return;
        handleDrop(activeAddDay.day, exercise);
        setActiveAddDay(null); // Close modal after adding
    };

    const hasExercises = Object.values(routineExercises).some(day => day && day.length > 0);

    const splitTranslations = {
        "Push": "Empuje",
        "Pull": "Tracción",
        "Legs": "Pierna",
        "Upper": "Torso",
        "Lower": "Pierna",
        "Full Body": "Full Body",
        "Cardio": "Cardio",
        "Push A": "Empuje A",
        "Pull A": "Tracción A",
        "Legs A": "Pierna A",
        "Push B": "Empuje B",
        "Pull B": "Tracción B",
        "Legs B": "Pierna B",
        "General": "General"
    };

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 relative">
            {/* Share Success Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-8 max-w-md w-full shadow-2xl shadow-green-900/20 transform animate-in zoom-in-95 duration-200 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-teko text-white mb-2 tracking-wide">¡ENLACE COPIADO!</h3>
                        <p className="text-zinc-400 font-inter mb-8">
                            Tu rutina ha sido guardada en un enlace mágico. Compártela con quien quieras.
                        </p>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold font-teko tracking-wider text-xl transition-all shadow-lg shadow-green-900/20"
                        >
                            ENTENDIDO
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Modal for Clear Confirmation */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl transform animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-teko text-white mb-2">¿LIMPIAR TODA LA RUTINA?</h3>
                        <p className="text-zinc-400 font-inter mb-6">
                            Esta acción eliminará todos los ejercicios asignados a los días seleccionados. No se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors font-medium font-inter text-sm"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={confirmClear}
                                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold font-teko tracking-wide transition-colors"
                            >
                                SÍ, LIMPIAR TODO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Exercise Picker Modal */}
            {activeAddDay && (
                <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 animate-in slide-in-from-bottom-10 duration-200 lg:hidden">
                    <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900">
                        <div>
                            <h3 className="text-white font-teko text-xl">AÑADIR A {activeAddDay.day.toUpperCase()}</h3>
                            <span className="text-xs text-green-500 uppercase tracking-widest">
                                {splitTranslations[activeAddDay.split] || activeAddDay.split}
                            </span>
                        </div>
                        <button
                            onClick={() => setActiveAddDay(null)}
                            className="text-zinc-400 hover:text-white p-2"
                        >
                            ✕ CERRAR
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4">
                        <ExerciseList
                            splits={[activeAddDay.split]} // Logic still needs english
                            onExerciseClick={handleExerciseClick}
                        />
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="text-center mb-16 mt-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-7xl md:text-9xl font-bold font-teko text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600 tracking-wide uppercase italic leading-[0.85] mb-4">
                    CONSTRUYE TU <span className="text-green-500">LEGADO</span>
                </h1>
                <p className="text-zinc-400 font-inter text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Diseña tu microciclo de hipertrofia en segundos.
                    <span className="block sm:inline text-green-500/80"> Sin registros. Sin pagos. Solo ganancias.</span>
                </p>
                <div className="h-1 w-24 bg-green-500 mx-auto mt-8 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
            </div>

            <DaySelector onChange={setDaysSelected} />

            {daysSelected.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                    <button
                        onClick={handleClearClick}
                        className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 px-3 py-2 rounded-lg font-bold font-teko tracking-wide transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                        title="Limpiar Rutina"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                        <span className="text-xs sm:text-base">LIMPIAR</span>
                    </button>

                    <button
                        onClick={handleShare}
                        disabled={!hasExercises}
                        className={`text-white px-3 py-2 rounded-lg font-bold font-teko tracking-wide transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-purple-900/20
                            ${!hasExercises
                                ? "bg-zinc-700 cursor-not-allowed opacity-50"
                                : "bg-purple-600 hover:bg-purple-500"}`}
                        title="Compartir Enlace"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        <span className="text-xs sm:text-base">COMPARTIR</span>
                    </button>

                    <button
                        onClick={handleAutoFill}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-bold font-teko tracking-wide transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 shadow-lg shadow-green-900/20"
                        title="Auto-Rellenar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-8 2 8h7l-9 8-2-8H5z" /></svg>
                        <span className="text-xs sm:text-base">AUTO-RELLENAR</span>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                <div className="lg:col-span-8">
                    <div ref={routineRef} className="bg-zinc-950 p-8 rounded-xl border border-zinc-800 shadow-2xl relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-zinc-800 pb-4 relative z-10 w-full gap-4 sm:gap-0">
                            <div>
                                <h2 className="text-6xl sm:text-8xl font-bold font-teko text-white tracking-wide uppercase italic leading-none">
                                    MI <span className="text-green-500">RUTINA</span>
                                </h2>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0">
                                <span className="text-zinc-500 font-inter text-[10px] tracking-widest uppercase block mb-1">FRECUENCIA</span>
                                <div className="inline-flex items-baseline gap-2 bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800">
                                    <span className="text-white font-bold font-teko text-3xl leading-none">{daysSelected.length}</span>
                                    <span className="text-zinc-500 font-teko text-xl uppercase">DÍAS / SEM</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <RoutinePreview
                                selectedDays={daysSelected}
                                routineSplits={routineSplits}
                                routineExercises={routineExercises}
                                onDropExercise={handleDrop}
                                onRemoveExercise={handleRemove}
                                onAddManually={handleAddManually}
                            />
                        </div>

                        <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/80 backdrop-blur-sm p-4 rounded-lg relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-zinc-400 text-xs font-inter tracking-wider uppercase whitespace-nowrap">Creado con Hypertro App</span>
                            </div>
                            <span className="text-white font-teko tracking-[0.2em] text-lg pr-2 whitespace-nowrap">HYPERTRO.APP</span>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block lg:col-span-4">
                    <div className="sticky top-24">
                        <ExerciseList splits={routineSplits} />
                    </div>
                </div>
            </div>
        </div>
    );
}
