export default function Navbar() {
    return (
        <nav className="border-b border-zinc-900 bg-zinc-950 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-opacity-80">
            <div className="mx-auto flex max-w-7xl items-center justify-center">
                <h1 className="text-5xl font-bold font-teko text-white tracking-wide uppercase italic select-none cursor-pointer leading-none">
                    HYPER<span className="text-green-500">TRO</span>
                </h1>
            </div>
        </nav>
    );
}
