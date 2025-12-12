import exercises from "../data/exercises.json";

const DAYS_MAP = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Compresses the routine data to a URL-safe string.
 * Optimizes by using indices for known days and exercises.
 * Format: { d: [0, 2], r: [[1,5], [2,3]] }
 */
export const encodeRoutine = (daysSelected, routineExercises) => {
    try {
        // 1. Map days to indices (0-6)
        const dayIndices = daysSelected.map(day => DAYS_MAP.indexOf(day));

        // 2. Map routine to array of arrays, matching day order
        const exercisesList = daysSelected.map(day => {
            const dayExs = routineExercises[day] || [];
            return dayExs.map(ex => {
                const index = exercises.findIndex(e => e.name === ex.name);
                // If found, store index (int). If custom/not found, store name (string).
                return index !== -1 ? index : ex.name;
            });
        });

        const state = {
            d: dayIndices,
            r: exercisesList
        };

        const json = JSON.stringify(state);
        return btoa(json);
    } catch (e) {
        console.error("Error encoding routine:", e);
        return "";
    }
};

/**
 * Decodes the string back into app state.
 * Supports legacy format (strings) and new format (indices).
 */
export const decodeRoutine = (encodedStr) => {
    try {
        const json = atob(encodedStr);
        const state = JSON.parse(json);

        if (!state.d || !state.r) return null;

        // CHECK FORMAT VERSION
        // If d[0] is a string (e.g. "Mon"), it's the old format.
        const isLegacy = typeof state.d[0] === 'string';

        if (isLegacy) {
            // --- LEGACY DECODER ---
            const rehydratedRoutine = {};
            for (const [day, names] of Object.entries(state.r)) {
                rehydratedRoutine[day] = names.map(name => {
                    const found = exercises.find(ex => ex.name === name);
                    return found || { name, muscle: "Unknown", type: "Unknown" };
                });
            }
            return {
                daysSelected: state.d,
                routineExercises: rehydratedRoutine
            };
        } else {
            // --- NEW OPTIMIZED DECODER ---
            const daysSelected = state.d.map(index => DAYS_MAP[index] || "Unknown");
            const rehydratedRoutine = {};

            // state.r is an array conforming to state.d order
            state.r.forEach((dayExsIndices, i) => {
                const dayName = daysSelected[i];
                if (!dayName) return;

                rehydratedRoutine[dayName] = dayExsIndices.map(item => {
                    if (typeof item === 'number') {
                        // It's an index
                        const found = exercises[item];
                        return found || { name: "Unknown Exercise", muscle: "?", type: "?" };
                    } else {
                        // It's a string (custom name)
                        // Try to find it again just in case, or return dummy
                        const found = exercises.find(ex => ex.name === item);
                        return found || { name: item, muscle: "Custom", type: "General" };
                    }
                });
            });

            return {
                daysSelected,
                routineExercises: rehydratedRoutine
            };
        }

    } catch (e) {
        console.error("Error decoding routine:", e);
        return null;
    }
};
