import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="border-b border-zinc-900 bg-zinc-950 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-opacity-80">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link to="/" className="text-5xl font-bold font-teko text-white tracking-wide uppercase italic select-none cursor-pointer leading-none hover:text-green-500 transition-colors">
                    HYPER<span className="text-green-500 hover:text-white transition-colors">TRO</span>
                </Link>

                {user ? (
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 text-green-500 hover:bg-zinc-700 hover:text-green-400 transition-all border border-zinc-700 shadow-md group" title="Tu Perfil">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transform group-hover:scale-110 transition-transform">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                ) : (
                    <Link to="/auth">
                        <button className="bg-green-500 hover:bg-green-400 text-black border border-green-500 rounded-lg px-4 py-2 text-sm font-bold uppercase transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)]">
                            Entrar
                        </button>
                    </Link>
                )}
            </div>
        </nav >
    );
}
