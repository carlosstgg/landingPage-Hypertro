import React, { useState } from "react";
import exercises from "../data/exercises.json";

const ExerciseList = ({ splits, onExerciseClick }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showCustomCreator, setShowCustomCreator] = useState(false);
    const [customName, setCustomName] = useState("");
    const [customMuscle, setCustomMuscle] = useState("");

    const handleAddCustom = () => {
        if (!customName.trim()) return;

        const newExercise = {
            name: customName,
            muscle: customMuscle || "Personalizado",
            type: splits[0] ? splits[0].toLowerCase() : "general" // Infer type from context
        };

        if (onExerciseClick) {
            onExerciseClick(newExercise);
        }

        // Reset
        setCustomName("");
        setCustomMuscle("");
        setShowCustomCreator(false);
    };

    if (!splits || splits.length === 0) return null;

    // Get unique splits in lowercase to match json types
    const uniqueSplits = [...new Set(splits.map(s => s.toLowerCase()))];

    // Filter exercises that match any of the active splits logic first
    // Then filter by search term if present
    const filtered = exercises.filter(ex => {
        // 1. Split match
        const matchesSplit = uniqueSplits.includes(ex.type) ||
            (uniqueSplits.includes("full body") && ex.type === "full body") ||
            // Allow cross-pollination for "General" or if searching globally? 
            // For now keep strict to avoid errors on drop.
            // Actually, let's allow finding ANY exercise if the user is explicitly searching, 
            // BUT the drop validation in RoutinePreview might reject it?
            // RoutinePreview validation: 
            // isValid = normalizeSplit.includes(normalizeType) || (normalizeSplit === "full body" && ...)
            // So if we show a Leg exercise on Push day, drop will fail/error.
            // Better to keep strict filtering by split to prevent frustration.
            // EXCEPT: If uniqueSplits includes 'full body', it matches 'full body' type. 
            // Wait, routineLogic usually maps split names.
            // If splits are ["Push"], uniqueSplits is ["push"].
            // If I search "bicep", and "bicep" is "pull", it won't show. Correct.
            uniqueSplits.some(s => s.includes(ex.type)); // loose match for "Push A" -> "push"

        // 2. Search match
        const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.muscle.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSplit && matchesSearch;
    });

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl h-[calc(100vh-8rem)] min-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 backdrop-blur-md sticky top-0 z-20 space-y-3">
                <h2 className="text-green-400 font-teko text-2xl font-bold flex items-center justify-between">
                    <span>EJERCICIOS</span>
                    <span className="text-zinc-500 text-xs font-inter font-normal hidden sm:inline">(Arrastra a tu rutina)</span>
                </h2>

                {/* Search Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o músculo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-zinc-800 rounded-lg leading-5 bg-zinc-950 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 sm:text-sm transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar flex-grow space-y-4">
                {/* Custom Creator Section */}
                <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-lg p-3">
                    {!showCustomCreator ? (
                        <button
                            onClick={() => setShowCustomCreator(true)}
                            className="w-full text-zinc-500 hover:text-green-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 py-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            ¿No lo encuentras? Crea el tuyo
                        </button>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nombre del ejercicio..."
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none placeholder-zinc-700 font-inter"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Músculo (opcional)"
                                    value={customMuscle}
                                    onChange={(e) => setCustomMuscle(e.target.value)}
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:border-green-500 focus:outline-none placeholder-zinc-700"
                                />
                                <button
                                    onClick={handleAddCustom}
                                    disabled={!customName.trim()}
                                    className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-black px-3 py-2 rounded font-bold font-teko uppercase tracking-wide transition-colors"
                                >
                                    AÑADIR
                                </button>
                                <button
                                    onClick={() => setShowCustomCreator(false)}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-3 py-2 rounded transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {filtered.map((ex, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("application/json", JSON.stringify(ex));
                                    e.dataTransfer.effectAllowed = "copy";
                                }}
                                onClick={() => onExerciseClick && onExerciseClick(ex)}
                                className="cursor-move cursor-pointer bg-zinc-950 border border-zinc-800 p-4 rounded-lg group hover:border-green-500/50 transition-colors flex justify-between items-center active:scale-95 duration-100 shadow-sm"
                            >
                                <div>
                                    <span className="block text-white font-medium mb-1 group-hover:text-green-500 transition-colors">{ex.name}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded border border-zinc-800/50">{ex.muscle}</span>
                                </div>
                                <div className="h-6 w-6 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-sm font-bold">+</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4">
                        <p className="text-zinc-600 font-inter text-xs italic">
                            No hay resultados en la lista predefinida.<br />¡Usa el botón de arriba para crearlo!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseList;
