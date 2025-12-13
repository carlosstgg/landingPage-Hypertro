import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

export default function WorkoutShareModal({ day, duration, exerciseCount, stats, onClose }) {
    const cardRef = useRef(null);
    const [generating, setGenerating] = useState(false);

    // Calculate progress percentage
    const progressPercent = stats?.neededXP === stats?.currentXP
        ? 100
        : Math.max(0, Math.min(100, ((stats?.currentXP - stats?.prevThreshold) / (stats?.neededXP - stats?.prevThreshold)) * 100)) || 0;

    const gainedXP = exerciseCount * 10; // Simple XP logic for now

    const handleShare = async () => {
        if (cardRef.current === null) return;
        setGenerating(true);

        try {
            // 1. Generate Image - High Quality (4x scaling) to ensure crisp text
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 4 });
            let shared = false;

            // 2. Try Native Sharing (Mobile)
            if (navigator.canShare && navigator.share) {
                try {
                    const blob = await (await fetch(dataUrl)).blob();
                    const file = new File([blob], 'hypertro-workout.png', { type: 'image/png' });

                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'Hypertro Workout',
                            text: `He subido a Nivel ${stats?.level || 1} en Hypertro. 🚀`,
                        });
                        shared = true;
                    }
                } catch (shareError) {
                    console.warn("Native share failed or cancelled, falling back to download:", shareError);
                    // Continue to download block
                }
            }

            // 3. Fallback: Download Image (if not shared)
            if (!shared) {
                const link = document.createElement('a');
                link.download = `hypertro-stats-${day}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error('Error generating image:', err);
            alert("Hubo un problema generar la imagen. Intenta de nuevo.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4">
            <h2 className="text-white font-teko text-3xl mb-4 uppercase text-center animate-pulse">
                ¡Entrenamiento Completado! 🏆
            </h2>

            {/* SHARED CARD PREVIEW */}
            <div className="relative mb-6 transform scale-90 sm:scale-100 shadow-2xl">
                <div
                    ref={cardRef}
                    className="w-[340px] h-[600px] bg-zinc-950 flex flex-col items-center relative overflow-hidden text-center"
                >
                    {/* Background & Patterns */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                    <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-zinc-900 to-transparent"></div>
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-green-900/20 to-transparent"></div>

                    {/* Content Container */}
                    <div className="z-10 w-full h-full flex flex-col justify-between p-6 py-8">

                        {/* Header */}
                        <div>
                            <p className="text-zinc-500 font-teko text-xl tracking-widest uppercase mb-1">
                                {stats?.username || "Usuario"}
                            </p>
                            <h1 className="text-5xl text-white font-teko uppercase leading-none">
                                {day} <span className="text-green-500">COMPLETED</span>
                            </h1>
                        </div>

                        {/* Rank Badge */}
                        <div className="my-4">
                            <div className="inline-block border border-green-500/30 bg-green-500/10 rounded-lg px-6 py-2 backdrop-blur-sm">
                                <span className="block text-[10px] text-green-400 font-bold uppercase tracking-[0.2em] mb-1">Rango Actual</span>
                                <span className="text-3xl text-white font-teko uppercase tracking-wide">
                                    {stats?.rank?.name || "RECLUTA"}
                                </span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 w-full mb-2">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-2xl text-white font-teko">🔥 {stats?.currentStreak || 0}</span>
                                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Días Racha</span>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-2xl text-green-400 font-teko">+{gainedXP} XP</span>
                                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Ganados</span>
                            </div>
                        </div>

                        {/* Level & Progress */}
                        <div className="w-full bg-zinc-900/80 border border-zinc-800 p-5 rounded-xl backdrop-blur-md">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Progreso</span>
                                <span className="text-white font-teko text-4xl leading-none">NIVEL {stats?.level || 1}</span>
                            </div>

                            <div className="h-3 bg-black rounded-full overflow-hidden border border-zinc-700/50 relative">
                                <div
                                    className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-[10px] text-zinc-500 mt-2 font-mono">
                                {Math.round(progressPercent)}% HACIA EL SIGUIENTE RANGO
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-2 border border-zinc-700">
                                <span className="text-green-500 font-bold text-xs">H</span>
                            </div>
                            <p className="text-zinc-600 text-[9px] uppercase tracking-[0.3em] font-bold">
                                HYPERTRO.APP
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full max-w-[320px]">
                <button
                    onClick={handleShare}
                    disabled={generating}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-teko text-2xl uppercase py-3 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2"
                >
                    {generating ? "Generando..." : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                            </svg>
                            Compartir Historia
                        </>
                    )}
                </button>
                <button
                    onClick={onClose}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-teko text-xl uppercase py-3 rounded-lg transition-all"
                >
                    Saltar e ir al Perfil
                </button>
            </div>
        </div>
    );
}
