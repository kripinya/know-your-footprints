/**
 * Challenges Module — Gamified eco-challenges with streak tracking and badges.
 * 
 * @module Challenges
 */

const Challenges = (() => {
    /**
     * Daily challenge catalog.
     */
    const DAILY_CHALLENGES = [
        {
            id: 'walk_10min',
            emoji: '🚶',
            name: 'Walk for 10 Minutes',
            description: 'Replace a short car/ride trip with walking today.',
            points: 15,
            co2Saved: 0.002,
        },
        {
            id: 'no_meat_day',
            emoji: '🥗',
            name: 'Meat-Free Day',
            description: 'Eat only plant-based meals for the entire day.',
            points: 25,
            co2Saved: 0.007,
        },
        {
            id: 'short_shower',
            emoji: '🚿',
            name: '5-Minute Shower',
            description: 'Keep your shower under 5 minutes to save water and energy.',
            points: 10,
            co2Saved: 0.001,
        },
        {
            id: 'unplug_devices',
            emoji: '🔌',
            name: 'Unplug Standby Devices',
            description: 'Unplug all devices that are on standby before bed.',
            points: 10,
            co2Saved: 0.001,
        },
        {
            id: 'reusable_bottle',
            emoji: '🫗',
            name: 'Use Reusable Bottle',
            description: 'Carry and use only a reusable water bottle today.',
            points: 10,
            co2Saved: 0.0005,
        },
        {
            id: 'no_plastic',
            emoji: '🚫',
            name: 'Zero Single-Use Plastic',
            description: 'Avoid all single-use plastics for the entire day.',
            points: 20,
            co2Saved: 0.001,
        },
        {
            id: 'lights_off',
            emoji: '💡',
            name: 'Lights-Off Hour',
            description: 'Turn off all unnecessary lights for at least 1 hour.',
            points: 10,
            co2Saved: 0.0008,
        },
        {
            id: 'take_stairs',
            emoji: '🪜',
            name: 'Take the Stairs',
            description: 'Use stairs instead of elevators today.',
            points: 15,
            co2Saved: 0.0003,
        },
        {
            id: 'eat_local',
            emoji: '🏪',
            name: 'Eat Local Today',
            description: 'Choose only locally sourced food for all meals.',
            points: 20,
            co2Saved: 0.003,
        },
        {
            id: 'digital_detox',
            emoji: '📵',
            name: 'Digital Detox Hour',
            description: 'Spend 1 hour screen-free (no phone, no computer).',
            points: 15,
            co2Saved: 0.0001,
        },
        {
            id: 'cold_wash',
            emoji: '🧊',
            name: 'Cold Water Laundry',
            description: 'Wash your clothes in cold water instead of hot.',
            points: 10,
            co2Saved: 0.002,
        },
        {
            id: 'compost',
            emoji: '🍂',
            name: 'Compost Food Scraps',
            description: 'Compost your food waste instead of throwing it in the trash.',
            points: 15,
            co2Saved: 0.001,
        },
    ];

    /**
     * Weekly challenge catalog.
     */
    const WEEKLY_CHALLENGES = [
        {
            id: 'car_free_week',
            emoji: '🚲',
            name: 'Car-Free Week',
            description: 'Don\'t use a private car for the entire week. Use public transport, bike, or walk.',
            points: 100,
            co2Saved: 0.04,
        },
        {
            id: 'vegan_week',
            emoji: '🌱',
            name: 'Vegan Week',
            description: 'Eat only plant-based meals for 7 days straight.',
            points: 120,
            co2Saved: 0.05,
        },
        {
            id: 'no_buy_week',
            emoji: '🛍️',
            name: 'No-Buy Week',
            description: 'Don\'t purchase any non-essential items for a week.',
            points: 80,
            co2Saved: 0.02,
        },
        {
            id: 'zero_waste_week',
            emoji: '♻️',
            name: 'Zero Waste Week',
            description: 'Minimize waste to near zero — recycle, compost, refuse packaging.',
            points: 150,
            co2Saved: 0.015,
        },
        {
            id: 'public_transport_week',
            emoji: '🚇',
            name: 'Public Transport Only',
            description: 'Use only public transportation for all commutes this week.',
            points: 90,
            co2Saved: 0.03,
        },
        {
            id: 'energy_save_week',
            emoji: '⚡',
            name: 'Energy Saver Week',
            description: 'Reduce energy consumption by 20% — shorter showers, lights off, unplug devices.',
            points: 100,
            co2Saved: 0.02,
        },
        {
            id: 'cook_home_week',
            emoji: '🍳',
            name: 'Home Cooking Week',
            description: 'Cook all meals at home using fresh, local ingredients. No takeout or delivery.',
            points: 80,
            co2Saved: 0.015,
        },
        {
            id: 'plant_something',
            emoji: '🌿',
            name: 'Plant a Tree or Garden',
            description: 'Plant at least one tree, herb, or start a small garden this week.',
            points: 120,
            co2Saved: 0.01,
        },
    ];

    /**
     * Badge catalog.
     */
    const BADGES = [
        { id: 'first_step', icon: '🌱', name: 'First Step', requirement: 'Complete your first challenge', check: (data) => data.completed.length >= 1 },
        { id: 'eco_starter', icon: '🌿', name: 'Eco Starter', requirement: 'Complete 5 challenges', check: (data) => data.completed.length >= 5 },
        { id: 'green_warrior', icon: '⚔️', name: 'Green Warrior', requirement: 'Complete 15 challenges', check: (data) => data.completed.length >= 15 },
        { id: 'eco_champion', icon: '🏆', name: 'Eco Champion', requirement: 'Complete 30 challenges', check: (data) => data.completed.length >= 30 },
        { id: 'streak_3', icon: '🔥', name: 'On Fire', requirement: '3-day streak', check: (data) => data.streak >= 3 },
        { id: 'streak_7', icon: '💎', name: 'Week Warrior', requirement: '7-day streak', check: (data) => data.streak >= 7 },
        { id: 'streak_30', icon: '👑', name: 'Monthly Master', requirement: '30-day streak', check: (data) => data.streak >= 30 },
        { id: 'points_100', icon: '💯', name: 'Century Club', requirement: 'Earn 100 eco points', check: (data) => data.points >= 100 },
        { id: 'points_500', icon: '🌟', name: 'Star Saver', requirement: 'Earn 500 eco points', check: (data) => data.points >= 500 },
        { id: 'points_1000', icon: '🌍', name: 'Planet Protector', requirement: 'Earn 1000 eco points', check: (data) => data.points >= 1000 },
        { id: 'calculator', icon: '🧮', name: 'Self-Aware', requirement: 'Complete the carbon calculator', check: () => Storage.getFootprint() !== null },
        { id: 'chat_explorer', icon: '🤖', name: 'Bot Friend', requirement: 'Chat with EcoBot 5 times', check: (data) => (data.chatCount || 0) >= 5 },
    ];

    /**
     * Get today's daily challenges (3 pseudo-random based on date).
     * @returns {Array} Today's challenges.
     */
    function getDailyChallenges() {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        // Use seed to create a deterministic but varied selection
        const shuffled = [...DAILY_CHALLENGES].sort((a, b) => {
            const hashA = simpleHash(a.id + seed);
            const hashB = simpleHash(b.id + seed);
            return hashA - hashB;
        });

        return shuffled.slice(0, 5);
    }

    /**
     * Get current weekly challenges (2 based on week number).
     * @returns {Array} This week's challenges.
     */
    function getWeeklyChallenges() {
        const today = new Date();
        const weekNum = Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        const shuffled = [...WEEKLY_CHALLENGES].sort((a, b) => {
            const hashA = simpleHash(a.id + weekNum);
            const hashB = simpleHash(b.id + weekNum);
            return hashA - hashB;
        });

        return shuffled.slice(0, 3);
    }

    /**
     * Simple hash function for deterministic pseudo-randomness.
     * @param {string} str - Input string.
     * @returns {number} Hash value.
     */
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Complete a challenge.
     * @param {string} challengeId - The challenge ID.
     * @param {number} points - Points earned.
     * @param {number} co2Saved - CO2 saved in tons.
     * @returns {Object} Updated challenge data.
     */
    function completeChallenge(challengeId, points, co2Saved) {
        const data = Storage.getChallengeData();
        
        // Check if already completed today
        const today = new Date().toDateString();
        const alreadyDone = data.completed.some(
            c => c.id === challengeId && new Date(c.date).toDateString() === today
        );

        if (alreadyDone) return { ...data, alreadyDone: true };

        // Add completion
        data.completed.push({
            id: challengeId,
            date: new Date().toISOString(),
            points,
            co2Saved,
        });

        // Update points
        data.points += points;

        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const hadActivityYesterday = data.lastActivity && 
            new Date(data.lastActivity).toDateString() === yesterday.toDateString();
        const hadActivityToday = data.lastActivity && 
            new Date(data.lastActivity).toDateString() === today;

        if (!hadActivityToday) {
            if (hadActivityYesterday) {
                data.streak += 1;
            } else if (!data.lastActivity) {
                data.streak = 1;
            } else {
                data.streak = 1; // Reset streak
            }
        }

        data.lastActivity = new Date().toISOString();

        // Check for new badges
        const newBadges = checkNewBadges(data);
        data.badges = [...new Set([...data.badges, ...newBadges])];

        Storage.saveChallengeData(data);

        return {
            ...data,
            newBadges: newBadges.filter(b => !data.badges.includes(b) || newBadges.includes(b)),
        };
    }

    /**
     * Check for newly earned badges.
     * @param {Object} data - Challenge data.
     * @returns {string[]} Array of newly earned badge IDs.
     */
    function checkNewBadges(data) {
        return BADGES
            .filter(badge => badge.check(data) && !data.badges.includes(badge.id))
            .map(badge => badge.id);
    }

    /**
     * Render daily challenges in the UI.
     */
    function renderDaily() {
        const container = document.getElementById('dailyChallengeList');
        if (!container) return;

        const challenges = getDailyChallenges();
        const data = Storage.getChallengeData();
        const today = new Date().toDateString();

        container.innerHTML = challenges.map(challenge => {
            const isCompleted = data.completed.some(
                c => c.id === challenge.id && new Date(c.date).toDateString() === today
            );

            return `
                <div class="challenge-item ${isCompleted ? 'completed' : ''}" data-id="${challenge.id}">
                    <span class="challenge-emoji">${challenge.emoji}</span>
                    <div class="challenge-info">
                        <div class="challenge-name">${challenge.name}</div>
                        <div class="challenge-desc">${challenge.description}</div>
                        <div class="challenge-meta">
                            <span class="challenge-points">⭐ ${challenge.points} pts</span>
                            <span class="challenge-co2">🌱 -${(challenge.co2Saved * 1000).toFixed(0)}g CO₂</span>
                        </div>
                    </div>
                    <div class="challenge-action">
                        <button class="challenge-check" 
                                data-challenge="${challenge.id}" 
                                data-points="${challenge.points}" 
                                data-co2="${challenge.co2Saved}"
                                aria-label="Complete challenge: ${challenge.name}"
                                ${isCompleted ? 'disabled' : ''}>
                            ${isCompleted ? '✓' : ''}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render weekly challenges in the UI.
     */
    function renderWeekly() {
        const container = document.getElementById('weeklyChallengeList');
        if (!container) return;

        const challenges = getWeeklyChallenges();
        const data = Storage.getChallengeData();

        // Check if completed this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        container.innerHTML = challenges.map(challenge => {
            const isCompleted = data.completed.some(
                c => c.id === challenge.id && new Date(c.date) >= weekStart
            );

            return `
                <div class="challenge-item ${isCompleted ? 'completed' : ''}" data-id="${challenge.id}">
                    <span class="challenge-emoji">${challenge.emoji}</span>
                    <div class="challenge-info">
                        <div class="challenge-name">${challenge.name}</div>
                        <div class="challenge-desc">${challenge.description}</div>
                        <div class="challenge-meta">
                            <span class="challenge-points">⭐ ${challenge.points} pts</span>
                            <span class="challenge-co2">🌱 -${(challenge.co2Saved * 1000).toFixed(0)}g CO₂</span>
                        </div>
                    </div>
                    <div class="challenge-action">
                        <button class="challenge-check" 
                                data-challenge="${challenge.id}" 
                                data-points="${challenge.points}" 
                                data-co2="${challenge.co2Saved}"
                                aria-label="Complete challenge: ${challenge.name}"
                                ${isCompleted ? 'disabled' : ''}>
                            ${isCompleted ? '✓' : ''}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render badges grid in the UI.
     */
    function renderBadges() {
        const container = document.getElementById('badgesGrid');
        if (!container) return;

        const data = Storage.getChallengeData();

        container.innerHTML = BADGES.map(badge => {
            const earned = data.badges.includes(badge.id) || badge.check(data);
            return `
                <div class="badge-card ${earned ? 'earned' : 'locked'}">
                    <span class="badge-icon">${badge.icon}</span>
                    <span class="badge-name">${badge.name}</span>
                    <span class="badge-req">${badge.requirement}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Update the gamification stats bar.
     */
    function updateStats() {
        const data = Storage.getChallengeData();
        
        document.getElementById('streakCount').textContent = data.streak || 0;
        document.getElementById('ecoPoints').textContent = data.points || 0;
        document.getElementById('completedChallenges').textContent = data.completed.length || 0;
        document.getElementById('badgeCount').textContent = data.badges.length || 0;
    }

    /**
     * Render all challenge views.
     */
    function renderAll() {
        renderDaily();
        renderWeekly();
        renderBadges();
        updateStats();
    }

    return {
        getDailyChallenges,
        getWeeklyChallenges,
        completeChallenge,
        renderDaily,
        renderWeekly,
        renderBadges,
        renderAll,
        updateStats,
        BADGES,
    };
})();
