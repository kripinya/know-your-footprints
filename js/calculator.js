/**
 * Calculator Module — Carbon footprint calculation engine.
 * Uses real emission factors from established scientific sources:
 * - IPCC (Intergovernmental Panel on Climate Change)
 * - DEFRA (UK Department for Environment, Food & Rural Affairs)
 * - EPA (US Environmental Protection Agency)
 * 
 * All values are in metric tons of CO₂ equivalent (tCO₂e) per year.
 * 
 * @module Calculator
 */

const Calculator = (() => {
    // ========== Emission Factors ==========

    /**
     * Vehicle emission factors in kg CO₂ per km.
     * Source: DEFRA 2023 GHG Conversion Factors
     */
    const VEHICLE_EMISSIONS = {
        none: 0,
        small_petrol: 0.147,
        medium_petrol: 0.192,
        large_petrol: 0.282,
        diesel: 0.168,
        hybrid: 0.110,
        electric: 0.053,    // Accounts for grid electricity
    };

    /**
     * Public transport emissions in kg CO₂ per hour.
     * Average across bus, metro, and train.
     */
    const PUBLIC_TRANSPORT_PER_HOUR = 1.8;

    /**
     * Average emissions per flight (round trip) in tons CO₂.
     * Includes radiative forcing multiplier (~1.9x).
     */
    const FLIGHT_EMISSIONS = 0.55;

    /**
     * Home energy base emissions by house type in tons CO₂/year.
     * Based on average energy consumption data.
     */
    const HOME_BASE_EMISSIONS = {
        apartment_small: 1.2,
        apartment_large: 1.8,
        house_small: 2.2,
        house_medium: 3.0,
        house_large: 4.2,
    };

    /**
     * Energy source multipliers.
     * 1.0 = standard grid, lower = cleaner energy.
     */
    const ENERGY_SOURCE_MULTIPLIER = {
        coal: 1.4,
        natural_gas: 1.0,
        mixed: 0.85,
        renewable_partial: 0.5,
        renewable_full: 0.1,
    };

    /**
     * Efficiency discount for energy-efficient appliances.
     */
    const EFFICIENCY_DISCOUNT = {
        none: 1.0,
        some: 0.9,
        most: 0.75,
        all: 0.6,
    };

    /**
     * Diet emissions in tons CO₂/year.
     * Source: Poore & Nemecek, 2018 (Science)
     */
    const DIET_EMISSIONS = {
        heavy_meat: 3.3,
        medium_meat: 2.5,
        low_meat: 1.9,
        pescatarian: 1.7,
        vegetarian: 1.5,
        vegan: 1.1,
    };

    /**
     * Local food discount multiplier.
     * Reduces food transport emissions.
     */
    const LOCAL_FOOD_DISCOUNT = {
        never: 1.0,
        sometimes: 0.95,
        often: 0.9,
        always: 0.82,
    };

    /**
     * Food waste emission addition in tons CO₂/year.
     */
    const FOOD_WASTE_EMISSIONS = {
        none: 0,
        little: 0.15,
        moderate: 0.35,
        lot: 0.6,
    };

    /**
     * Clothing emissions in kg CO₂ per item.
     * Average across fast fashion items.
     */
    const CLOTHING_PER_ITEM_KG = 22;

    /**
     * Electronics emissions in tons CO₂ per device/year.
     */
    const ELECTRONICS_EMISSIONS_FACTOR = 0.08;

    /**
     * Recycling discount on waste emissions.
     */
    const RECYCLING_DISCOUNT = {
        never: 1.0,
        sometimes: 0.9,
        often: 0.75,
        always: 0.55,
    };

    /**
     * Digital carbon footprint: kg CO₂ per hour of screen time.
     * Includes data centers, network, and device energy.
     */
    const SCREEN_TIME_KG_PER_HOUR = 0.036;

    /**
     * Country-average per capita emissions in tons CO₂/year.
     * Source: Global Carbon Project 2023
     */
    const COUNTRY_AVERAGES = {
        india: 1.9,
        usa: 14.7,
        uk: 5.2,
        germany: 8.1,
        china: 8.0,
        japan: 8.5,
        australia: 15.0,
        brazil: 2.2,
        canada: 14.3,
        france: 4.3,
        other_low: 2.0,
        other_mid: 5.0,
        other_high: 10.0,
    };

    /**
     * Country-specific grid emission factor adjustments.
     */
    const COUNTRY_GRID_FACTOR = {
        india: 1.1,
        usa: 1.0,
        uk: 0.8,
        germany: 0.85,
        china: 1.2,
        japan: 0.95,
        australia: 1.1,
        brazil: 0.5,
        canada: 0.6,
        france: 0.35,
        other_low: 0.5,
        other_mid: 0.85,
        other_high: 1.2,
    };

    // ========== Calculation Functions ==========

    /**
     * Calculate transportation emissions.
     * @param {Object} inputs - User inputs.
     * @returns {Object} Breakdown of transport emissions.
     */
    function calcTransport(inputs) {
        const carFactor = VEHICLE_EMISSIONS[inputs.carType] || 0;
        const weeklyKm = parseFloat(inputs.carKm) || 0;
        const carAnnual = (carFactor * weeklyKm * 52) / 1000; // Convert to tons

        const ptHours = parseFloat(inputs.publicTransport) || 0;
        const ptAnnual = (PUBLIC_TRANSPORT_PER_HOUR * ptHours * 52) / 1000;

        const flights = parseFloat(inputs.shortFlights) || 0;
        const flightAnnual = flights * FLIGHT_EMISSIONS;

        return {
            car: Math.round(carAnnual * 100) / 100,
            publicTransport: Math.round(ptAnnual * 100) / 100,
            flights: Math.round(flightAnnual * 100) / 100,
            total: Math.round((carAnnual + ptAnnual + flightAnnual) * 100) / 100,
        };
    }

    /**
     * Calculate home energy emissions.
     * @param {Object} inputs - User inputs.
     * @returns {Object} Breakdown of energy emissions.
     */
    function calcEnergy(inputs) {
        const homeBase = HOME_BASE_EMISSIONS[inputs.homeType] || 2.2;
        const energyMult = ENERGY_SOURCE_MULTIPLIER[inputs.energySource] || 0.85;
        const efficiencyMult = EFFICIENCY_DISCOUNT[inputs.efficientAppliances] || 0.9;
        const householdSize = Math.max(1, parseFloat(inputs.householdSize) || 1);
        const countryGrid = COUNTRY_GRID_FACTOR[inputs.country] || 0.85;

        // Electricity bill as proxy for consumption (adjust base by bill ratio)
        const billRatio = (parseFloat(inputs.electricityBill) || 80) / 100;

        const baseEmissions = homeBase * billRatio * energyMult * efficiencyMult * countryGrid;

        // Per-person share
        const perPerson = baseEmissions / householdSize;

        return {
            electricity: Math.round(perPerson * 0.65 * 100) / 100,
            heating: Math.round(perPerson * 0.25 * 100) / 100,
            other: Math.round(perPerson * 0.10 * 100) / 100,
            total: Math.round(perPerson * 100) / 100,
        };
    }

    /**
     * Calculate diet and food emissions.
     * @param {Object} inputs - User inputs.
     * @returns {Object} Breakdown of diet emissions.
     */
    function calcDiet(inputs) {
        const dietBase = DIET_EMISSIONS[inputs.dietType] || 2.5;
        const localDiscount = LOCAL_FOOD_DISCOUNT[inputs.localFood] || 0.9;
        const wasteAdd = FOOD_WASTE_EMISSIONS[inputs.foodWaste] || 0.15;

        const adjusted = dietBase * localDiscount + wasteAdd;

        return {
            food: Math.round(dietBase * localDiscount * 100) / 100,
            waste: wasteAdd,
            total: Math.round(adjusted * 100) / 100,
        };
    }

    /**
     * Calculate lifestyle and consumption emissions.
     * @param {Object} inputs - User inputs.
     * @returns {Object} Breakdown of lifestyle emissions.
     */
    function calcLifestyle(inputs) {
        const clothingItems = parseFloat(inputs.clothingItems) || 3;
        const clothingAnnual = (clothingItems * 12 * CLOTHING_PER_ITEM_KG) / 1000;

        const electronics = parseFloat(inputs.electronics) || 1;
        const electronicsAnnual = electronics * ELECTRONICS_EMISSIONS_FACTOR;

        const recyclingMult = RECYCLING_DISCOUNT[inputs.recycling] || 0.75;
        const wasteBase = 0.5; // Base waste emissions
        const wasteAnnual = wasteBase * recyclingMult;

        const screenHours = parseFloat(inputs.screenTime) || 6;
        const digitalAnnual = (screenHours * 365 * SCREEN_TIME_KG_PER_HOUR) / 1000;

        const total = clothingAnnual + electronicsAnnual + wasteAnnual + digitalAnnual;

        return {
            clothing: Math.round(clothingAnnual * 100) / 100,
            electronics: Math.round(electronicsAnnual * 100) / 100,
            waste: Math.round(wasteAnnual * 100) / 100,
            digital: Math.round(digitalAnnual * 100) / 100,
            total: Math.round(total * 100) / 100,
        };
    }

    /**
     * Main calculation function — computes full carbon footprint.
     * @param {Object} inputs - All user inputs from the calculator form.
     * @returns {Object} Complete footprint analysis.
     */
    function calculate(inputs) {
        const transport = calcTransport(inputs);
        const energy = calcEnergy(inputs);
        const diet = calcDiet(inputs);
        const lifestyle = calcLifestyle(inputs);

        const total = transport.total + energy.total + diet.total + lifestyle.total;
        const roundedTotal = Math.round(total * 10) / 10;

        const countryAvg = COUNTRY_AVERAGES[inputs.country] || 4.8;
        const globalAvg = 4.8;
        const target2030 = 2.0;

        // Grade calculation
        const grade = getGrade(roundedTotal, countryAvg);

        return {
            total: roundedTotal,
            breakdown: {
                transport,
                energy,
                diet,
                lifestyle,
            },
            comparison: {
                countryAvg,
                globalAvg,
                target2030,
                country: inputs.country,
            },
            grade,
            inputs,
        };
    }

    /**
     * Assign a letter grade based on footprint relative to country average.
     * @param {number} total - User's total footprint in tons.
     * @param {number} countryAvg - Country average in tons.
     * @returns {Object} Grade object with letter and description.
     */
    function getGrade(total, countryAvg) {
        const ratio = total / countryAvg;

        if (ratio <= 0.3) return { letter: 'A+', text: 'Exceptional! Climate Champion 🌟', color: '#22c55e' };
        if (ratio <= 0.5) return { letter: 'A', text: 'Excellent! Well below average', color: '#4ade80' };
        if (ratio <= 0.7) return { letter: 'B+', text: 'Great! Below country average', color: '#86efac' };
        if (ratio <= 0.9) return { letter: 'B', text: 'Good, slightly below average', color: '#fbbf24' };
        if (ratio <= 1.1) return { letter: 'C', text: 'Average for your country', color: '#f59e0b' };
        if (ratio <= 1.3) return { letter: 'C-', text: 'Above average — room to improve', color: '#fb923c' };
        if (ratio <= 1.6) return { letter: 'D', text: 'High footprint — action needed', color: '#f43f5e' };
        return { letter: 'F', text: 'Very high — significant changes recommended', color: '#ef4444' };
    }

    /**
     * Get country average emissions.
     * @param {string} country - Country code.
     * @returns {number} Average in tons CO₂/year.
     */
    function getCountryAverage(country) {
        return COUNTRY_AVERAGES[country] || 4.8;
    }

    return {
        calculate,
        getGrade,
        getCountryAverage,
        COUNTRY_AVERAGES,
        DIET_EMISSIONS,
    };
})();
