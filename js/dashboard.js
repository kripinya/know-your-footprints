/**
 * Dashboard Module — Renders charts and visualizations of the carbon footprint.
 * Uses Chart.js for interactive charts.
 * 
 * @module Dashboard
 */

const Dashboard = (() => {
    "use strict";
    let breakdownChart = null;
    let categoryChart = null;
    let historyChart = null;

    /**
     * Chart.js default configuration for dark theme.
     */
    const CHART_DEFAULTS = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8',
                    font: { family: 'Inter', size: 12 },
                    padding: 16,
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: 'Space Grotesk', weight: 'bold' },
                bodyFont: { family: 'Inter' },
            },
        },
    };

    /**
     * Category colors for charts.
     */
    const CATEGORY_COLORS = {
        transport: { bg: 'rgba(59, 130, 246, 0.8)', border: '#3b82f6' },
        energy: { bg: 'rgba(245, 158, 11, 0.8)', border: '#f59e0b' },
        diet: { bg: 'rgba(34, 197, 94, 0.8)', border: '#22c55e' },
        lifestyle: { bg: 'rgba(139, 92, 246, 0.8)', border: '#8b5cf6' },
    };

    /**
     * Render the full dashboard.
     * @param {Object} footprint - Calculated footprint data.
     */
    function render(footprint) {
        if (!footprint) {
            document.getElementById('dashboardEmpty').classList.remove('hidden');
            document.getElementById('dashboardContent').classList.add('hidden');
            return;
        }

        document.getElementById('dashboardEmpty').classList.add('hidden');
        document.getElementById('dashboardContent').classList.remove('hidden');

        renderScoreCard(footprint);
        renderImpactTranslator(footprint);
        renderBreakdownChart(footprint);
        renderCategoryChart(footprint);
        renderBreakdownGrid(footprint);
        renderHistory();
        renderTopRecommendations(footprint);

        if (typeof WhatIf !== 'undefined') {
            WhatIf.render(footprint);
        }

        // Animate comparison bars after a delay
        setTimeout(() => animateComparisonBars(footprint), 300);
    }

    /**
     * Render the score ring and comparison bars.
     */
    function renderScoreCard(footprint) {
        const total = footprint.total;
        const { countryAvg, globalAvg, target2030 } = footprint.comparison;
        const grade = footprint.grade;

        // Score value
        document.getElementById('totalScore').textContent = total.toFixed(1);

        // Grade
        const gradeBadge = document.getElementById('gradeBadge');
        gradeBadge.textContent = grade.letter;
        gradeBadge.style.background = grade.color;
        document.getElementById('gradeText').textContent = grade.text;

        // Comparison values
        document.getElementById('comparisonYoursVal').textContent = total.toFixed(1);
        document.getElementById('comparisonCountryVal').textContent = countryAvg.toFixed(1);
        document.getElementById('comparisonGlobalVal').textContent = globalAvg.toFixed(1);
        document.getElementById('comparisonTargetVal').textContent = target2030.toFixed(1);

        // Score ring
        const maxScore = Math.max(total, countryAvg, globalAvg, 20);
        const percent = Math.min((total / maxScore) * 100, 100);
        const circumference = 2 * Math.PI * 85; // r=85
        const offset = circumference - (percent / 100) * circumference;

        // Create gradient for SVG
        const svg = document.querySelector('.score-ring-svg');
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            gradient.setAttribute('id', 'scoreGradient');
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '100%');

            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#22c55e');

            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', '#06b6d4');

            gradient.appendChild(stop1);
            gradient.appendChild(stop2);
            defs.appendChild(gradient);
            svg.prepend(defs);
        }

        const ring = document.getElementById('scoreRingFill');
        ring.style.strokeDasharray = circumference;
        setTimeout(() => {
            ring.style.strokeDashoffset = offset;
        }, 100);

        // Color the score based on grade
        document.getElementById('totalScore').style.color = grade.color;
    }

    /**
     * Animate comparison bars.
     */
    function animateComparisonBars(footprint) {
        const total = footprint.total;
        const { countryAvg, globalAvg, target2030 } = footprint.comparison;
        const maxVal = Math.max(total, countryAvg, globalAvg, 20);

        document.getElementById('comparisonYours').style.width = `${(total / maxVal) * 100}%`;
        document.getElementById('comparisonCountry').style.width = `${(countryAvg / maxVal) * 100}%`;
        document.getElementById('comparisonGlobal').style.width = `${(globalAvg / maxVal) * 100}%`;
        document.getElementById('comparisonTarget').style.width = `${(target2030 / maxVal) * 100}%`;
    }

    /**
     * Render the Impact Translator (CO2 equivalents).
     */
    function renderImpactTranslator(footprint) {
        const carousel = document.getElementById('impactCarousel');
        const shareBtn = document.getElementById('shareImpact');
        if (!carousel) return;

        const tons = footprint.total;
        const equivalents = [
            { icon: '✈️', label: 'Delhi → Mumbai flights', value: Math.round(tons * 2.26) },
            { icon: '🌳', label: 'trees needed to absorb this/yr', value: Math.round(tons * 50) },
            { icon: '📱', label: 'smartphone charges', value: Math.round(tons * 121500).toLocaleString() },
            { icon: '🐄', label: 'kg of beef equivalent', value: Math.round(tons * 100) },
            { icon: '💡', label: 'months of home electricity', value: (tons * 1.8).toFixed(1) },
            { icon: '🚗', label: 'km driven in a petrol car', value: Math.round(tons * 4166).toLocaleString() },
            { icon: '🛁', label: 'hot baths', value: Math.round(tons * 800) },
            { icon: '☕', label: 'cups of coffee produced', value: Math.round(tons * 2000).toLocaleString() }
        ];

        carousel.innerHTML = equivalents.map(eq => `
            <div class="impact-equiv-card">
                <div class="equiv-icon">${eq.icon}</div>
                <div class="equiv-val" data-target="${eq.value.toString().replace(/,/g, '')}">${eq.value}</div>
                <div class="equiv-label">${eq.label}</div>
            </div>
        `).join('');

        // Share functionality
        if (shareBtn) {
            shareBtn.onclick = () => {
                const text = `My carbon footprint = ${Math.round(tons * 50)} trees needed to absorb it yearly 🌳\nCalculate yours: https://kripinya.github.io/know-your-footprints/ #KnowYourFootprints`;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(() => {
                        if (typeof App !== 'undefined') App.showToast('Copied to clipboard!', 'success');
                    });
                }
            };
        }
    }

    /**
     * Render the doughnut breakdown chart.
     */
    function renderBreakdownChart(footprint) {
        const ctx = document.getElementById('breakdownChart');
        if (!ctx) return;

        if (breakdownChart) breakdownChart.destroy();

        const { transport, energy, diet, lifestyle } = footprint.breakdown;

        breakdownChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Transport', 'Home Energy', 'Diet & Food', 'Lifestyle'],
                datasets: [{
                    data: [transport.total, energy.total, diet.total, lifestyle.total],
                    backgroundColor: [
                        CATEGORY_COLORS.transport.bg,
                        CATEGORY_COLORS.energy.bg,
                        CATEGORY_COLORS.diet.bg,
                        CATEGORY_COLORS.lifestyle.bg,
                    ],
                    borderColor: 'rgba(10, 15, 28, 0.8)',
                    borderWidth: 3,
                    hoverOffset: 10,
                }],
            },
            options: {
                ...CHART_DEFAULTS,
                cutout: '65%',
                plugins: {
                    ...CHART_DEFAULTS.plugins,
                    tooltip: {
                        ...CHART_DEFAULTS.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((value / total) * 100).toFixed(1);
                                return ` ${context.label}: ${value.toFixed(2)} tons (${percent}%)`;
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Render the horizontal bar chart showing category details.
     */
    function renderCategoryChart(footprint) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        if (categoryChart) categoryChart.destroy();

        const { transport, energy, diet, lifestyle } = footprint.breakdown;

        const labels = [];
        const data = [];
        const colors = [];

        // Transport sub-items
        if (transport.car > 0) { labels.push('Car'); data.push(transport.car); colors.push('#3b82f6'); }
        if (transport.publicTransport > 0) { labels.push('Public Transport'); data.push(transport.publicTransport); colors.push('#60a5fa'); }
        if (transport.flights > 0) { labels.push('Flights'); data.push(transport.flights); colors.push('#93c5fd'); }

        // Energy sub-items
        if (energy.electricity > 0) { labels.push('Electricity'); data.push(energy.electricity); colors.push('#f59e0b'); }
        if (energy.heating > 0) { labels.push('Heating'); data.push(energy.heating); colors.push('#fbbf24'); }

        // Diet sub-items
        labels.push('Food'); data.push(diet.food); colors.push('#22c55e');
        if (diet.waste > 0) { labels.push('Food Waste'); data.push(diet.waste); colors.push('#4ade80'); }

        // Lifestyle sub-items
        if (lifestyle.clothing > 0) { labels.push('Clothing'); data.push(lifestyle.clothing); colors.push('#8b5cf6'); }
        if (lifestyle.electronics > 0) { labels.push('Electronics'); data.push(lifestyle.electronics); colors.push('#a78bfa'); }
        if (lifestyle.digital > 0) { labels.push('Digital'); data.push(lifestyle.digital); colors.push('#c4b5fd'); }
        if (lifestyle.waste > 0) { labels.push('Waste'); data.push(lifestyle.waste); colors.push('#ddd6fe'); }

        categoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderRadius: 6,
                    borderSkipped: false,
                    barThickness: 20,
                }],
            },
            options: {
                ...CHART_DEFAULTS,
                indexAxis: 'y',
                plugins: {
                    ...CHART_DEFAULTS.plugins,
                    legend: { display: false },
                    tooltip: {
                        ...CHART_DEFAULTS.plugins.tooltip,
                        callbacks: {
                            label: (ctx) => ` ${ctx.parsed.x.toFixed(3)} tons CO₂/yr`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                        title: {
                            display: true,
                            text: 'tons CO₂/year',
                            color: '#64748b',
                            font: { family: 'Inter', size: 11 },
                        },
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                    },
                },
            },
        });
    }

    /**
     * Render the breakdown grid with icons and values.
     */
    function renderBreakdownGrid(footprint) {
        const grid = document.getElementById('breakdownGrid');
        if (!grid) return;

        const { transport, energy, diet, lifestyle } = footprint.breakdown;
        const total = footprint.total;

        const items = [
            { icon: '🚗', name: 'Car / Vehicle', value: transport.car, category: 'transport' },
            { icon: '🚌', name: 'Public Transport', value: transport.publicTransport, category: 'transport' },
            { icon: '✈️', name: 'Flights', value: transport.flights, category: 'transport' },
            { icon: '⚡', name: 'Electricity', value: energy.electricity, category: 'energy' },
            { icon: '🔥', name: 'Heating', value: energy.heating, category: 'energy' },
            { icon: '🍖', name: 'Food & Diet', value: diet.food, category: 'diet' },
            { icon: '🗑️', name: 'Food Waste', value: diet.waste, category: 'diet' },
            { icon: '👕', name: 'Clothing', value: lifestyle.clothing, category: 'lifestyle' },
            { icon: '📱', name: 'Electronics', value: lifestyle.electronics, category: 'lifestyle' },
            { icon: '💻', name: 'Digital / Screen', value: lifestyle.digital, category: 'lifestyle' },
            { icon: '♻️', name: 'General Waste', value: lifestyle.waste, category: 'lifestyle' },
        ];

        grid.innerHTML = items
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .map(item => {
                const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return `
                    <div class="breakdown-item">
                        <span class="breakdown-icon">${item.icon}</span>
                        <div class="breakdown-info">
                            <div class="breakdown-name">${item.name}</div>
                            <div class="breakdown-val">${item.value.toFixed(2)} t</div>
                        </div>
                        <span class="breakdown-percent">${percent}%</span>
                    </div>
                `;
            })
            .join('');
    }

    /**
     * Render the history line chart.
     */
    function renderHistory() {
        const ctx = document.getElementById('historyChart');
        if (!ctx) return;

        const history = Storage.getHistory();

        if (history.length < 1) {
            document.getElementById('historySection').classList.add('hidden');
            return;
        }

        document.getElementById('historySection').classList.remove('hidden');

        if (historyChart) historyChart.destroy();

        const labels = history.map((entry, i) => {
            const date = new Date(entry.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const data = history.map(e => e.total);

        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Total Footprint (tons CO₂/yr)',
                    data,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#22c55e',
                    pointBorderColor: '#0a0f1c',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                }],
            },
            options: {
                ...CHART_DEFAULTS,
                plugins: {
                    ...CHART_DEFAULTS.plugins,
                    legend: { display: false },
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 11 },
                            callback: (val) => val.toFixed(1) + 't',
                        },
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    /**
     * Render personalized top recommendations.
     */
    function renderTopRecommendations(footprint) {
        const grid = document.getElementById('topRecsGrid');
        if (!grid) return;

        const recs = Recommendations.getTop(footprint, 4);

        grid.innerHTML = recs
            .map(rec => `
                <div class="rec-card">
                    <span class="rec-icon">${rec.icon}</span>
                    <div class="rec-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                        <span class="rec-saving">🌱 Save ~${rec.saving} tons/yr</span>
                    </div>
                </div>
            `)
            .join('');
    }

    return {
        render,
    };
})();

