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

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-2 text-zinc-500 font-bold tracking-wider">O continúa con</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const { error } = await signInWithGoogle();
                                if (error) throw error;
                            } catch (e) {
                                setError(e.message);
                                setLoading(false);
                            }
                        }}
                        className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-inter"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
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
