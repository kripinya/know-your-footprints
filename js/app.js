/**
 * App Module — Main application controller.
 * Handles navigation, form interactions, and module coordination.
 * 
 * @module App
 */

const App = (() => {
    "use strict";

    // ========== State ==========
    let currentStep = 1;
    const TOTAL_STEPS = 4;

    // ========== Initialization ==========

    /**
     * Initialize the application.
     */
    function init() {
        setupNavigation();
        setupCalculator();
        setupAssistant();
        setupChallenges();
        setupHeroActions();
        setupSettings();
        
        // Load existing data
        const footprint = Storage.getFootprint();
        if (footprint) {
            Dashboard.render(footprint);
        }

        // Initialize challenges
        Challenges.renderAll();

        // Hide loading screen
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            setTimeout(() => {
                loading.style.opacity = '0';
                loading.style.visibility = 'hidden';
            }, 1500);
        }

        console.info(' Know Your Footprints initialized');
    }

    // ========== Navigation ==========

    /**
     * Setup navigation event listeners.
     */
    function setupNavigation() {
        // Nav link clicks
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const page = link.dataset.page;
                navigateTo(page);
            });
        });

        // Mobile nav toggle
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('open');
            });
        }
    }

    /**
     * Navigate to a specific page.
     * @param {string} page - The page ID to navigate to.
     */
    function navigateTo(page) {
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Update pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Close mobile nav
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('open');

        // Page-specific initialization
        if (page === 'assistant') {
            Assistant.init();
            const chatInput = document.getElementById('chatInput');
            if (chatInput) setTimeout(() => chatInput.focus(), 300);
        } else if (page === 'challenges') {
            Challenges.renderAll();
        } else if (page === 'dashboard') {
            const footprint = Storage.getFootprint();
            Dashboard.render(footprint);
        } else if (page === 'future' && typeof TimeMachine !== 'undefined') {
            const footprint = Storage.getFootprint();
            TimeMachine.render(footprint);
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ========== Hero Actions ==========

    /**
     * Setup hero section interactions.
     */
    function setupHeroActions() {
        const getStarted = document.getElementById('heroGetStarted');
        if (getStarted) {
            getStarted.addEventListener('click', () => navigateTo('calculator'));
        }

        const learnMore = document.getElementById('heroLearnMore');
        if (learnMore) {
            learnMore.addEventListener('click', () => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Dashboard empty state button
        const goToCalc = document.getElementById('goToCalcFromDash');
        if (goToCalc) {
            goToCalc.addEventListener('click', () => navigateTo('calculator'));
        }
    }

    // ========== Calculator ==========

    /**
     * Setup calculator form and events.
     */
    function setupCalculator() {
        // Range input displays
        setupRangeInput('carKm', 'carKmValue');
        setupRangeInput('publicTransport', 'publicTransportValue');
        setupRangeInput('electricityBill', 'electricityBillValue');
        setupRangeInput('clothingItems', 'clothingItemsValue');
        setupRangeInput('screenTime', 'screenTimeValue');

        // Button group options
        document.querySelectorAll('.btn-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const inputId = btn.dataset.input;
                const value = btn.dataset.value;

                // Deactivate siblings
                btn.parentElement.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update hidden input
                const input = document.getElementById(inputId);
                if (input) input.value = value;
            });
        });

        // Diet cards
        document.querySelectorAll('.diet-card').forEach(card => {
            card.addEventListener('click', () => {
                const inputId = card.dataset.input;
                const value = card.dataset.value;

                document.querySelectorAll('.diet-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                const input = document.getElementById(inputId);
                if (input) input.value = value;
            });
        });

        // Car type conditional display
        const carType = document.getElementById('carType');
        const carKmGroup = document.getElementById('carKmGroup');
        if (carType && carKmGroup) {
            carType.addEventListener('change', () => {
                carKmGroup.style.display = carType.value === 'none' ? 'none' : 'block';
            });
        }

        // Navigation buttons
        const prevBtn = document.getElementById('calcPrev');
        const nextBtn = document.getElementById('calcNext');
        const submitBtn = document.getElementById('calcSubmit');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentStep > 1) {
                    currentStep--;
                    updateCalculatorStep();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentStep < TOTAL_STEPS) {
                    currentStep++;
                    updateCalculatorStep();
                }
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', submitCalculator);
        }

        // Initialize step
        updateCalculatorStep();
    }

    /**
     * Set up a range input to display its value.
     * @param {string} inputId - Range input ID.
     * @param {string} displayId - Display span ID.
     */
    function setupRangeInput(inputId, displayId) {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        if (input && display) {
            input.addEventListener('input', () => {
                display.textContent = input.value;
            });
        }
    }

    /**
     * Update the visual state of the calculator steps.
     */
    function updateCalculatorStep() {
        // Update step content
        for (let i = 1; i <= TOTAL_STEPS; i++) {
            const stepEl = document.getElementById(`calcStep${i}`);
            if (stepEl) {
                stepEl.classList.toggle('active', i === currentStep);
            }
        }

        // Update step indicators
        document.querySelectorAll('.calc-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === currentStep);
            step.classList.toggle('completed', stepNum < currentStep);
        });

        // Update progress bar
        const progress = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
        const progressBar = document.getElementById('calcProgressBar');
        if (progressBar) {
            progressBar.style.setProperty('--progress', `${progress}%`);
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('calcPrev');
        const nextBtn = document.getElementById('calcNext');
        const submitBtn = document.getElementById('calcSubmit');

        if (prevBtn) prevBtn.disabled = currentStep === 1;
        if (nextBtn) nextBtn.classList.toggle('hidden', currentStep === TOTAL_STEPS);
        if (submitBtn) submitBtn.classList.toggle('hidden', currentStep !== TOTAL_STEPS);
    }

    /**
     * Submit the calculator form and process results.
     */
    function submitCalculator() {
        const inputs = {
            // Transport
            carType: document.getElementById('carType').value,
            carKm: document.getElementById('carKm').value,
            publicTransport: document.getElementById('publicTransport').value,
            shortFlights: document.getElementById('shortFlights').value,
            // Energy
            homeType: document.getElementById('homeType').value,
            householdSize: document.getElementById('householdSize').value,
            energySource: document.getElementById('energySource').value,
            electricityBill: document.getElementById('electricityBill').value,
            efficientAppliances: document.getElementById('efficientAppliances').value,
            // Diet
            dietType: document.getElementById('dietType').value,
            localFood: document.getElementById('localFood').value,
            foodWaste: document.getElementById('foodWaste').value,
            // Lifestyle
            clothingItems: document.getElementById('clothingItems').value,
            electronics: document.getElementById('electronics').value,
            recycling: document.getElementById('recycling').value,
            screenTime: document.getElementById('screenTime').value,
            country: document.getElementById('country').value,
        };

        // Calculate
        const footprint = Calculator.calculate(inputs);

        // Save
        Storage.saveFootprint(footprint);
        Storage.saveProfile(inputs);

        // Show toast
        showToast('success', ` Your carbon footprint: ${footprint.total.toFixed(1)} tons CO₂/year (${footprint.grade.letter})`);

        // Trigger confetti
        triggerConfetti();

        // Navigate to dashboard
        setTimeout(() => {
            navigateTo('dashboard');
        }, 1500);
    }

    // ========== Assistant ==========

    /**
     * Setup the EcoBot assistant UI.
     */
    function setupAssistant() {
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('chatSendBtn');

        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', sendChatMessage);
        }

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.dataset.query;
                if (chatInput) chatInput.value = query;
                sendChatMessage();
            });
        });
    }

    /**
     * Send a message to the assistant.
     */
    function sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) return;

        const message = chatInput.value.trim();
        if (!message) return;

        chatInput.value = '';
        Assistant.processMessage(message);

        // Track chat count for badges
        const challengeData = Storage.getChallengeData();
        challengeData.chatCount = (challengeData.chatCount || 0) + 1;
        Storage.saveChallengeData(challengeData);
    }

    // ========== Challenges ==========

    /**
     * Setup challenges UI.
     */
    function setupChallenges() {
        // Tab switching
        document.querySelectorAll('.challenge-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                document.querySelectorAll('.challenge-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.challenge-content').forEach(c => c.classList.add('hidden'));
                const content = document.getElementById(`challenge${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
                if (content) content.classList.remove('hidden');
            });
        });

        // Delegate challenge completion clicks
        document.addEventListener('click', (e) => {
            const checkBtn = e.target.closest('.challenge-check');
            if (!checkBtn || checkBtn.disabled) return;

            const challengeId = checkBtn.dataset.challenge;
            const points = parseInt(checkBtn.dataset.points) || 0;
            const co2 = parseFloat(checkBtn.dataset.co2) || 0;

            const result = Challenges.completeChallenge(challengeId, points, co2);

            if (result.alreadyDone) {
                showToast('info', ' You already completed this challenge today!');
                return;
            }

            // Animate the check
            const item = checkBtn.closest('.challenge-item');
            if (item) {
                item.classList.add('completed');
                checkBtn.textContent = '';
                checkBtn.disabled = true;
            }

            // Show toast
            showToast('success', ` Challenge completed! +${points} eco points`);

            // Check for new badges
            if (result.newBadges && result.newBadges.length > 0) {
                setTimeout(() => {
                    const badge = Challenges.BADGES.find(b => b.id === result.newBadges[0]);
                    if (badge) {
                        showToast('success', ` New badge earned: ${badge.icon} ${badge.name}!`);
                    }
                }, 1500);
            }

            // Update stats
            Challenges.updateStats();
        });
    }

    // ========== Toast Notifications ==========

    /**
     * Show a toast notification.
     * @param {string} type - success, error, or info.
     * @param {string} message - Text to display.
     * @param {number} [duration=4000] - Duration in ms.
     */
    function showToast(type, message, duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = { success: '', info: 'ℹ', warning: '' };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ'}</span>
            <span class="toast-text">${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ========== Visual Polish ==========

    /**
     * Trigger confetti animation.
     */
    function triggerConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-particle');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.backgroundColor = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7'][Math.floor(Math.random() * 5)];
            
            const duration = Math.random() * 3 + 2;
            confetti.style.animation = `fall ${duration}s linear forwards`;
            
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), duration * 1000);
        }

        if (!document.querySelector('#confettiStyles')) {
            const style = document.createElement('style');
            style.id = 'confettiStyles';
            style.innerHTML = `
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ========== Settings Modal ==========

    /**
     * Setup settings modal.
     */
    function setupSettings() {
        const btn = document.getElementById('settingsBtn');
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('closeSettings');
        const saveBtn = document.getElementById('saveSettingsBtn');
        const resetBtn = document.getElementById('resetDataBtn');
        
        if (!btn || !modal) return;

        btn.addEventListener('click', () => {
            modal.setAttribute('aria-hidden', 'false');
            const keyInput = document.getElementById('claudeApiKey');
            if (keyInput) keyInput.value = sessionStorage.getItem('claude_api_key') || '';
        });

        const closeModal = () => modal.setAttribute('aria-hidden', 'true');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const keyInput = document.getElementById('claudeApiKey');
                if (keyInput && keyInput.value.trim()) {
                    sessionStorage.setItem('claude_api_key', keyInput.value.trim());
                    showToast('success', 'Settings saved!');
                }
                closeModal();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete all local data? This cannot be undone.')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    location.reload();
                }
            });
        }
    }

    // ========== Boot ==========
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        navigateTo,
        showToast,
    };
})();