/**
 * Recommendations Engine — Generates personalized tips based on footprint data.
 */
const Recommendations = (() => {
    "use strict";
    /**
     * Full catalog of recommendations.
     * Each has conditions for when it's most relevant.
     */
    const CATALOG = [
        {
            id: 'switch_ev',
            icon: '🔌',
            title: 'Switch to an Electric Vehicle',
            description: 'EVs produce up to 70% less emissions than petrol cars over their lifetime.',
            saving: 1.5,
            category: 'transport',
            condition: (fp) => fp.breakdown.transport.car > 0.5 && fp.inputs.carType !== 'electric',
            priority: (fp) => fp.breakdown.transport.car,
        },
        {
            id: 'reduce_flights',
            icon: '✈️',
            title: 'Reduce Air Travel',
            description: 'Replace one long-haul flight with a train journey or video call for meetings.',
            saving: 1.6,
            category: 'transport',
            condition: (fp) => fp.breakdown.transport.flights > 0.5,
            priority: (fp) => fp.breakdown.transport.flights,
        },
        {
            id: 'bike_commute',
            icon: '🚲',
            title: 'Cycle or Walk for Short Trips',
            description: 'Replace car trips under 5 km with cycling or walking for zero-emission travel.',
            saving: 0.5,
            category: 'transport',
            condition: (fp) => fp.breakdown.transport.car > 0.3,
            priority: (fp) => fp.breakdown.transport.car * 0.8,
        },
        {
            id: 'public_transport',
            icon: '🚇',
            title: 'Use Public Transport More',
            description: 'Buses and trains emit 5-10x less CO₂ per passenger km than private cars.',
            saving: 0.8,
            category: 'transport',
            condition: (fp) => fp.breakdown.transport.car > 0.5 && fp.inputs.publicTransport < 5,
            priority: (fp) => fp.breakdown.transport.car * 0.7,
        },
        {
            id: 'renewable_energy',
            icon: '☀️',
            title: 'Switch to Renewable Energy',
            description: 'Choose a green energy provider or install solar panels to slash home emissions.',
            saving: 1.2,
            category: 'energy',
            condition: (fp) => fp.inputs.energySource !== 'renewable_full',
            priority: (fp) => fp.breakdown.energy.total,
        },
        {
            id: 'efficient_appliances',
            icon: '🏠',
            title: 'Upgrade to Energy-Efficient Appliances',
            description: 'A-rated appliances use 50-80% less energy. Focus on refrigerators and washing machines.',
            saving: 0.4,
            category: 'energy',
            condition: (fp) => fp.inputs.efficientAppliances !== 'all',
            priority: (fp) => fp.breakdown.energy.electricity * 0.6,
        },
        {
            id: 'reduce_meat',
            icon: '🥗',
            title: 'Reduce Meat Consumption',
            description: 'Cutting meat to 1-2x per week saves significant emissions from livestock agriculture.',
            saving: 0.8,
            category: 'diet',
            condition: (fp) => ['heavy_meat', 'medium_meat'].includes(fp.inputs.dietType),
            priority: (fp) => fp.breakdown.diet.food,
        },
        {
            id: 'go_vegan',
            icon: '🌱',
            title: 'Try Plant-Based Meals',
            description: 'Even 2-3 vegan days per week can reduce your food footprint by 25%.',
            saving: 0.6,
            category: 'diet',
            condition: (fp) => fp.inputs.dietType !== 'vegan',
            priority: (fp) => fp.breakdown.diet.food * 0.9,
        },
        {
            id: 'buy_local',
            icon: '🏪',
            title: 'Buy Locally Sourced Food',
            description: 'Local produce travels fewer miles and supports sustainable farming practices.',
            saving: 0.3,
            category: 'diet',
            condition: (fp) => fp.inputs.localFood !== 'always',
            priority: (fp) => 0.3,
        },
        {
            id: 'reduce_food_waste',
            icon: '🍲',
            title: 'Reduce Food Waste',
            description: 'Plan meals, use leftovers, and compost scraps to cut waste-related emissions.',
            saving: 0.3,
            category: 'diet',
            condition: (fp) => fp.inputs.foodWaste !== 'none',
            priority: (fp) => fp.breakdown.diet.waste,
        },
        {
            id: 'slow_fashion',
            icon: '👕',
            title: 'Embrace Slow Fashion',
            description: 'Buy fewer, higher-quality clothes. Try thrift shopping and clothing swaps.',
            saving: 0.3,
            category: 'lifestyle',
            condition: (fp) => fp.inputs.clothingItems > 3,
            priority: (fp) => fp.breakdown.lifestyle.clothing,
        },
        {
            id: 'recycle_more',
            icon: '♻️',
            title: 'Improve Your Recycling',
            description: 'Recycle properly: paper, glass, metals, and plastics in the right bins.',
            saving: 0.2,
            category: 'lifestyle',
            condition: (fp) => fp.inputs.recycling !== 'always',
            priority: (fp) => fp.breakdown.lifestyle.waste,
        },
        {
            id: 'digital_detox',
            icon: '📵',
            title: 'Reduce Screen Time',
            description: 'Less streaming and browsing reduces data center energy consumption.',
            saving: 0.08,
            category: 'lifestyle',
            condition: (fp) => fp.inputs.screenTime > 8,
            priority: (fp) => fp.breakdown.lifestyle.digital,
        },
        {
            id: 'carbon_offset',
            icon: '🌳',
            title: 'Invest in Carbon Offsets',
            description: 'Support verified reforestation and renewable energy projects to offset remaining emissions.',
            saving: 1.0,
            category: 'lifestyle',
            condition: () => true,
            priority: () => 0.5,
        },
    ];

    /**
     * Get top N recommendations sorted by impact for the user.
     * @param {Object} footprint - Calculated footprint data.
     * @param {number} count - Number of recommendations to return.
     * @returns {Array} Top recommendations.
     */
    function getTop(footprint, count = 4) {
        return CATALOG
            .filter(rec => rec.condition(footprint))
            .sort((a, b) => b.priority(footprint) - a.priority(footprint))
            .slice(0, count);
    }

    /**
     * Get all applicable recommendations.
     * @param {Object} footprint - Calculated footprint data.
     * @returns {Array} All applicable recommendations.
     */
    function getAll(footprint) {
        return CATALOG
            .filter(rec => rec.condition(footprint))
            .sort((a, b) => b.priority(footprint) - a.priority(footprint));
    }

    /**
     * Get recommendations for a specific category.
     * @param {Object} footprint - Calculated footprint data.
     * @param {string} category - Category name.
     * @returns {Array} Filtered recommendations.
     */
    function getByCategory(footprint, category) {
        return CATALOG
            .filter(rec => rec.category === category && rec.condition(footprint))
            .sort((a, b) => b.priority(footprint) - a.priority(footprint));
    }

    return {
        getTop,
        getAll,
        getByCategory,
        CATALOG,
    };
})();
