import exercises from "../data/exercises.json";

/**
 * Compresses the routine data to a URL-safe string.
 * Optimizes by validly only storing exercise names.
 */
export const encodeRoutine = (daysSelected, routineExercises) => {
    try {
        // Optimize: Only save exercise names to save space
        const optimizedRoutine = {};
        for (const [day, dayExercises] of Object.entries(routineExercises)) {
            optimizedRoutine[day] = dayExercises.map(ex => ex.name);
        }

        const state = {
            d: daysSelected, // d = days
            r: optimizedRoutine // r = routine
        };

        const json = JSON.stringify(state);
        // Base64 encode
        return btoa(json);
    } catch (e) {
        console.error("Error encoding routine:", e);
        return "";
    }
};

/**
 * Decodes the string back into app state.
 * Rehydrates exercise objects from the JSON data.
 */
export const decodeRoutine = (encodedStr) => {
    try {
        const json = atob(encodedStr);
        const state = JSON.parse(json);

        if (!state.d || !state.r) return null;

        const rehydratedRoutine = {};

        // Lookup full exercise objects
        for (const [day, names] of Object.entries(state.r)) {
            rehydratedRoutine[day] = names.map(name => {
                const found = exercises.find(ex => ex.name === name);
                // Fallback if specific exercise removed/renamed in future, preserve minimal data
                return found || { name, muscle: "Unknown", type: "Unknown" };
            });
        }

        return {
            daysSelected: state.d,
            routineExercises: rehydratedRoutine
        };

    } catch (e) {
        console.error("Error decoding routine:", e);
        return null;
    }
};
