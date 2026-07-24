/**
 * What-If Simulator — Explore lifestyle change scenarios with live recalculation.
 * @module WhatIf
 */

const WhatIf = (() => {
    "use strict";
    const SCENARIOS = [
        { id: 'vegetarian', label: 'Go Vegetarian', icon: '',
          reduction: { diet: 0.30 }, description: 'Cut meat to weekends only' },
        { id: 'vegan', label: 'Go Vegan', icon: '',
          reduction: { diet: 0.50 }, description: 'Eliminate all animal products' },
        { id: 'ev', label: 'Switch to EV', icon: '',
          reduction: { transport: 0.40 }, description: 'Replace petrol/diesel car' },
        { id: 'solar', label: 'Install Solar', icon: '',
          reduction: { energy: 0.60 }, description: 'Solar panels on your home' },
        { id: 'no_flights', label: 'No Flights', icon: '',
          reduction: { flights: 1.0 }, description: 'Cut all air travel this year' },
        { id: 'remote_work', label: 'Work From Home', icon: '',
          reduction: { transport: 0.20 }, description: '3 days remote per week' },
        { id: 'renewable_energy', label: 'Green Energy', icon: '',
          reduction: { energy: 0.80 }, description: 'Switch to renewable tariff' },
        { id: 'less_shopping', label: 'Buy Less', icon: '',
          reduction: { lifestyle: 0.30 }, description: 'Halve non-essential purchases' },
    ];

    const activeScenarios = new Set();
    let animationFrame = null;

    /**
     * Render the What-If Simulator section.
     * @param {Object} footprint - Current footprint data.
     */
    function render(footprint) {
        const container = document.getElementById('whatIfSection');
        if (!container || !footprint) return;

        container.classList.remove('hidden');

        const grid = document.getElementById('whatIfGrid');
        if (!grid) return;

        grid.innerHTML = SCENARIOS.map(scenario => `
            <div class="whatif-card ${activeScenarios.has(scenario.id) ? 'active' : ''}" 
                 data-scenario="${scenario.id}" id="whatif-${scenario.id}">
                <div class="whatif-card-header">
                    <span class="whatif-icon">${scenario.icon}</span>
                    <label class="whatif-toggle" for="toggle-${scenario.id}">
                        <input type="checkbox" id="toggle-${scenario.id}" 
                               class="whatif-checkbox" 
                               data-scenario="${scenario.id}"
                               ${activeScenarios.has(scenario.id) ? 'checked' : ''}
                               aria-label="Enable ${scenario.label} scenario">
                        <span class="whatif-slider"></span>
                    </label>
                </div>
                <h4 class="whatif-label">${scenario.label}</h4>
                <p class="whatif-desc">${scenario.description}</p>
                <div class="whatif-saving" id="saving-${scenario.id}"></div>
            </div>
        `).join('');

        // Bind toggle events
        grid.querySelectorAll('.whatif-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = e.target.dataset.scenario;
                if (e.target.checked) {
                    activeScenarios.add(id);
                } else {
                    activeScenarios.delete(id);
                }
                e.target.closest('.whatif-card').classList.toggle('active', e.target.checked);
                recalculate(footprint);
            });
        });

        // Initial calculation display
        recalculate(footprint);
    }

    /**
     * Recalculate footprint with active scenarios applied.
     * @param {Object} footprint - Current footprint data.
     */
    function recalculate(footprint) {
        if (!footprint) return;

        const { transport, energy, diet, lifestyle } = footprint.breakdown;

        // Aggregate reductions per category (cap at 90%)
        const reductions = { transport: 0, energy: 0, diet: 0, lifestyle: 0, flights: 0 };

        activeScenarios.forEach(id => {
            const scenario = SCENARIOS.find(s => s.id === id);
            if (!scenario) return;
            Object.entries(scenario.reduction).forEach(([cat, val]) => {
                reductions[cat] = Math.min(0.90, reductions[cat] + val);
            });
        });

        // Calculate new values
        const newTransport = transport.total * (1 - reductions.transport)
            - (transport.flights * reductions.flights);
        const newEnergy = energy.total * (1 - reductions.energy);
        const newDiet = diet.total * (1 - reductions.diet);
        const newLifestyle = lifestyle.total * (1 - reductions.lifestyle);

        const newTotal = Math.max(0.1, newTransport + newEnergy + newDiet + newLifestyle);
        const saved = footprint.total - newTotal;
        const percent = ((saved / footprint.total) * 100);

        // Update individual scenario savings
        SCENARIOS.forEach(scenario => {
            const el = document.getElementById(`saving-${scenario.id}`);
            if (!el) return;
            if (activeScenarios.has(scenario.id)) {
                const catKey = Object.keys(scenario.reduction)[0];
                const catVal = Object.values(scenario.reduction)[0];
                let catTotal;
                if (catKey === 'flights') catTotal = transport.flights;
                else if (catKey === 'transport') catTotal = transport.total;
                else if (catKey === 'energy') catTotal = energy.total;
                else if (catKey === 'diet') catTotal = diet.total;
                else catTotal = lifestyle.total;
                const saving = catTotal * catVal;
                el.innerHTML = `<span class="whatif-save-badge">−${saving.toFixed(1)}t/yr</span>`;
            } else {
                el.innerHTML = '';
            }
        });

        // Animate the big number
        const bigNumber = document.getElementById('whatIfTotal');
        const deltaEl = document.getElementById('whatIfDelta');
        const compEl = document.getElementById('whatIfComparison');

        if (bigNumber) {
            animateNumber(bigNumber, parseFloat(bigNumber.textContent) || footprint.total, newTotal, 800);
        }

        if (deltaEl) {
            if (saved > 0.01) {
                deltaEl.innerHTML = `Saves <strong>${saved.toFixed(1)} tons/yr</strong> (−${percent.toFixed(0)}%)`;
                deltaEl.className = 'whatif-delta positive';
            } else {
                deltaEl.innerHTML = 'Toggle scenarios above to see potential savings';
                deltaEl.className = 'whatif-delta neutral';
            }
        }

        if (compEl) {
            const { countryAvg, target2030 } = footprint.comparison;
            const meetsTarget = newTotal <= target2030;
            const belowAvg = newTotal <= countryAvg;
            compEl.innerHTML = `
                <div class="whatif-comp-item">
                    <span class="whatif-comp-label">Current</span>
                    <span class="whatif-comp-val">${footprint.total.toFixed(1)}t</span>
                </div>
                <div class="whatif-comp-arrow">→</div>
                <div class="whatif-comp-item projected">
                    <span class="whatif-comp-label">Projected</span>
                    <span class="whatif-comp-val">${newTotal.toFixed(1)}t</span>
                </div>
                <div class="whatif-comp-item">
                    <span class="whatif-comp-label">Target</span>
                    <span class="whatif-comp-val ${meetsTarget ? 'text-green' : ''}">${target2030}t ${meetsTarget ? '' : ''}</span>
                </div>
                <div class="whatif-comp-item">
                    <span class="whatif-comp-label">Country Avg</span>
                    <span class="whatif-comp-val ${belowAvg ? 'text-green' : ''}">${countryAvg}t ${belowAvg ? '' : ''}</span>
                </div>
            `;
        }
    }

    /**
     * Animate a number from old to new value.
     * @param {HTMLElement} el - Element to update.
     * @param {number} from - Start value.
     * @param {number} to - End value.
     * @param {number} duration - Duration in ms.
     */
    function animateNumber(el, from, to, duration) {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = from + (to - from) * eased;
            el.textContent = current.toFixed(1);
            if (progress < 1) {
                animationFrame = requestAnimationFrame(tick);
            }
        }
        animationFrame = requestAnimationFrame(tick);
    }

    /**
     * Get active scenario IDs for goal pre-filling.
     * @returns {string[]}
     */
    function getActiveScenarios() {
        return [...activeScenarios];
    }

    return {
        render,
        recalculate,
        getActiveScenarios,
        animateNumber,
        SCENARIOS,
    };
})();
