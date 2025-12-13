import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

export default function WorkoutShareModal({ day, duration, exerciseCount, onClose }) {
    const cardRef = useRef(null);
    const [generating, setGenerating] = useState(false);

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
                            text: `Acabo de destruir mi entrenamiento de ${day} en Hypertro App. 🔥`,
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
                link.download = `hypertro-${day.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = dataUrl;
                link.click();
                if (navigator.canShare) {
                    // If they had share API but it failed (or files not supported), tell them we downloaded it instead.
                    // Don't annoy desktop users who expect download.
                    alert("Imagen guardada en tu galería. ¡Súbela manualmente!");
                }
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
                ¡Misión Cumplida! 🏆
            </h2>

            {/* SHARED CARD PREVIEW */}
            <div className="relative mb-6 transform scale-90 sm:scale-100 shadow-2xl">
                <div
                    ref={cardRef}
                    className="w-[320px] h-[568px] bg-zinc-950 flex flex-col items-center justify-between p-8 border-4 border-zinc-900 relative overflow-hidden"
                >
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

                    {/* Logo Area */}
                    <div className="z-10 mt-4">
                        <span className="text-4xl text-white font-bold italic tracking-tighter">
                            HYPER<span className="text-green-500">TRO</span>.APP
                        </span>
                    </div>

                    {/* Main Stats */}
                    <div className="z-10 flex flex-col items-center gap-2">
                        <h3 className="text-zinc-400 font-inter uppercase text-sm tracking-[0.2em]">Día Completado</h3>
                        <h1 className="text-green-500 font-teko text-8xl leading-none uppercase drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                            {day}
                        </h1>
                        <div className="w-16 h-1 bg-zinc-800 rounded-full mt-2"></div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="z-10 grid grid-cols-2 gap-4 w-full">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                            <span className="block text-zinc-500 text-xs font-bold uppercase mb-1">Tiempo</span>
                            <span className="text-3xl text-white font-teko">{duration}</span>
                            <span className="text-xs text-zinc-500 font-bold ml-1">MIN</span>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-center">
                            <span className="block text-zinc-500 text-xs font-bold uppercase mb-1">Volumen</span>
                            <span className="text-3xl text-white font-teko">{exerciseCount}</span>
                            <span className="text-xs text-zinc-500 font-bold ml-1">EJERCICIOS</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="z-10 text-center mb-4">
                        <p className="text-zinc-500 text-xs font-inter tracking-widest uppercase">
                            DESAFÍA TUS LÍMITES
                        </p>
                        <p className="text-green-600/50 text-[10px] mt-1">
                            hypertro.app
                        </p>
                    </div>

                    {/* Watermark/Date */}
                    <div className="absolute bottom-2 right-4 text-[9px] text-zinc-800 font-mono">
                        {new Date().toLocaleDateString()}
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
