export function generateSplit(selectedDays) {
    const count = selectedDays.length;

    if (count === 0) return [];

    let split = [];

    switch (selectedDays.length) {
        case 1:
            split = ["Full Body"];
            break;
        case 2:
            split = ["Upper", "Lower"];
            break;
        case 3:
            split = ["Push", "Pull", "Legs"];
            break;
        case 4:
            split = ["Upper", "Lower", "Push", "Pull"];
            break;
        case 5:
            split = ["Push", "Pull", "Legs", "Upper", "Lower"];
            break;
        case 6:
            split = ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"];
            break;
        case 7:
            split = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Cardio"];
            break;
        default:
            split = Array(selectedDays.length).fill("General");
    }

    return split;
}

export function getSplitRequirements(splitType) {
    const lower = splitType.toLowerCase();

    if (lower.includes("push")) {
        return [
            { muscle: "Pectoral", count: 2 },
            { muscle: "Hombros", count: 2 },
            { muscle: "Tríceps", count: 2 }
        ];
    }
    if (lower.includes("pull")) {
        return [
            { muscle: "Espalda", count: 3 },
            { muscle: "Hombros", count: 1 }, // Rear delts primarily
            { muscle: "Bíceps", count: 2 }
        ];
    }
    if (lower.includes("legs")) {
        return [
            { muscle: "Cuádriceps", count: 2 },
            { muscle: "Isquios", count: 2 },
            { muscle: "Gemelos", count: 2 }
        ];
    }
    if (lower === "upper") {
        return [
            { muscle: "Pectoral", count: 2 },
            { muscle: "Espalda", count: 2 },
            { muscle: "Hombros", count: 2 },
            { muscle: "Bíceps", count: 1 },
            { muscle: "Tríceps", count: 1 }
        ];
    }
    if (lower === "lower") {
        return [
            { muscle: "Cuádriceps", count: 2 },
            { muscle: "Isquios", count: 2 },
            { muscle: "Glúteo", count: 1 },
            { muscle: "Gemelos", count: 1 }
        ];
    }
    if (lower === "full body") {
        return [
            { muscle: "Pectoral", count: 1 },
            { muscle: "Espalda", count: 1 },
            { muscle: "Hombros", count: 1 },
            { muscle: "Piernas", count: 1 }, // Specific full body leg exercises
            { muscle: "Cadena Posterior", count: 1 }
        ];
    }

    return [];
}

export function indexToSuggestion(splitType) {
    const reqs = getSplitRequirements(splitType);
    if (reqs.length === 0) return "Selecciona ejercicios variados";

    return reqs.map(r => `${r.muscle} (${r.count})`).join(", ");
}