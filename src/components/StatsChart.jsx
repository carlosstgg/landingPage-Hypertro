import React, { useMemo } from 'react';

const StatsChart = ({ logs }) => {
    // Process data for the charts
    const chartData = useMemo(() => {
        if (!logs) return [];

        const weeks = {};
        const today = new Date();

        // Helper to get Monday of the week for a given date
        const getStartOfWeek = (d) => {
            const date = new Date(d);
            const day = date.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
            // Calculate difference to get to Monday.
            // If day is Sunday (0), we want to go back 6 days to get to Monday of the previous week.
            // Otherwise, we go back (day - 1) days to get to Monday of the current week.
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            date.setDate(diff);
            date.setHours(0, 0, 0, 0); // Set to start of the day
            return date;
        };

        // Initialize last 12 weeks
        // Start from "This Week's Monday"
        const currentMonday = getStartOfWeek(today);

        for (let i = 0; i < 12; i++) {
            const d = new Date(currentMonday);
            d.setDate(d.getDate() - (i * 7));

            const key = d.toISOString().split('T')[0]; // YYYY-MM-DD of Monday
            weeks[key] = {
                weekLabel: `${d.getDate()}/${d.getMonth() + 1}`,
                workouts: 0,
                volume: 0,
                order: i // 0 is current week
            };
        }

        logs.forEach(log => {
            if (!log.date) return;

            // Treat string YYYY-MM-DD as Local Date to match 'startOfWeek' logic
            // (Splitting avoids UTC shift from new Date("YYYY-MM-DD"))
            const parts = log.date.split('-');
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Month is 0-indexed
            const day = parseInt(parts[2]);
            const logDate = new Date(year, month, day);

            const monday = getStartOfWeek(logDate);
            const key = monday.toISOString().split('T')[0];

            if (weeks[key]) {
                weeks[key].workouts += 1;

                // Calculate volume
                if (log.exercises) {
                    Object.values(log.exercises).forEach(sets => {
                        if (Array.isArray(sets)) {
                            sets.forEach(set => {
                                if (set.completed && set.weight && set.reps) {
                                    weeks[key].volume += (Number(set.weight) * Number(set.reps));
                                }
                            });
                        }
                    });
                }
            }
        });

        // Convert to array and sort by date (oldest to newest)
        return Object.values(weeks).sort((a, b) => b.order - a.order);
    }, [logs]);

    const maxVolume = Math.max(...chartData.map(d => d.volume), 100); // Min 100 to avoid div by zero
    const maxWorkouts = Math.max(...chartData.map(d => d.workouts), 3); // Min scale of 3 for visual balance

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-10 text-zinc-500 font-inter text-sm">
                No hay suficientes datos para generar estadísticas.
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* WORKOUTS CONSISTENCY CHART */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                    <h3 className="text-xl font-teko text-white uppercase tracking-wide">Constancia Semanal</h3>
                </div>

                <div className="h-48 flex items-end justify-between gap-2">
                    {chartData.map((data, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex justify-center items-end h-full">
                                <div
                                    className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 group-hover:opacity-100 ${data.workouts > 0 ? 'bg-green-500 opacity-80' : 'bg-zinc-800 opacity-30'
                                        }`}
                                    style={{
                                        height: `${(data.workouts / maxWorkouts) * 100}%`,
                                        minHeight: data.workouts > 0 ? '4px' : '2px'
                                    }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-zinc-700">
                                        {data.workouts} entrenos
                                    </div>
                                </div>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-inter uppercase tracking-widest">
                                {idx % 2 === 0 ? data.weekLabel : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* VOLUME CHART */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-teko text-white uppercase tracking-wide">Volumen de Carga (KG)</h3>
                </div>

                <div className="h-48 flex items-end justify-between gap-2">
                    {chartData.map((data, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex justify-center items-end h-full">
                                <div
                                    className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 group-hover:opacity-100 ${data.volume > 0 ? 'bg-blue-600 opacity-80' : 'bg-zinc-800 opacity-30'
                                        }`}
                                    style={{
                                        height: `${(data.volume / maxVolume) * 100}%`,
                                        minHeight: data.volume > 0 ? '4px' : '2px'
                                    }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-zinc-700">
                                        {(data.volume / 1000).toFixed(1)}k kg
                                    </div>
                                </div>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-inter uppercase tracking-widest">
                                {idx % 2 === 0 ? data.weekLabel : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsChart;
