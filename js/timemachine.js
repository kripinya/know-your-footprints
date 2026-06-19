/**
 * Time Machine Module — Projects carbon footprint into the future.
 * Shows BAU vs Action trajectories with IPCC targets.
 * 
 * @module TimeMachine
 */

const TimeMachine = (() => {
    "use strict";
    let projectionChart = null;

    const YEARS = [2025, 2026, 2027, 2028, 2029, 2030, 2035, 2040, 2050];
    const IPCC_TARGET = 2.5;
    const PARIS_TARGET = 1.0;
    const BAU_GROWTH = 0.03;     // +3% per year (global average growth)
    const ACTION_REDUCTION = 0.08; // -8% per year with action

    /**
     * Render the Time Machine page.
     */
    function render() {
        const footprint = Storage.getFootprint();
        const emptyState = document.getElementById('timeMachineEmpty');
        const content = document.getElementById('timeMachineContent');

        if (!footprint) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (content) content.classList.add('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        if (content) content.classList.remove('hidden');

        const currentTotal = footprint.total;
        const bauData = projectTrajectory(currentTotal, BAU_GROWTH);
        const actionData = projectTrajectory(currentTotal, -ACTION_REDUCTION);

        renderChart(bauData, actionData);
        renderInsights(currentTotal, bauData, actionData);
        renderThermometer(currentTotal, actionData);
    }

    /**
     * Project footprint trajectory over years.
     * @param {number} start - Starting footprint in tons.
     * @param {number} rate - Annual growth rate (positive = growth, negative = reduction).
     * @returns {number[]} Array of projected values.
     */
    function projectTrajectory(start, rate) {
        return YEARS.map(year => {
            const yearsFromNow = year - 2025;
            return Math.max(0.1, start * Math.pow(1 + rate, yearsFromNow));
        });
    }

    /**
     * Render the projection chart.
     */
    function renderChart(bauData, actionData) {
        const ctx = document.getElementById('projectionChart');
        if (!ctx) return;

        if (projectionChart) projectionChart.destroy();

        projectionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: YEARS.map(String),
                datasets: [
                    {
                        label: 'Business as Usual',
                        data: bauData,
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.05)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#f43f5e',
                        pointBorderColor: '#0a0f1c',
                        pointBorderWidth: 2,
                        fill: false,
                        tension: 0.3,
                    },
                    {
                        label: 'With Action',
                        data: actionData,
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: '#22c55e',
                        pointBorderColor: '#0a0f1c',
                        pointBorderWidth: 2,
                        fill: '-1', // Fill between this and previous dataset
                        tension: 0.3,
                    },
                    {
                        label: 'IPCC Target (2.5t)',
                        data: Array(YEARS.length).fill(IPCC_TARGET),
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                        borderDash: [8, 4],
                        pointRadius: 0,
                        fill: false,
                    },
                    {
                        label: '1.5°C Target (1.0t)',
                        data: Array(YEARS.length).fill(PARIS_TARGET),
                        borderColor: '#06b6d4',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 2000, easing: 'easeOutQuart' },
                interaction: { mode: 'index', intersect: false },
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
                        callbacks: {
                            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}t CO₂`,
                        },
                    },
                    filler: { propagate: true },
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 12 } },
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 12 },
                            callback: (val) => val.toFixed(1) + 't',
                        },
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    /**
     * Render key insights below the chart.
     */
    function renderInsights(current, bauData, actionData) {
        const container = document.getElementById('tmInsights');
        if (!container) return;

        // 2030 index = 5
        const bau2030 = bauData[5];
        const act2030 = actionData[5];
        const diff2030 = bau2030 - act2030;
        const trees2030 = Math.round(diff2030 * 50);

        // 2050 index = 8
        const bau2050 = bauData[8];
        const act2050 = actionData[8];
        const diff2050 = bau2050 - act2050;
        // Simplified warming: every ton above 2.5t adds ~0.0001°C per person
        // For individual impact framing, use illustrative metric
        const warmingDiff = (diff2050 * 0.0001).toFixed(4);

        container.innerHTML = `
            <div class="tm-insight-grid">
                <div class="tm-insight-card highlight">
                    <span class="tm-insight-year">2030</span>
                    <div class="tm-insight-content">
                        <p>The <strong>Impact Gap</strong> between paths is <strong class="text-green">${diff2030.toFixed(1)} tons</strong> CO₂/year</p>
                        <p class="tm-insight-sub">That's equivalent to planting <strong>${trees2030} trees</strong> 🌳</p>
                    </div>
                    <div class="tm-insight-comparison">
                        <div class="tm-path bau">
                            <span class="tm-path-label">BAU</span>
                            <span class="tm-path-value">${bau2030.toFixed(1)}t</span>
                        </div>
                        <div class="tm-path action">
                            <span class="tm-path-label">Action</span>
                            <span class="tm-path-value">${act2030.toFixed(1)}t</span>
                        </div>
                        <div class="tm-path-diff">−${((diff2030 / bau2030) * 100).toFixed(0)}%</div>
                    </div>
                </div>
                <div class="tm-insight-card">
                    <span class="tm-insight-year">2050</span>
                    <div class="tm-insight-content">
                        <p>By 2050, the cumulative difference is <strong class="text-green">${diff2050.toFixed(1)} tons/yr</strong></p>
                        <p class="tm-insight-sub">Your choices today shape the climate for decades</p>
                    </div>
                    <div class="tm-insight-comparison">
                        <div class="tm-path bau">
                            <span class="tm-path-label">BAU</span>
                            <span class="tm-path-value">${bau2050.toFixed(1)}t</span>
                        </div>
                        <div class="tm-path action">
                            <span class="tm-path-label">Action</span>
                            <span class="tm-path-value">${act2050.toFixed(1)}t</span>
                        </div>
                        <div class="tm-path-diff">−${((diff2050 / bau2050) * 100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the temperature gauge thermometer.
     */
    function renderThermometer(current, actionData) {
        const container = document.getElementById('tmThermometer');
        if (!container) return;

        const actionFuture = actionData[5]; // 2030 value
        
        // Determine zone: above 2.5t = red, 1-2.5t = yellow, below 1t = green
        let zone, zoneLabel, zoneColor;
        if (current > 2.5) {
            zone = 'red';
            zoneLabel = 'Above IPCC Target';
            zoneColor = '#f43f5e';
        } else if (current > 1.0) {
            zone = 'yellow';
            zoneLabel = 'On Track';
            zoneColor = '#f59e0b';
        } else {
            zone = 'green';
            zoneLabel = 'Climate Champion';
            zoneColor = '#22c55e';
        }

        let futureZone, futureLabel, futureColor;
        if (actionFuture > 2.5) {
            futureZone = 'red';
            futureLabel = 'Needs More Action';
            futureColor = '#f43f5e';
        } else if (actionFuture > 1.0) {
            futureZone = 'yellow';
            futureLabel = 'Getting There';
            futureColor = '#f59e0b';
        } else {
            futureZone = 'green';
            futureLabel = 'Paris-Compatible';
            futureColor = '#22c55e';
        }

        // Fill height: map 0-15t to 0-100%
        const fillPercent = Math.min(100, (current / 15) * 100);
        const futureFillPercent = Math.min(100, (actionFuture / 15) * 100);

        container.innerHTML = `
            <div class="thermo-grid">
                <div class="thermo-item">
                    <h4>Now</h4>
                    <div class="thermo-gauge">
                        <div class="thermo-body">
                            <div class="thermo-fill" style="height:${fillPercent}%;background:${zoneColor}"></div>
                            <div class="thermo-markers">
                                <div class="thermo-mark" style="bottom:${(2.5/15)*100}%"><span>2.5t</span></div>
                                <div class="thermo-mark" style="bottom:${(1.0/15)*100}%"><span>1.0t</span></div>
                            </div>
                        </div>
                        <div class="thermo-bulb" style="background:${zoneColor}"></div>
                    </div>
                    <span class="thermo-label" style="color:${zoneColor}">${current.toFixed(1)}t — ${zoneLabel}</span>
                </div>
                <div class="thermo-item">
                    <h4>2030 (with action)</h4>
                    <div class="thermo-gauge">
                        <div class="thermo-body">
                            <div class="thermo-fill" style="height:${futureFillPercent}%;background:${futureColor}"></div>
                            <div class="thermo-markers">
                                <div class="thermo-mark" style="bottom:${(2.5/15)*100}%"><span>2.5t</span></div>
                                <div class="thermo-mark" style="bottom:${(1.0/15)*100}%"><span>1.0t</span></div>
                            </div>
                        </div>
                        <div class="thermo-bulb" style="background:${futureColor}"></div>
                    </div>
                    <span class="thermo-label" style="color:${futureColor}">${actionFuture.toFixed(1)}t — ${futureLabel}</span>
                </div>
            </div>
        `;
    }

    return {
        render,
        YEARS,
        projectTrajectory,
    };
})();
