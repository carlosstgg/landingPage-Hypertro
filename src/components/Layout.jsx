export default function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
            <main className="flex-grow">
                {children}
            </main>
            <footer className="border-t border-zinc-900 py-12 bg-zinc-950">
                <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-center text-center">
                    <p className="text-zinc-500 font-teko text-xl tracking-wide mb-2">
                        CONSTRUYE TU LEGADO
                    </p>
                    <p className="text-zinc-600 font-inter text-sm mb-6">
                        por <a href="https://www.instagram.com/gallegosgtzz/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-green-500 transition-colors cursor-pointer">Carlos Gallegos</a>
                    </p>

                    <a href="https://buymeacoffee.com/carlosgallegos" target="_blank" rel="noopener noreferrer" className="nav-item group flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black text-yellow-500 px-4 py-2 rounded-full transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                        <span className="font-teko font-bold tracking-wide text-lg pt-0.5">INVÍTAME UN CAFÉ</span>
                    </a>
                </div>
            </footer>
        </div>
    );
}
