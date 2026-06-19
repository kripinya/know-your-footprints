/**
 * Storage Module — LocalStorage abstraction for persistent data.
 * Manages user profile, footprint history, challenge progress, and settings.
 * 
 * @module Storage
 */

const Storage = (() => {
    "use strict";
    const KEYS = Object.freeze({
        PROFILE: 'kyf_profile',
        FOOTPRINT: 'kyf_footprint',
        HISTORY: 'kyf_history',
        CHALLENGES: 'kyf_challenges',
        SETTINGS: 'kyf_settings',
    };

    /**
     * Safely parse JSON from localStorage.
     * @param {string} key - The localStorage key.
     * @param {*} fallback - Default value if key doesn't exist or parsing fails.
     * @returns {*} Parsed value or fallback.
     */
    function get(key, fallback = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (err) {
            console.warn(`Storage.get error for key "${key}":`, err);
            return fallback;
        }
    }

    /**
     * Save data to localStorage as JSON.
     * @param {string} key - The localStorage key.
     * @param {*} value - Data to store.
     */
    function set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn(`Storage.set error for key "${key}":`, err);
        }
    }

    /**
     * Remove a key from localStorage.
     * @param {string} key - The key to remove.
     */
    function remove(key) {
        localStorage.removeItem(key);
    }

    // ========== Profile ==========
    function getProfile() {
        return get(KEYS.PROFILE, null);
    }

    function saveProfile(profile) {
        set(KEYS.PROFILE, {
            ...profile,
            updatedAt: new Date().toISOString(),
        });
    }

    // ========== Footprint ==========
    function getFootprint() {
        return get(KEYS.FOOTPRINT, null);
    }

    function saveFootprint(footprint) {
        const data = {
            ...footprint,
            calculatedAt: new Date().toISOString(),
        };
        set(KEYS.FOOTPRINT, data);

        // Also push to history
        const history = getHistory();
        history.push({
            total: footprint.total,
            breakdown: footprint.breakdown,
            date: new Date().toISOString(),
        });
        // Keep last 50 entries
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        set(KEYS.HISTORY, history);

        return data;
    }

    // ========== History ==========
    function getHistory() {
        return get(KEYS.HISTORY, []);
    }

    function clearHistory() {
        set(KEYS.HISTORY, []);
    }

    // ========== Challenges ==========
    function getChallengeData() {
        return get(KEYS.CHALLENGES, {
            completed: [],
            streak: 0,
            points: 0,
            lastActivity: null,
            badges: [],
        });
    }

    function saveChallengeData(data) {
        set(KEYS.CHALLENGES, data);
    }

    // ========== Settings ==========
    function getSettings() {
        return get(KEYS.SETTINGS, {
            units: 'metric',
            notifications: true,
        });
    }

    function saveSettings(settings) {
        set(KEYS.SETTINGS, settings);
    }

    // ========== Clear All ==========
    function clearAll() {
        Object.values(KEYS).forEach(key => remove(key));
    }

    return {
        KEYS,
        get,
        set,
        remove,
        getProfile,
        saveProfile,
        getFootprint,
        saveFootprint,
        getHistory,
        clearHistory,
        getChallengeData,
        saveChallengeData,
        getSettings,
        saveSettings,
        clearAll,
    };
})();
