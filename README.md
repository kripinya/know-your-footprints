# 🌍 Know Your Footprints — Carbon Footprint Awareness Platform

> **Challenge Vertical:** Carbon Footprint Awareness  
> Track, understand, and reduce your carbon footprint through personalized insights, a smart AI assistant, and gamified eco-challenges.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📌 Chosen Vertical

**Challenge 3: Carbon Footprint Awareness Platform** — A solution that helps individuals understand, track, and reduce their carbon footprint through simple actions and personalized insights.

---

## 🎯 Approach & Logic

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

## 🚀 How the Solution Works

### Architecture
```
know-your-footprints/
├── index.html          # Single-page application entry point
├── css/
│   └── style.css       # Complete design system (dark theme, glassmorphism, responsive)
├── js/
│   ├── storage.js      # LocalStorage abstraction layer
│   ├── calculator.js   # Carbon footprint calculation engine
│   ├── dashboard.js    # Chart.js visualizations & recommendations engine
│   ├── assistant.js    # Smart EcoBot chatbot with NLP
│   ├── challenges.js   # Gamified challenge system with badges
│   └── app.js          # Main controller (navigation, form handling, events)
└── README.md
```

### Key Features

#### 1. 🧮 Smart Carbon Calculator
- **Multi-step form** covering 4 categories: Transport, Home Energy, Diet, Lifestyle
- **Real emission factors** from established scientific sources
- **Country-specific** grid emission adjustments for 13 countries
- **Household sharing** — properly divides home energy by household size

#### 2. 📊 Interactive Dashboard
- **Score ring** with animated progress visualization
- **Doughnut chart** showing category breakdown
- **Horizontal bar chart** with sub-category details
- **Comparison bars** against country average, global average, and 2030 target
- **Letter grade** (A+ through F) with context-aware messaging
- **History tracking** — view your footprint over time with trend lines

#### 3. 🤖 EcoBot AI Assistant
- **Context-aware** — reads your footprint data to personalize every response
- **16+ intent categories** including transport tips, diet advice, climate facts, comparisons
- **Typing indicator** for natural conversational feel
- **Quick suggestion chips** for common queries
- **XSS-safe** — all user input is properly escaped

#### 4. 🏆 Eco Challenges
- **12 daily challenges** (5 shown per day, rotated by date)
- **8 weekly challenges** (3 shown per week)
- **12 achievement badges** with progress tracking
- **Streak system** — tracks consecutive days of activity
- **Points system** — earn eco points for completed challenges

### Data Sources

| Source | Usage |
|--------|-------|
| IPCC AR6 | Baseline emission categories |
| DEFRA 2023 GHG Factors | Vehicle emission factors (kg CO₂/km) |
| EPA | US-specific energy factors |
| Poore & Nemecek (2018, *Science*) | Diet emission factors |
| Global Carbon Project 2023 | Country per-capita averages |

---

## 🛠️ Technical Highlights

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

## 📱 Running the Project

Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/know-your-footprints.git
cd know-your-footprints

# Open in browser (macOS)
open index.html

# Or use any HTTP server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

No build tools, no npm install, no configuration needed.

---

## 📝 Assumptions

1. **Emission factors are approximations** — real-world emissions vary by specific vehicle model, local energy grid composition, and seasonal factors. We use established averages from peer-reviewed sources.

2. **Country averages** are based on per-capita production emissions (Global Carbon Project 2023). Consumption-based accounting may differ.

3. **Diet emissions** are based on global averages from Poore & Nemecek (2018). Actual emissions depend on specific foods, farming methods, and supply chains.

4. **Electricity bill as proxy** — we use monthly electricity bill amount as a proxy for consumption since most users don't know their kWh usage.

5. **Household sharing** — home energy emissions are divided equally among household members, which is a standard simplification.

6. **Offline-first** — all data stays in the browser's LocalStorage. No data is sent to any server.

---

## ✅ Evaluation Criteria Alignment

| Criteria | Implementation |
|----------|---------------|
| **Code Quality** | Modular IIFE pattern, JSDoc comments, clear naming, separation of concerns |
| **Security** | XSS prevention, no eval(), no external data submission, input sanitization |
| **Efficiency** | Lightweight (~50 KB total), no build step, lazy chart rendering, minimal DOM operations |
| **Testing** | Manual testing across browsers, input validation, edge case handling |
| **Accessibility** | Semantic HTML5, ARIA labels, focus indicators, color contrast, keyboard navigation |
| **Smart Assistant** | Context-aware EcoBot with 16+ intents, personalized based on user data |
| **Practical Usability** | Real emission factors, actionable tips, progress tracking, gamification |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">
  <strong>🌱 Every action counts. Know your footprints, reduce your impact.</strong>
</p>
