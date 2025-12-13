import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ email: '', password: '', username: '' });

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await signIn({
                    email: form.email,
                    password: form.password,
                });
                if (error) throw error;
                navigate('/'); // Redirigir al home tras login
            } else {
                const { error } = await signUp({
                    email: form.email,
                    password: form.password,
                    options: {
                        data: {
                            full_name: form.username, // Se guardará en metadata y luego en profiles por el trigger
                        },
                    },
                });
                if (error) throw error;
                alert('¡Registro exitoso! Revisa tu correo para confirmar (si está activado) o inicia sesión.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 font-inter">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

                <h2 className="text-3xl font-teko text-white font-semibold text-center mb-2 uppercase tracking-wide">
                    {isLogin ? 'Bienvenido de nuevo' : 'Únete al Legado'}
                </h2>
                <p className="text-zinc-500 text-center mb-8 text-sm">
                    {isLogin ? 'Accede a tus rutinas y estadísticas.' : 'Comienza tu viaje de transformación hoy.'}
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center animate-in fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs uppercase text-zinc-500 mb-1 font-bold tracking-wider">Usuario</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Ej. Sparta300"
                                value={form.username}
                                onChange={handleChange}
                                required={!isLogin}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-zinc-700"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs uppercase text-zinc-500 mb-1 font-bold tracking-wider">Correo</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-zinc-700"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-zinc-500 mb-1 font-bold tracking-wider">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-zinc-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase tracking-wide font-teko text-xl"
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-zinc-500 hover:text-white text-sm transition-colors underline decoration-zinc-700 underline-offset-4"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
