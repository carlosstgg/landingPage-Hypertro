import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabaseClient";
import { encodeRoutine } from "../utils/urlState";
import RoutinePreview from "../components/RoutinePreview";

import toast from 'react-hot-toast';

export default function Profile() {
    const { user } = useAuth();
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchRoutines();
        }
    }, [user]);

    const fetchRoutines = async () => {
        try {
            const { data, error } = await supabase
                .from('routines')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRoutines(data);
        } catch (error) {
            console.error('Error fetching routines:', error);
            toast.error("Error al cargar rutinas.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-zinc-900 shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-zinc-800`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">¿Borrar esta rutina?</p>
                            <p className="mt-1 text-sm text-zinc-400">Esta acción no se puede deshacer.</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-zinc-800">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeDelete(id);
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-bold text-red-500 hover:bg-zinc-800 focus:outline-none"
                    >
                        BORRAR
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
            toast.error("No se pudo borrar la rutina.");
        }
    };

    if (loading) return <div className="text-center text-white mt-20 font-teko text-2xl animate-pulse">CARGANDO LEGADO...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
            <h1 className="text-6xl font-bold font-teko text-white mb-2 uppercase">
                DESAFÍA TUS <span className="text-green-500">LÍMITES</span>
            </h1>
            <p className="text-zinc-400 font-inter mb-12">
                Bienvenido, <span className="text-white font-bold">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>. Aquí están tus planes de batalla.
            </p>

            {routines.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                    <p className="text-zinc-500 text-xl font-teko mb-4 uppercase tracking-wide">Aún no tienes rutinas guardadas</p>
                    <Link to="/" className="inline-block bg-green-500 text-black font-bold font-teko px-6 py-2 rounded text-xl hover:bg-green-400 transition-colors">
                        CREAR MI PRIMERA RUTINA
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    {routines.map((routine) => (
                        <div key={routine.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg group">
                            <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="w-full sm:w-auto">
                                    <h3 className="text-3xl font-teko text-white uppercase tracking-wide leading-none truncate">{routine.name}</h3>
                                    <span className="text-xs text-zinc-500 font-inter">
                                        Creada el {new Date(routine.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex w-full sm:w-auto gap-2">
                                    <Link
                                        to={`/workout/${routine.id}`}
                                        className="flex-1 sm:flex-none text-center bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm font-bold font-teko tracking-wide transition-all shadow-lg shadow-green-900/20 uppercase"
                                    >
                                        ENTRENAR
                                    </Link>
                                    <Link
                                        to={`/?data=${encodeRoutine(routine.structure.daysSelected, routine.structure.routineExercises)}`}
                                        className="flex-1 sm:flex-none text-center text-green-500 hover:text-white border border-green-500/20 hover:bg-green-600 px-4 py-2 rounded text-sm font-bold font-teko tracking-wide transition-all uppercase"
                                    >
                                        EDITAR
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(routine.id)}
                                        className="text-red-500 hover:text-red-400 px-3 py-2 hover:bg-red-500/10 rounded transition-colors border border-transparent hover:border-red-500/20"
                                        title="Eliminar Rutina"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Mini Preview (Just listing days) */}
                            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                                {routine.structure.daysSelected.map((day, idx) => (
                                    <div key={idx} className="bg-zinc-900 p-2 rounded text-center border border-zinc-800/50">
                                        <div className="text-xs text-zinc-500 uppercase font-bold">{day}</div>
                                        <div className="text-green-500 font-teko text-lg leading-none">
                                            {routine.structure.routineSplits[idx]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-20 flex justify-center border-t border-zinc-900 pt-8">
                <button
                    onClick={async () => {
                        const { error } = await supabase.auth.signOut();
                        if (!error) window.location.href = "/";
                    }}
                    className="text-zinc-600 hover:text-red-500 font-teko uppercase text-xl transition-colors flex items-center gap-2 group"
                >
                    Cerrar Sesión
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
