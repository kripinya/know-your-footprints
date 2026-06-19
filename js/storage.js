/**
 * Storage Module — LocalStorage abstraction for persistent data.
 * Manages user profile, footprint history, challenge progress, and settings.
 * 
 * @module Storage
 */

const Storage = (() => {
    "use strict";
    const KEYS = {
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
    /**
     * Get the user profile.
     * @returns {Object|null}
     */
    function getProfile() {
        return get(KEYS.PROFILE, null);
    }

    /**
     * Save the user profile.
     * @param {Object} profile
     */
    function saveProfile(profile) {
        set(KEYS.PROFILE, {
            ...profile,
            updatedAt: new Date().toISOString(),
        });
    }

    // ========== Footprint ==========
    /**
     * Get the user footprint.
     * @returns {Object|null}
     */
    function getFootprint() {
        return get(KEYS.FOOTPRINT, null);
    }

    /**
     * Save the user footprint.
     * @param {Object} footprint
     */
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
    /**
     * Get footprint history.
     * @returns {Array}
     */
    function getHistory() {
        return get(KEYS.HISTORY, []);
    }

    /**
     * Clear footprint history.
     */
    function clearHistory() {
        set(KEYS.HISTORY, []);
    }

    // ========== Challenges ==========
    /**
     * Get challenge data.
     * @returns {Object}
     */
    function getChallengeData() {
        return get(KEYS.CHALLENGES, {
            completed: [],
            streak: 0,
            points: 0,
            lastActivity: null,
            badges: [],
        });
    }

    /**
     * Save challenge data.
     * @param {Object} data
     */
    function saveChallengeData(data) {
        set(KEYS.CHALLENGES, data);
    }

    // ========== Settings ==========
    /**
     * Get app settings.
     * @returns {Object}
     */
    function getSettings() {
        return get(KEYS.SETTINGS, {
            units: 'metric',
            notifications: true,
        });
    }

    /**
     * Save app settings.
     * @param {Object} settings
     */
    function saveSettings(settings) {
        set(KEYS.SETTINGS, settings);
    }

    // ========== Clear All ==========
    /**
     * Clear all storage.
     */
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
