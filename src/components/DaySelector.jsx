import { useState } from "react";

const weekDays = [
    { key: "Mon", label: "Lunes" },
    { key: "Tue", label: "Martes" },
    { key: "Wed", label: "Miércoles" },
    { key: "Thu", label: "Jueves" },
    { key: "Fri", label: "Viernes" },
    { key: "Sat", label: "Sábado" },
    { key: "Sun", label: "Domingo" }
];

export default function DaySelector({ onChange }) {
    const [selectedDays, setSelectedDays] = useState([]);

    const handleToggle = (key) => {
        let updated;

        if (selectedDays.includes(key)) {
            updated = selectedDays.filter((day) => day !== key);
        } else {
            updated = [...selectedDays, key];
        }

        setSelectedDays(updated);
        onChange(updated);
    };

    return (
        <div className="p-6 bg-zinc-900 rounded-xl shadow-md border border-zinc-800">
            <h2 className="font-teko text-3xl text-white mb-4 tracking-wide uppercase">Selecciona tus días de entrenamiento</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {weekDays.map((day) => (
                    <button
                        key={day.key}
                        onClick={() => handleToggle(day.key)}
                        className={`cursor-pointer px-4 py-2 rounded-lg border transition font-teko text-xl tracking-wide uppercase
              ${selectedDays.includes(day.key)
                                ? "bg-green-600 text-white border-green-600 hover:bg-green-500 hover:border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                                : "bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700"
                            }`}
                    >
                        {day.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
