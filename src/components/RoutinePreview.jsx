import React from "react";
import { indexToSuggestion } from "../utils/routineLogic";

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

const dayTranslations = {
    "Mon": "LUN",
    "Tue": "MAR",
    "Wed": "MIÉ",
    "Thu": "JUE",
    "Fri": "VIE",
    "Sat": "SÁB",
    "Sun": "DOM"
};

const RoutinePreview = ({ selectedDays, routineSplits, routineExercises = {}, onDropExercise, onRemoveExercise, onUpdateExercise, onAddManually, className }) => {
    const [errorDay, setErrorDay] = React.useState(null);

    const gridClasses = className || "grid grid-cols-1 md:grid-cols-2 gap-6";
    // ... (rest of code)

    // Note: I will only replace the list item rendering part
    return (
        <div className={gridClasses}>
            {selectedDays.map((day, index) => {
                const dayExercises = routineExercises[day] || [];
                const splitType = routineSplits[index];
                const displaySplit = splitTranslations[splitType] || splitType;
                const displayDay = dayTranslations[day] || day;
                const isError = errorDay === day;

                return (
                    // ... (container div)
                    <div
                        key={day}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            // ... (drop logic kept same, handled by outer scope usually)
                            e.preventDefault();
                            const data = e.dataTransfer.getData("application/json");
                            if (data) {
                                const exercise = JSON.parse(data);
                                const normalizeSplit = splitType.toLowerCase();
                                const normalizeType = exercise.type.toLowerCase();
                                const isValid = normalizeSplit.includes(normalizeType) || (normalizeSplit === "full body" && normalizeType === "full body");

                                if (isValid) {
                                    onDropExercise(day, exercise);
                                } else {
                                    triggerError(day);
                                }
                            }
                        }}
                        className={`bg-zinc-900 border rounded-xl p-5 shadow-lg group transition-all duration-200 flex flex-col h-full relative
                            ${isError
                                ? "border-red-500 ring-2 ring-red-500/20 translate-x-[-4px] translate-y-[-4px]"
                                : "border-zinc-800 hover:border-green-500/50"
                            }
                        `}
                    >
                        <div className="flex flex-col mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-white text-2xl font-teko tracking-wide uppercase">
                                        {displayDay}
                                    </h2>
                                    <button
                                        onClick={() => onAddManually && onAddManually(day, splitType)}
                                        className="md:hidden flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-black transition-colors"
                                        title="Añadir ejercicio"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                        </svg>
                                    </button>
                                </div>
                                <span className="text-green-400 font-medium text-sm bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                    {displaySplit}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-xs font-inter italic">
                                Meta: {indexToSuggestion(splitType)}
                            </p>
                        </div>

                        <div className={`flex-grow rounded-lg p-3 border ${dayExercises.length > 0 ? 'bg-transparent border-transparent' : 'bg-zinc-950/50 border-zinc-800/50 border-dashed'} transition-all`}>
                            {dayExercises.length > 0 ? (
                                <ul className="space-y-2">
                                    {dayExercises.map((ex, i) => (
                                        <li key={i} className="group/item flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded text-sm text-gray-300 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300 hover:border-zinc-700 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{ex.name}</span>
                                                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{ex.muscle}</span>
                                                </div>
                                                <button
                                                    onClick={() => onRemoveExercise && onRemoveExercise(day, i)}
                                                    className="opacity-0 group-hover/item:opacity-100 text-zinc-600 hover:text-red-500 p-1 rounded transition-all font-bold -mt-1 -mr-1"
                                                    title="Eliminar"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            {/* Sets & Reps Inputs */}
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center relative gap-1">
                                                    <span className="text-[10px] text-zinc-600 uppercase font-bold">SETS</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        placeholder="3"
                                                        value={ex.sets || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '' || /^\d+$/.test(val)) {
                                                                onUpdateExercise(day, i, 'sets', val);
                                                            }
                                                        }}
                                                        className="w-8 bg-zinc-900 border border-zinc-800 rounded px-1 py-0.5 text-center text-white text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none hover:bg-zinc-800 transition-colors"
                                                    />
                                                </div>
                                                <span className="text-zinc-600 text-xs">x</span>
                                                <div className="flex items-center relative gap-1 flex-grow">
                                                    <span className="text-[10px] text-zinc-600 uppercase font-bold">REPS</span>
                                                    <input
                                                        type="text"
                                                        placeholder="8-12"
                                                        value={ex.reps || ''}
                                                        onChange={(e) => onUpdateExercise(day, i, 'reps', e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-white text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none hover:bg-zinc-800 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full min-h-[160px] flex items-center justify-center text-zinc-600 text-center">
                                    <p className="font-inter text-sm">
                                        Arrastra ejercicios de <strong className="text-green-500/80 uppercase">{displaySplit}</strong> aquí
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RoutinePreview;
