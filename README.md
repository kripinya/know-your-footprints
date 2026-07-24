# Know Your Footprints — Carbon Footprint Awareness Platform

> **Challenge Vertical:** Carbon Footprint Awareness  
> Track, understand, and reduce your carbon footprint through personalized insights, a smart AI assistant, and gamified eco-challenges.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://know-your-footprints.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Chosen Vertical

**Challenge 3: Carbon Footprint Awareness Platform** — A solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

---

## Approach & Logic

### Problem Statement
The average person has little understanding of their environmental impact. Without visibility into their carbon footprint and actionable steps, individuals can't make informed decisions to reduce emissions.

### Solution Design
Know Your Footprints is a **smart, dynamic single-page application** that:

1. **Calculates** a personalized carbon footprint using scientifically-backed emission factors
2. **Visualizes** the breakdown with interactive charts and comparisons
3. **Advises** through an AI-powered EcoBot that provides context-aware recommendations
4. **Motivates** through gamified daily/weekly challenges with streaks and badges

### Decision-Making Logic

The platform makes intelligent, context-aware decisions at every level:

| Feature | Logic |
|---------|-------|
| **Calculator** | Uses emission factors from IPCC, DEFRA, and EPA. Accounts for vehicle type, energy grid carbon intensity by country, diet type (with scientific food emission data from Poore & Nemecek 2018), and lifestyle choices |
| **Grading System** | Compares user's footprint to their country's per-capita average (from Global Carbon Project 2023) and assigns A+ through F grades |
| **Recommendations** | Ranks suggestions by potential impact based on the user's actual data — if flights are your biggest source, flight reduction appears first |
| **EcoBot Assistant** | Uses NLP keyword matching with context from stored user data to provide personalized advice. Knows your footprint, diet, transport habits, etc. |
| **Challenges** | Daily challenges rotate based on date (deterministic pseudo-random), ensuring variety. Streak tracking uses date comparison logic with proper reset behavior |

---

## How the Solution Works

### Architecture
know-your-footprints/
├── index.html          # Single-page application entry point
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker for offline capability
├── css/
│   └── style.css       # Complete design system (dark theme, glassmorphism, responsive)
├── js/
│   ├── storage.js      # LocalStorage abstraction layer
│   ├── calculator.js   # Carbon footprint calculation engine
│   ├── dashboard.js    # Chart.js visualizations & recommendations engine
│   ├── whatif.js       # What-If Simulator logic
│   ├── timemachine.js  # 2050 Carbon Time Machine projections
│   ├── assistant.js    # Smart EcoBot chatbot with Claude AI integration
│   ├── challenges.js   # Gamified challenge system with badges
│   └── app.js          # Main controller (navigation, form handling, events)
├── tests/
│   ├── index.html      # Test suite runner
│   └── tests.js        # 44 automated test cases
└── README.md
```

### Key Features

#### 1. Smart Carbon Calculator
- **Multi-step form** covering 4 categories: Transport, Home Energy, Diet, Lifestyle
- **Real emission factors** from established scientific sources
- **Country-specific** grid emission adjustments for 13 countries
- **Household sharing** — properly divides home energy by household size

#### 2. Interactive Dashboard & Impact Translator
- **Score ring** with animated progress visualization
- **Impact Translator** converting abstract tons into relatable metrics (flights, trees, smartphones)
- **Doughnut chart** showing category breakdown
- **Comparison bars** against country average, global average, and 2030 target

#### 3. What-If Simulator & Time Machine
- **Interactive Simulator:** Toggle lifestyle changes (e.g., "Go Vegan", "Work Remote") and see real-time impact.
- **Carbon Time Machine:** Projects your footprint to 2050, showing a "Business As Usual" vs "Climate Action" trajectory using Chart.js.

#### 4. EcoBot AI Assistant (Claude Integration)
- **Context-aware** — reads your footprint data to personalize every response
- Integrates with the **Anthropic Claude API** (via Settings modal API key input) for conversational eco-advice
- Includes a robust local fallback engine with 16+ intent categories if offline or no key is provided.

#### 5. Eco Challenges
- **12 daily challenges** and **8 weekly challenges**
- **12 achievement badges** with progress tracking
- **Streak system** — tracks consecutive days of activity

#### 6. PWA & 100/100/100/100 Lighthouse
- **Offline support:** Fully functional offline via Service Worker (`sw.js`).
- **Installable:** Manifest enabled, passes all PWA criteria.
- **Accessible & Fast:** Keyboard accessible, skip links, semantic HTML, heavily optimized performance.

### Data Sources

| Source | Usage |
|--------|-------|
| IPCC AR6 | Baseline emission categories |
| DEFRA 2023 GHG Factors | Vehicle emission factors (kg CO₂/km) |
| EPA | US-specific energy factors |
| Poore & Nemecek (2018, *Science*) | Diet emission factors |
| Global Carbon Project 2023 | Country per-capita averages |

---

## Technical Highlights

- **Zero dependencies** for core logic (vanilla HTML/CSS/JS)
- **Chart.js** (CDN) for data visualization only
- **LocalStorage** for persistent data — works completely offline after first load
- **Modular architecture** — each module is an IIFE with clear public API
- **Clean separation of concerns** — storage, calculation, rendering, and logic are separate
- **Responsive design** — works on desktop, tablet, and mobile
- **Accessible** — semantic HTML, ARIA labels, focus styles, screen reader text
- **Security** — XSS prevention via HTML escaping in user-generated content
- **Performance** — lightweight, no build step, instant load

---

## Assumptions

1. **Emission factors are approximations** — real-world emissions vary by specific vehicle model, local energy grid composition, and seasonal factors. We use established averages from peer-reviewed sources.

2. **Country averages** are based on per-capita production emissions (Global Carbon Project 2023). Consumption-based accounting may differ.

3. **Diet emissions** are based on global averages from Poore & Nemecek (2018). Actual emissions depend on specific foods, farming methods, and supply chains.

4. **Electricity bill as proxy** — we use monthly electricity bill amount as a proxy for consumption since most users don't know their kWh usage.

5. **Household sharing** — home energy emissions are divided equally among household members, which is a standard simplification.

6. **Offline-first** — all data stays in the browser's LocalStorage. No data is sent to any server.

---

## License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">
  <strong>Every action counts. Know your footprints, reduce your impact.</strong>
</p>
