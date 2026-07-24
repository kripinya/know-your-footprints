/**
 * Assistant Module — Smart EcoBot chatbot with context-aware responses.
 * Uses rule-based NLP with keyword matching and user context for personalized advice.
 * 
 * @module Assistant
 */

const Assistant = (() => {
    "use strict";

    let isProcessing = false;

    /**
     * Initialize the assistant with a welcome message.
     */
    function init() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && chatMessages.children.length === 0) {
            const footprint = Storage.getFootprint();
            let welcomeMsg;

            if (footprint) {
                welcomeMsg = `Hey there!  I'm <strong>EcoBot</strong>, your personal sustainability advisor.

I can see your carbon footprint is <strong>${footprint.total.toFixed(1)} tons CO₂/year</strong> (Grade: ${footprint.grade.letter}). That's ${footprint.total <= footprint.comparison.countryAvg ? 'below' : 'above'} your country's average of ${footprint.comparison.countryAvg} tons.

Ask me anything about:
<ul>
<li> Your footprint breakdown and analysis</li>
<li> Personalized reduction strategies</li>
<li> Climate facts and comparisons</li>
<li> Eco-challenges and sustainability tips</li>
</ul>
What would you like to know?`;
            } else {
                welcomeMsg = `Hello!  I'm <strong>EcoBot</strong>, your sustainability advisor.

I can help you understand and reduce your carbon footprint. To give you the best advice, I recommend taking the <strong>Carbon Calculator</strong> first!

In the meantime, feel free to ask me about:
<ul>
<li> Sustainability tips</li>
<li> Climate change facts</li>
<li> Eco-friendly lifestyle choices</li>
<li> Carbon footprint basics</li>
</ul>
How can I help you today?`;
            }

            addMessage('bot', welcomeMsg);
        }
    }

    /**
     * Process a user message and generate a response.
     * @param {string} message - The user's message.
     */
    async function processMessage(message) {
        if (isProcessing || !message.trim()) return;

        isProcessing = true;
        addMessage('user', escapeHtml(message));

        // Show typing indicator
        showTyping();

        const apiKey = sessionStorage.getItem('claude_api_key');
        
        if (apiKey) {
            try {
                const response = await callClaudeApi(message, apiKey);
                hideTyping();
                addMessage('bot', response);
                isProcessing = false;
                return;
            } catch (error) {
                console.error("Claude API Error, falling back to local engine:", error);
                // Fallback to local on error
            }
        }

        // Simulate processing delay for natural feel (Local Engine)
        const delay = 400 + Math.random() * 800;
        setTimeout(() => {
            hideTyping();
            const response = generateResponse(message.toLowerCase().trim());
            addMessage('bot', response);
            isProcessing = false;
        }, delay);
    }

    /**
     * Call Anthropic Claude API directly.
     */
    async function callClaudeApi(message, apiKey) {
        const footprint = Storage.getFootprint();
        const contextMsg = footprint ? `Context: User footprint is ${footprint.total.toFixed(1)} tons CO2/yr.` : 'Context: User has not calculated their footprint yet.';
        const systemPrompt = `You are EcoBot, a sustainability advisor. ${contextMsg} Keep answers concise, friendly, use emojis, and format with simple HTML tags (<strong>, <ul>, <li>, <br>). Do not use markdown.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
                'anthropic-dangerously-allow-browser': 'true'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 400,
                system: systemPrompt,
                messages: [{ role: 'user', content: message }]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    /**
     * Generate a context-aware response based on user input.
     * @param {string} input - Lowercase user input.
     * @returns {string} Bot response as HTML.
     */
    function generateResponse(input) {
        const footprint = Storage.getFootprint();

        // ========== Intent Detection ==========
        
        // Greeting
        if (matchesAny(input, ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'namaste'])) {
            return getGreetingResponse(footprint);
        }

        // Biggest emission source
        if (matchesAny(input, ['biggest', 'largest', 'most', 'highest', 'main source', 'top emission', 'emission source', 'where most'])) {
            return getBiggestSourceResponse(footprint);
        }

        // Footprint comparison
        if (matchesAny(input, ['compare', 'comparison', 'versus', 'vs', 'average', 'how do i', 'how does my', 'where do i stand', 'rank'])) {
            return getComparisonResponse(footprint);
        }

        // Transport tips
        if (matchesAny(input, ['transport', 'car', 'drive', 'driving', 'commute', 'travel', 'flight', 'fly', 'flying', 'vehicle', 'bike', 'cycling'])) {
            return getTransportTips(footprint);
        }

        // Energy tips
        if (matchesAny(input, ['energy', 'electricity', 'power', 'solar', 'renewable', 'heating', 'home energy', 'appliance', 'insulation', 'bill'])) {
            return getEnergyTips(footprint);
        }

        // Diet tips
        if (matchesAny(input, ['diet', 'food', 'eat', 'eating', 'meat', 'vegan', 'vegetarian', 'plant', 'sustainable diet', 'meal'])) {
            return getDietTips(footprint);
        }

        // Shopping / lifestyle
        if (matchesAny(input, ['shopping', 'clothes', 'fashion', 'buy', 'purchase', 'consumption', 'lifestyle', 'consumerism', 'fast fashion'])) {
            return getLifestyleTips(footprint);
        }

        // Recycling / waste
        if (matchesAny(input, ['recycle', 'recycling', 'waste', 'trash', 'garbage', 'compost', 'zero waste', 'landfill', 'plastic'])) {
            return getRecyclingTips(footprint);
        }

        // Carbon offset
        if (matchesAny(input, ['offset', 'carbon offset', 'tree', 'plant tree', 'reforest', 'sequester', 'carbon credit'])) {
            return getCarbonOffsetInfo();
        }

        // Challenge suggestions
        if (matchesAny(input, ['challenge', 'eco challenge', 'activity', 'game', 'try', 'suggest', 'idea'])) {
            return getChallengeResponse();
        }

        // Easy tips / reduction
        if (matchesAny(input, ['easy', 'simple', 'quick', 'tip', 'reduce', 'lower', 'decrease', 'cut', 'save', 'help me reduce', 'recommendations'])) {
            return getEasyTips(footprint);
        }

        // Climate facts
        if (matchesAny(input, ['climate', 'global warming', 'greenhouse', 'co2', 'carbon dioxide', 'paris agreement', 'temperature', '1.5 degree', '2030'])) {
            return getClimateFacts();
        }

        // What is carbon footprint
        if (matchesAny(input, ['what is carbon', 'what is a carbon', 'define carbon', 'carbon footprint mean', 'explain carbon'])) {
            return getCarbonFootprintExplainer();
        }

        // My footprint details
        if (matchesAny(input, ['my footprint', 'my score', 'my result', 'my carbon', 'my emission', 'breakdown', 'detail', 'summary'])) {
            return getFootprintSummary(footprint);
        }

        // Water-related
        if (matchesAny(input, ['water', 'shower', 'tap', 'water footprint', 'water saving'])) {
            return getWaterTips();
        }

        // Thank you / bye
        if (matchesAny(input, ['thank', 'thanks', 'bye', 'goodbye', 'see you', 'appreciate'])) {
            return getGoodbyeResponse();
        }

        // Help
        if (matchesAny(input, ['help', 'what can you do', 'menu', 'options', 'commands'])) {
            return getHelpResponse();
        }

        // Default fallback
        return getFallbackResponse(input);
    }

    // ========== Response Generators ==========

    function getGreetingResponse(fp) {
        if (fp) {
            return `Hey!  Great to see you back! Your current carbon footprint is <strong>${fp.total.toFixed(1)} tons CO₂/year</strong>. Want to explore ways to bring it down? Just ask!`;
        }
        return `Hello!  Welcome to EcoBot! I'm here to help you live more sustainably. Have you taken our <strong>Carbon Calculator</strong> yet? It'll give me context to provide personalized advice!`;
    }

    function getBiggestSourceResponse(fp) {
        if (!fp) return noDataResponse();

        const categories = [
            { name: 'Transportation', value: fp.breakdown.transport.total, icon: '' },
            { name: 'Home Energy', value: fp.breakdown.energy.total, icon: '' },
            { name: 'Diet & Food', value: fp.breakdown.diet.total, icon: '' },
            { name: 'Lifestyle', value: fp.breakdown.lifestyle.total, icon: '' },
        ].sort((a, b) => b.value - a.value);

        const biggest = categories[0];
        const percent = ((biggest.value / fp.total) * 100).toFixed(0);

        let response = `Your biggest emission source is <strong>${biggest.icon} ${biggest.name}</strong> at <strong>${biggest.value.toFixed(1)} tons CO₂/year</strong> (${percent}% of your total).

Here's your full breakdown:
<ol>`;
        categories.forEach(cat => {
            const pct = ((cat.value / fp.total) * 100).toFixed(0);
            response += `<li>${cat.icon} ${cat.name}: <strong>${cat.value.toFixed(2)}t</strong> (${pct}%)</li>`;
        });
        response += `</ol>

Focus on reducing <strong>${biggest.name}</strong> for the biggest impact! Want specific tips for this category?`;

        return response;
    }

    function getComparisonResponse(fp) {
        if (!fp) return noDataResponse();

        const { countryAvg, globalAvg, target2030 } = fp.comparison;
        const vsCountry = fp.total <= countryAvg ? 'below' : 'above';
        const vsGlobal = fp.total <= globalAvg ? 'below' : 'above';
        const countryDiff = Math.abs(fp.total - countryAvg).toFixed(1);
        const globalDiff = Math.abs(fp.total - globalAvg).toFixed(1);

        return `Here's how your footprint compares:

 <strong>Your footprint:</strong> ${fp.total.toFixed(1)} tons CO₂/yr (Grade: ${fp.grade.letter})

 <strong>Country average:</strong> ${countryAvg} tons — you're ${countryDiff}t <strong>${vsCountry}</strong>
 <strong>Global average:</strong> ${globalAvg} tons — you're ${globalDiff}t <strong>${vsGlobal}</strong>
 <strong>2030 Target:</strong> ${target2030} tons — ${fp.total <= target2030 ? ' You meet the target!' : `you need to cut ${(fp.total - target2030).toFixed(1)}t`}

${fp.total <= countryAvg ? ' Great job! You\'re already below your country\'s average!' : ' There\'s room for improvement. Every small change counts!'}`;
    }

    function getTransportTips(fp) {
        let tips = ` <strong>Transportation Tips:</strong>\n\n`;

        if (fp && fp.breakdown.transport.flights > 0.5) {
            tips += ` <strong>Flights are your big one!</strong> At ${fp.breakdown.transport.flights.toFixed(1)}t/yr, reducing just one flight saves ~0.55t.\n\n`;
        }

        tips += `Here are effective ways to cut transport emissions:

<ul>
<li> <strong>Bike or walk</strong> for trips under 5 km — zero emissions!</li>
<li> <strong>Use public transport</strong> — trains emit 5-10x less than cars per km</li>
<li> <strong>Carpool</strong> to split emissions between passengers</li>
<li> <strong>Consider an EV</strong> — up to 70% less emissions than petrol cars</li>
<li> <strong>Work remotely</strong> when possible to avoid daily commuting</li>
<li> <strong>Take trains instead of flying</strong> for trips under 800 km</li>
</ul>

${fp ? `Your current transport footprint: <strong>${fp.breakdown.transport.total.toFixed(1)}t/year</strong>` : ''}`;

        return tips;
    }

    function getEnergyTips(fp) {
        let tips = ` <strong>Home Energy Tips:</strong>\n\n`;

        if (fp && fp.inputs.energySource === 'coal') {
            tips += ` <strong>You're on a high-carbon energy grid.</strong> Switching to renewable energy could save up to 1.5t/yr!\n\n`;
        }

        tips += `<ul>
<li> <strong>Switch to renewable energy</strong> — choose a green energy provider</li>
<li> <strong>Use LED bulbs</strong> — they use 75% less energy than incandescent</li>
<li> <strong>Adjust thermostat</strong> — 1°C lower in winter saves ~300 kg CO₂/yr</li>
<li> <strong>Unplug devices</strong> — standby power wastes 5-10% of home electricity</li>
<li> <strong>Insulate your home</strong> — reduces heating needs by up to 40%</li>
<li> <strong>Shorter showers</strong> — saves both water and water-heating energy</li>
<li> <strong>Full loads only</strong> — run dishwashers and washing machines when full</li>
</ul>

${fp ? `Your current energy footprint: <strong>${fp.breakdown.energy.total.toFixed(1)}t/year</strong>` : ''}`;

        return tips;
    }

    function getDietTips(fp) {
        let intro = '';
        if (fp) {
            const diet = fp.inputs.dietType;
            if (diet === 'heavy_meat' || diet === 'medium_meat') {
                intro = ` Your current ${diet === 'heavy_meat' ? 'heavy' : 'medium'} meat diet contributes <strong>${fp.breakdown.diet.food.toFixed(1)}t/yr</strong>. Even small changes can make a big difference!\n\n`;
            } else if (diet === 'vegan') {
                intro = ` Amazing! Your vegan diet is already very eco-friendly at only <strong>${fp.breakdown.diet.food.toFixed(1)}t/yr</strong>!\n\n`;
            }
        }

        return ` <strong>Sustainable Diet Tips:</strong>

${intro}<ul>
<li> <strong>Try Meatless Mondays</strong> — cutting 1 day of meat saves ~0.2t/yr</li>
<li> <strong>Explore plant proteins</strong> — lentils, beans, tofu have 10-50x less emissions</li>
<li> <strong>Choose sustainable fish</strong> — look for MSC-certified seafood</li>
<li> <strong>Buy local & seasonal</strong> — reduces transport emissions significantly</li>
<li> <strong>Reduce food waste</strong> — plan meals and use leftovers creatively</li>
<li> <strong>Try plant-based milk</strong> — oat milk has 80% less emissions than dairy</li>
<li> <strong>Choose organic when possible</strong> — supports sustainable farming</li>
</ul>

 <strong>Fun fact:</strong> If everyone ate plant-based, global food emissions would drop by 70%!`;
    }

    function getLifestyleTips(fp) {
        return ` <strong>Sustainable Lifestyle Tips:</strong>

<ul>
<li> <strong>Buy less, buy better</strong> — quality items last longer and reduce waste</li>
<li> <strong>Thrift & second-hand</strong> — shopping second-hand saves ~25 kg CO₂ per item</li>
<li> <strong>Repair instead of replace</strong> — extend the life of electronics and clothes</li>
<li> <strong>Keep electronics longer</strong> — manufacturing accounts for 80% of a phone's carbon footprint</li>
<li> <strong>Gift experiences, not things</strong> — less material consumption, more memories</li>
<li> <strong>Minimize packaging</strong> — choose products with less or recyclable packaging</li>
<li> <strong>Support sustainable brands</strong> — look for B-Corp and Fair Trade certifications</li>
</ul>

${fp ? `Your lifestyle footprint: <strong>${fp.breakdown.lifestyle.total.toFixed(1)}t/year</strong> (clothing: ${fp.breakdown.lifestyle.clothing.toFixed(2)}t, electronics: ${fp.breakdown.lifestyle.electronics.toFixed(2)}t)` : ''}`;
    }

    function getRecyclingTips(fp) {
        return ` <strong>Recycling & Waste Reduction:</strong>

<ul>
<li> <strong>Follow the 5 R's:</strong> Refuse → Reduce → Reuse → Recycle → Rot (compost)</li>
<li> <strong>Sort waste properly</strong> — contaminated recycling goes to landfill</li>
<li> <strong>Start composting</strong> — diverts 30% of household waste from landfills</li>
<li> <strong>Say no to single-use plastics</strong> — bring reusable bags, bottles, and containers</li>
<li> <strong>Recycle electronics</strong> — e-waste contains valuable recoverable materials</li>
<li> <strong>Buy refillable products</strong> — cleaning supplies, soaps, and detergents</li>
<li> <strong>Go digital</strong> — reduce paper waste with digital subscriptions</li>
</ul>

 <strong>Did you know?</strong> Recycling one aluminum can saves enough energy to run a TV for 3 hours!`;
    }

    function getCarbonOffsetInfo() {
        return ` <strong>Carbon Offsets Explained:</strong>

Carbon offsets let you compensate for emissions you can't eliminate by funding projects that reduce CO₂ elsewhere.

<strong>Popular offset projects:</strong>
<ul>
<li> <strong>Reforestation</strong> — planting trees that absorb CO₂ (each tree absorbs ~22 kg/yr)</li>
<li> <strong>Renewable energy</strong> — funding solar/wind projects in developing countries</li>
<li> <strong>Methane capture</strong> — preventing methane from landfills entering the atmosphere</li>
<li> <strong>Clean cookstoves</strong> — providing efficient stoves in developing nations</li>
</ul>

<strong>Important considerations:</strong>
<ul>
<li> Offsets should be a <strong>last resort</strong> — reduce first, offset the rest</li>
<li> Choose <strong>verified standards</strong> (Gold Standard, VCS, CDM)</li>
<li> Typical cost: <strong>$5-$50 per ton</strong> CO₂ offset</li>
</ul>

 <strong>Reduce first, offset second</strong> — every ton you prevent is better than one offset.`;
    }

    function getChallengeResponse() {
        const challenges = [
            { emoji: '', text: 'Bike or walk to work for a day' },
            { emoji: '', text: 'Go meat-free for a whole day' },
            { emoji: '', text: 'Take a 5-minute shower instead of a long one' },
            { emoji: '', text: 'Unplug all devices before bed tonight' },
            { emoji: '', text: 'Bring a reusable bag on your next shopping trip' },
            { emoji: '', text: 'Plant something — a herb, flower, or tree' },
        ];

        const random = challenges.sort(() => 0.5 - Math.random()).slice(0, 3);

        return ` <strong>Here are some eco-challenges for you:</strong>

<ol>
${random.map(c => `<li>${c.emoji} ${c.text}</li>`).join('\n')}
</ol>

Check out the <strong>Challenges</strong> tab for more daily and weekly eco-challenges with points and badges! 

Every small action adds up to big change! `;
    }

    function getEasyTips(fp) {
        let response = ` <strong>Easy Ways to Reduce Your Footprint:</strong>\n\n`;

        if (fp) {
            const recs = Recommendations.getTop(fp, 5);
            response += `Based on your profile, here are your <strong>top personalized recommendations</strong>:\n\n<ol>`;
            recs.forEach(rec => {
                response += `<li>${rec.icon} <strong>${rec.title}</strong> — ${rec.description} (saves ~${rec.saving}t/yr)</li>`;
            });
            response += `</ol>\n\nTotal potential savings: <strong>${recs.reduce((sum, r) => sum + r.saving, 0).toFixed(1)} tons CO₂/year</strong>! `;
        } else {
            response += `<ol>
<li> Walk or bike for short trips</li>
<li> Switch to LED light bulbs</li>
<li> Try one meat-free day per week</li>
<li> Unplug devices when not in use</li>
<li> Recycle and compost regularly</li>
<li> Use reusable bags and water bottles</li>
<li> Take shorter showers</li>
</ol>

Take the <strong>Carbon Calculator</strong> for personalized recommendations based on your lifestyle!`;
        }

        return response;
    }

    function getClimateFacts() {
        return ` <strong>Key Climate Facts:</strong>

<ul>
<li> Earth has warmed by <strong>1.1°C</strong> since pre-industrial times</li>
<li> CO₂ levels are at <strong>424 ppm</strong> — highest in 800,000 years</li>
<li> The Paris Agreement targets <strong>limiting warming to 1.5°C</strong></li>
<li> We need to <strong>cut emissions 45% by 2030</strong> to stay on track</li>
<li> Sea levels have risen <strong>21-24 cm</strong> since 1880</li>
<li> The last 8 years have been the <strong>8 warmest on record</strong></li>
<li> Energy and industry account for <strong>73%</strong> of global emissions</li>
</ul>

The good news? We have the technology and solutions. Individual actions, combined with systemic change, can make a real difference! `;
    }

    function getCarbonFootprintExplainer() {
        return ` <strong>What is a Carbon Footprint?</strong>

Your carbon footprint is the <strong>total amount of greenhouse gases</strong> (measured in CO₂ equivalents) generated by your actions.

<strong>Main contributors:</strong>
<ul>
<li> <strong>Transportation</strong> (driving, flying) — ~27%</li>
<li> <strong>Home energy</strong> (electricity, heating) — ~31%</li>
<li> <strong>Food</strong> (agriculture, processing) — ~21%</li>
<li> <strong>Goods & services</strong> (manufacturing, shipping) — ~21%</li>
</ul>

<strong>Key numbers:</strong>
<ul>
<li> Global average: <strong>4.8 tons</strong> CO₂/person/year</li>
<li> US average: <strong>14.7 tons</strong></li>
<li> India average: <strong>1.9 tons</strong></li>
<li> 2030 target: <strong>2.0 tons</strong> per person</li>
</ul>

Use our <strong>Calculator</strong> to measure yours! `;
    }

    function getFootprintSummary(fp) {
        if (!fp) return noDataResponse();

        return ` <strong>Your Carbon Footprint Summary:</strong>

 <strong>Total: ${fp.total.toFixed(1)} tons CO₂/year</strong> (Grade: ${fp.grade.letter})

Breakdown:
<ul>
<li> Transport: <strong>${fp.breakdown.transport.total.toFixed(2)}t</strong> (Car: ${fp.breakdown.transport.car}t, Flights: ${fp.breakdown.transport.flights}t)</li>
<li> Energy: <strong>${fp.breakdown.energy.total.toFixed(2)}t</strong></li>
<li> Diet: <strong>${fp.breakdown.diet.total.toFixed(2)}t</strong></li>
<li> Lifestyle: <strong>${fp.breakdown.lifestyle.total.toFixed(2)}t</strong></li>
</ul>

 Compared to ${fp.comparison.country} average (${fp.comparison.countryAvg}t): <strong>${fp.total <= fp.comparison.countryAvg ? ' Below' : '⬆ Above'} average</strong>

Check the <strong>Dashboard</strong> for interactive charts and detailed analysis!`;
    }

    function getWaterTips() {
        return ` <strong>Water Conservation Tips:</strong>

While water isn't directly CO₂, water treatment and heating are energy-intensive:

<ul>
<li> <strong>Shorter showers</strong> — 5 mins instead of 10 saves 45 liters per shower</li>
<li> <strong>Fix leaks</strong> — a dripping tap wastes 15,000 liters/year</li>
<li> <strong>Collect rainwater</strong> — great for garden irrigation</li>
<li> <strong>Use cold water for laundry</strong> — saves energy for heating</li>
<li> <strong>Water-smart gardening</strong> — drip irrigation uses 50% less water</li>
<li> <strong>Run full loads</strong> — dishwashers and washing machines</li>
</ul>

 Reducing hot water usage saves both water and the energy used to heat it!`;
    }

    function getGoodbyeResponse() {
        return `Thanks for chatting!  Remember, every small eco-action counts. Keep making green choices and check back anytime for more tips. Have a great day! `;
    }

    function getHelpResponse() {
        return ` <strong>Here's what I can help with:</strong>

<ul>
<li> <strong>"What's my biggest emission source?"</strong> — Analyze your footprint</li>
<li> <strong>"Compare my footprint"</strong> — See how you stack up globally</li>
<li> <strong>"Give me easy tips"</strong> — Personalized reduction advice</li>
<li> <strong>"Transport tips"</strong> — Green commuting strategies</li>
<li> <strong>"Energy tips"</strong> — Home energy efficiency</li>
<li> <strong>"Diet tips"</strong> — Sustainable eating</li>
<li> <strong>"Recycling tips"</strong> — Waste reduction strategies</li>
<li> <strong>"Carbon offsets"</strong> — How offsetting works</li>
<li> <strong>"Suggest a challenge"</strong> — Fun eco-activities</li>
<li> <strong>"Climate facts"</strong> — Key environmental data</li>
</ul>

Just type naturally — I understand conversational language! `;
    }

    function getFallbackResponse(input) {
        const suggestions = [
            'my biggest emission source',
            'easy tips to reduce my footprint',
            'compare my footprint',
            'transport tips',
            'diet tips',
        ];
        const random = suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);

        return `Hmm, I'm not quite sure about that one.  I'm best at sustainability and carbon footprint topics!

Try asking me about:
<ul>
${random.map(s => `<li>"${s}"</li>`).join('\n')}
</ul>

Or type <strong>"help"</strong> to see everything I can do! `;
    }

    function noDataResponse() {
        return `I'd love to help, but I don't have your footprint data yet! 

Take the <strong>Carbon Calculator</strong> first so I can give you personalized advice based on your actual lifestyle. It only takes 2 minutes! `;
    }

    // ========== Helpers ==========

    /**
     * Check if input matches any of the keywords.
     * @param {string} input - User input.
     * @param {string[]} keywords - Keywords to match.
     * @returns {boolean}
     */
    function matchesAny(input, keywords) {
        return keywords.some(keyword => input.includes(keyword));
    }

    /**
     * Add a message to the chat UI.
     * @param {'bot'|'user'} type - Message sender type.
     * @param {string} html - Message content as HTML.
     */
    function addMessage(type, html) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const avatar = type === 'bot' ? '' : '';
        const message = document.createElement('div');
        message.className = `chat-message ${type}`;
        message.innerHTML = `
            <div class="chat-avatar">${avatar}</div>
            <div class="chat-bubble">${html}</div>
        `;

        container.appendChild(message);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Show typing indicator.
     */
    function showTyping() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const typing = document.createElement('div');
        typing.className = 'chat-message bot';
        typing.id = 'typingIndicator';
        typing.innerHTML = `
            <div class="chat-avatar"></div>
            <div class="chat-bubble typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Hide typing indicator.
     */
    function hideTyping() {
        const el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    /**
     * Escape HTML to prevent XSS in user messages.
     * @param {string} text - Raw text to escape.
     * @returns {string} Escaped HTML string.
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        init,
        processMessage,
        addMessage,
    };
})();
