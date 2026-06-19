/**
 * Test Suite for Know Your Footprints
 * 30+ test cases covering all modules with edge cases.
 */

const TestRunner = (() => {
    "use strict";
    let passed = 0;
    let failed = 0;
    let total = 0;
    const results = [];

    /**
     * Assert a condition is true.
     * @param {boolean} condition - The condition to evaluate.
     * @param {string} testName - Name of the test.
     * @param {string} [detail=''] - Optional detail on failure.
     */
    function assert(condition, testName, detail = '') {
        total++;
        if (condition) {
            passed++;
            results.push({ name: testName, pass: true, detail });
        } else {
            failed++;
            results.push({ name: testName, pass: false, detail: detail || 'Assertion failed' });
        }
    }

    /**
     * Assert two values are approximately equal.
     * @param {number} actual - Actual value.
     * @param {number} expected - Expected value.
     * @param {number} tolerance - Allowed difference.
     * @param {string} testName - Name of the test.
     */
    function assertApprox(actual, expected, tolerance, testName) {
        assert(Math.abs(actual - expected) <= tolerance,
            testName, `Expected ~${expected}, got ${actual}`);
    }

    /**
     * Group a set of tests.
     * @param {string} name - Group name.
     * @param {Function} fn - Function containing tests.
     */
    function group(name, fn) {
        results.push({ group: name });
        fn();
    }

    // ========== Storage Tests ==========
    /**
     * Test the Storage module.
     */
    function testStorage() {
        group('📦 Storage Module', () => {
            // Clear before tests
            Storage.clearAll();

            // Test 1: Get returns fallback for missing key
            assert(Storage.get('nonexistent', 'fallback') === 'fallback',
                'Returns fallback for missing key');

            // Test 2: Set and get basic data
            Storage.set('test_key', { value: 42 });
            const data = Storage.get('test_key');
            assert(data && data.value === 42,
                'Set and get basic data');

            // Test 3: Save and retrieve profile
            Storage.saveProfile({ carType: 'electric', dietType: 'vegan' });
            const profile = Storage.getProfile();
            assert(profile && profile.carType === 'electric',
                'Save and retrieve profile');

            // Test 4: Profile has updatedAt timestamp
            assert(profile && profile.updatedAt,
                'Profile includes updatedAt timestamp');

            // Test 5: Save footprint and retrieve
            const footprint = { total: 3.5, breakdown: { transport: { total: 1 } } };
            Storage.saveFootprint(footprint);
            const fp = Storage.getFootprint();
            assert(fp && fp.total === 3.5,
                'Save and retrieve footprint');

            // Test 6: Footprint has calculatedAt
            assert(fp && fp.calculatedAt,
                'Footprint includes calculatedAt timestamp');

            // Test 7: History is updated on footprint save
            const history = Storage.getHistory();
            assert(history.length >= 1, 'History updated on footprint save');

            // Test 8: Challenge data defaults
            Storage.clearAll();
            const cd = Storage.getChallengeData();
            assert(cd.completed.length === 0 && cd.streak === 0 && cd.points === 0,
                'Challenge data has correct defaults');

            // Test 9: Corrupted localStorage handling
            localStorage.setItem('kyf_profile', 'not valid json{{{');
            const corrupt = Storage.getProfile();
            assert(corrupt === null,
                'Handles corrupted localStorage gracefully');

            // Test 10: Clear all removes all keys
            Storage.saveProfile({ test: true });
            Storage.clearAll();
            assert(Storage.getProfile() === null && Storage.getFootprint() === null,
                'clearAll removes all data');
        });
    }

    // ========== Calculator Tests ==========
    /**
     * Test the Calculator module.
     */
    function testCalculator() {
        group('🧮 Calculator Module', () => {
            const baseInputs = {
                carType: 'medium_petrol', carKm: '100', publicTransport: '5',
                shortFlights: '2', homeType: 'apartment_small', householdSize: '1',
                energySource: 'mixed', electricityBill: '80', efficientAppliances: 'some',
                dietType: 'medium_meat', localFood: 'often', foodWaste: 'little',
                clothingItems: '3', electronics: '1', recycling: 'often',
                screenTime: '6', country: 'india'
            };

            // Test 11: Calculate returns total
            const result = Calculator.calculate(baseInputs);
            assert(result && typeof result.total === 'number' && result.total > 0,
                'Calculate returns positive total');

            // Test 12: Breakdown has all categories
            assert(result.breakdown.transport && result.breakdown.energy &&
                result.breakdown.diet && result.breakdown.lifestyle,
                'Breakdown contains all 4 categories');

            // Test 13: Grade is assigned
            assert(result.grade && result.grade.letter && result.grade.text,
                'Grade is assigned with letter and text');

            // Test 14: Zero driving = zero car emissions
            const noCarInputs = { ...baseInputs, carType: 'none', carKm: '0' };
            const noCar = Calculator.calculate(noCarInputs);
            assert(noCar.breakdown.transport.car === 0,
                'No car = zero car emissions');

            // Test 15: Vegan diet < heavy meat diet
            const veganInputs = { ...baseInputs, dietType: 'vegan' };
            const meatInputs = { ...baseInputs, dietType: 'heavy_meat' };
            const veganResult = Calculator.calculate(veganInputs);
            const meatResult = Calculator.calculate(meatInputs);
            assert(veganResult.breakdown.diet.total < meatResult.breakdown.diet.total,
                'Vegan diet emissions < heavy meat diet');

            // Test 16: Electric vehicle < petrol vehicle
            const evInputs = { ...baseInputs, carType: 'electric' };
            const petrolInputs = { ...baseInputs, carType: 'large_petrol' };
            const evResult = Calculator.calculate(evInputs);
            const petrolResult = Calculator.calculate(petrolInputs);
            assert(evResult.breakdown.transport.car < petrolResult.breakdown.transport.car,
                'EV emissions < petrol car emissions');

            // Test 17: Renewable energy < coal
            const renewInputs = { ...baseInputs, energySource: 'renewable_full' };
            const coalInputs = { ...baseInputs, energySource: 'coal' };
            const renewResult = Calculator.calculate(renewInputs);
            const coalResult = Calculator.calculate(coalInputs);
            assert(renewResult.breakdown.energy.total < coalResult.breakdown.energy.total,
                'Renewable energy < coal emissions');

            // Test 18: More flights = more emissions
            const noFlights = Calculator.calculate({ ...baseInputs, shortFlights: '0' });
            const manyFlights = Calculator.calculate({ ...baseInputs, shortFlights: '15' });
            assert(manyFlights.breakdown.transport.flights > noFlights.breakdown.transport.flights,
                'More flights = more transport emissions');

            // Test 19: Household size reduces per-person energy
            const single = Calculator.calculate({ ...baseInputs, householdSize: '1' });
            const family = Calculator.calculate({ ...baseInputs, householdSize: '4' });
            assert(family.breakdown.energy.total < single.breakdown.energy.total,
                'Larger household = lower per-person energy');

            // Test 20: Country averages exist
            assert(Calculator.COUNTRY_AVERAGES.india === 1.9,
                'India country average is 1.9t');
            assert(Calculator.COUNTRY_AVERAGES.usa === 14.7,
                'USA country average is 14.7t');

            // Test 21: Grade A+ for very low footprint
            const grade = Calculator.getGrade(0.5, 10);
            assert(grade.letter === 'A+',
                'Very low footprint gets A+ grade');

            // Test 22: Grade F for very high footprint
            const gradeF = Calculator.getGrade(20, 5);
            assert(gradeF.letter === 'F',
                'Very high footprint gets F grade');

            // Test 23: Zero inputs don't crash
            const zeroInputs = {
                carType: 'none', carKm: '0', publicTransport: '0', shortFlights: '0',
                homeType: 'apartment_small', householdSize: '1', energySource: 'renewable_full',
                electricityBill: '10', efficientAppliances: 'all', dietType: 'vegan',
                localFood: 'always', foodWaste: 'none', clothingItems: '0', electronics: '0',
                recycling: 'always', screenTime: '0', country: 'india'
            };
            const zeroResult = Calculator.calculate(zeroInputs);
            assert(zeroResult && zeroResult.total >= 0,
                'Zero/minimal inputs don\'t crash');

            // Test 24: Maximum inputs don't overflow
            const maxInputs = {
                carType: 'large_petrol', carKm: '500', publicTransport: '40', shortFlights: '15',
                homeType: 'house_large', householdSize: '1', energySource: 'coal',
                electricityBill: '400', efficientAppliances: 'none', dietType: 'heavy_meat',
                localFood: 'never', foodWaste: 'lot', clothingItems: '20', electronics: '8',
                recycling: 'never', screenTime: '16', country: 'usa'
            };
            const maxResult = Calculator.calculate(maxInputs);
            assert(maxResult && maxResult.total > 0 && maxResult.total < 100,
                'Maximum inputs produce reasonable result (< 100t)');
        });
    }

    // ========== Challenges Tests ==========
    /**
     * Test the Challenges module.
     */
    function testChallenges() {
        group('🏆 Challenges Module', () => {
            Storage.clearAll();

            // Test 25: Daily challenges return 5 items
            const daily = Challenges.getDailyChallenges();
            assert(daily.length === 5,
                'getDailyChallenges returns 5 challenges');

            // Test 26: Weekly challenges return 3 items
            const weekly = Challenges.getWeeklyChallenges();
            assert(weekly.length === 3,
                'getWeeklyChallenges returns 3 challenges');

            // Test 27: Challenges have required fields
            const challenge = daily[0];
            assert(challenge.id && challenge.emoji && challenge.name && 
                   challenge.description && typeof challenge.points === 'number',
                'Challenges have all required fields');

            // Test 28: Complete challenge updates data
            const result = Challenges.completeChallenge('walk_10min', 15, 0.002);
            assert(result.points === 15 && result.completed.length === 1,
                'Completing challenge updates points and completed list');

            // Test 29: Duplicate completion same day is flagged
            const dupe = Challenges.completeChallenge('walk_10min', 15, 0.002);
            assert(dupe.alreadyDone === true,
                'Duplicate completion same day returns alreadyDone');

            // Test 30: Streak starts at 1
            assert(result.streak === 1,
                'First challenge starts streak at 1');
        });
    }

    // ========== WhatIf Tests ==========
    /**
     * Test the WhatIf module.
     */
    function testWhatIf() {
        group('🔮 What-If Simulator', () => {
            // Test 31: SCENARIOS array is defined
            assert(WhatIf.SCENARIOS && WhatIf.SCENARIOS.length === 8,
                'SCENARIOS has 8 scenarios');

            // Test 32: Each scenario has required fields
            const allValid = WhatIf.SCENARIOS.every(s => s.id && s.label && s.icon && s.reduction);
            assert(allValid,
                'All scenarios have id, label, icon, and reduction');

            // Test 33: animateNumber is a function
            assert(typeof WhatIf.animateNumber === 'function',
                'animateNumber is exported');
        });
    }

    // ========== TimeMachine Tests ==========
    /**
     * Test the TimeMachine module.
     */
    function testTimeMachine() {
        group('⏰ Time Machine', () => {
            // Test 34: YEARS array is correct
            assert(TimeMachine.YEARS.length === 9 && TimeMachine.YEARS[0] === 2025,
                'YEARS has 9 entries starting from 2025');

            // Test 35: BAU projection grows over time
            const bau = TimeMachine.projectTrajectory(5.0, 0.03);
            assert(bau[bau.length - 1] > bau[0],
                'BAU trajectory increases over time');

            // Test 36: Action projection decreases over time
            const action = TimeMachine.projectTrajectory(5.0, -0.08);
            assert(action[action.length - 1] < action[0],
                'Action trajectory decreases over time');

            // Test 37: Projections never go below 0.1
            const extreme = TimeMachine.projectTrajectory(0.5, -0.50);
            assert(extreme.every(v => v >= 0.1),
                'Projections floor at 0.1t');

            // Test 38: 2050 BAU > 2050 Action for same start
            const bau2050 = TimeMachine.projectTrajectory(4.0, 0.03)[8];
            const act2050 = TimeMachine.projectTrajectory(4.0, -0.08)[8];
            assert(bau2050 > act2050,
                '2050 BAU > 2050 Action');
        });
    }

    // ========== Edge Case Tests ==========
    /**
     * Test edge cases and boundary conditions.
     */
    function testEdgeCases() {
        group('🛡️ Edge Cases & Security', () => {
            // Test 39: Storage handles undefined gracefully
            Storage.set('edge_test', undefined);
            assert(true, 'Setting undefined doesn\'t throw');

            // Test 40: Calculator handles missing/undefined inputs
            try {
                const result = Calculator.calculate({});
                assert(result && typeof result.total === 'number',
                    'Calculator handles empty input object');
            } catch (e) {
                assert(false, 'Calculator handles empty input object', e.message);
            }

            // Test 41: Calculator handles string numbers
            const result = Calculator.calculate({
                carType: 'electric', carKm: '200', publicTransport: '10',
                shortFlights: '5', homeType: 'house_medium', householdSize: '3',
                energySource: 'natural_gas', electricityBill: '120',
                efficientAppliances: 'most', dietType: 'low_meat',
                localFood: 'sometimes', foodWaste: 'moderate',
                clothingItems: '5', electronics: '3', recycling: 'sometimes',
                screenTime: '8', country: 'uk'
            });
            assert(result.total > 0, 'Calculator handles string number inputs');

            // Test 42: History respects 50 entry limit
            Storage.clearAll();
            for (let i = 0; i < 55; i++) {
                Storage.saveFootprint({ total: i, breakdown: {} });
            }
            const history = Storage.getHistory();
            assert(history.length <= 50, 'History respects 50 entry limit');

            // Test 43: Country averages are all positive
            const allPositive = Object.values(Calculator.COUNTRY_AVERAGES).every(v => v > 0);
            assert(allPositive, 'All country averages are positive');

            // Test 44: Diet emissions are ordered correctly
            const diets = Calculator.DIET_EMISSIONS;
            assert(diets.heavy_meat > diets.medium_meat &&
                   diets.medium_meat > diets.vegan,
                'Diet emissions are ordered: heavy_meat > medium_meat > vegan');
        });
    }

    // ========== Run All ==========
    /**
     * Run all test suites.
     */
    function run() {
        testStorage();
        testCalculator();
        testChallenges();
        testWhatIf();
        testTimeMachine();
        testEdgeCases();
        renderResults();
    }

    /**
     * Render the test results to the DOM.
     */
    function renderResults() {
        document.getElementById('totalTests').textContent = total;
        document.getElementById('passedTests').textContent = passed;
        document.getElementById('failedTests').textContent = failed;
        document.getElementById('passRate').textContent = 
            total > 0 ? Math.round((passed / total) * 100) + '%' : '0%';
        document.getElementById('progressFill').style.width = 
            total > 0 ? ((passed / total) * 100) + '%' : '0%';

        const container = document.getElementById('results');
        let html = '';
        let currentGroup = '';

        results.forEach(item => {
            if (item.group) {
                if (currentGroup) html += '</div>';
                currentGroup = item.group;
                html += `<div class="test-group"><h3 class="group-title">${item.group}</h3>`;
                return;
            }
            html += `
                <div class="test ${item.pass ? 'pass' : 'fail'}">
                    <span class="test-icon">${item.pass ? '✅' : '❌'}</span>
                    <span class="test-name">${item.name}</span>
                    ${item.detail && !item.pass ? `<span class="test-detail">${item.detail}</span>` : ''}
                </div>
            `;
        });
        if (currentGroup) html += '</div>';

        container.innerHTML = html;
    }

    // Auto-run
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    return { run, results: () => ({ total, passed, failed }) };
})();
