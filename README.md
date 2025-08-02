# LoL Clicker
## An incremental game about League of Legends progression

A browser-based clicker game where players progress through the ranks of League of Legends, earning gold and experience while climbing from Iron to Challenger.

## 🎮 Current Features

### Core Gameplay
- **Last-Hit Mechanics**: Click to last-hit minions and earn gold and experience
- **Big Number Support**: Handle ridiculously large numbers using break_eternity.js
- **Smart Formatting**: K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, and scientific notation
- **Visual Feedback**: Floating "+X gold" animations on successful last-hits
- **Auto-Save**: Progress automatically saved every 5 seconds to localStorage

### Ranking System
- **9 LoL Ranks**: Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster → Challenger
- **Division System**: 4 divisions per rank (except Master+ tiers)
- **League Points (LP)**: 100 LP required per division advancement
- **Rank Bonuses**: Progressive multipliers from Iron (1.0x) to Challenger (4.0x)
- **Visual Progress**: LP progress bars showing next division/rank promotion
- **Detailed Stats**: Shows LP needed for next promotion with color-coded indicators

### Item System
**⚔️ Starting Items:**
- **Doran's Blade**: +1.5x click damage (starts at 15g, 1.15x scaling)
- **Doran's Ring**: +1 gold/sec passive income (starts at 25g, 1.15x scaling)

**🗡️ Basic Items:**
- **Long Sword**: +2x click damage (starts at 100g, 1.15x scaling)
- **Amplifying Tome**: +2x experience gain (starts at 150g, 1.15x scaling)
- **Rejuvenation Bead**: +5 gold/sec passive income (starts at 200g, 1.15x scaling)

**⚡ Epic Items:**
- **B.F. Sword**: +3x click damage (starts at 500g, 1.15x scaling)
- **Pickaxe**: +15 gold/sec passive income (starts at 750g, 1.15x scaling)

**💎 Legendary Items:**
- **Infinity Edge**: +5x click damage (starts at 2Kg, 1.15x scaling)
- **Blade of the Ruined King**: +50 gold/sec passive income (starts at 3Kg, 1.15x scaling)

**🌌 Mythic Items:**
- **Kraken Slayer**: +10x click damage (starts at 10Kg, 1.15x scaling)
- **Riftmaker**: +200 gold/sec passive income (starts at 15Kg, 1.15x scaling)

### Prestige System - "Season Reset"
**🏆 Season Reset Mechanic:**
- **Unlock Requirement**: Earn 1,000 total gold OR reach 100 League Points
- **Mastery Points**: Gained based on total gold earned and LP achieved
- **Formula**: (Total Gold ÷ 10,000) + (LP ÷ 100) = Mastery Points earned
- **Complete Reset**: All progress resets except Mastery Points and upgrades
- **Season Counter**: Track total seasons completed

**🌟 Mastery Upgrades:**
- **🏆 Champion Mastery**: +10% global multiplier per level (Max: 50 levels, 2x cost scaling)
- **💰 Wealthy Start**: +100 starting gold per level (Max: 25 levels, 2x cost scaling)
- **⭐ Ranked Expertise**: +1 bonus LP per last-hit per level (Max: 20 levels, 2x cost scaling)
- **📚 Item Knowledge**: -5% item costs per level (Max: 15 levels, 2x cost scaling)

### Advanced Progression
**🎯 Multiplicative Bonuses:**
- Rank bonuses stack with mastery bonuses for compound growth
- Global multipliers affect both gold and experience gains
- Item discounts make progression more efficient across seasons
- Starting gold bonuses accelerate early game progression

**💡 Strategic Depth:**
- Choose between click damage vs passive income items
- Balance experience items for faster leveling
- Plan mastery upgrades for optimal long-term progression
- Decide when to reset for maximum mastery point gains

### Quality of Life Features
**🛡️ Enhanced UI:**
- **Item Shop**: Visual tier badges (Starting, Basic, Epic, Legendary, Mythic)
- **Progress Tracking**: Clear indicators for next rank/division targets
- **Mastery Discounts**: Visual indicators when item discounts are active
- **Smart Tooltips**: Detailed information about effects and scaling

**💾 Save System:**
- **Auto-Save**: Progress saved every 5 seconds with full state preservation
- **Cross-Session**: All mastery progression persists across browser sessions
- **Error Handling**: Robust save/load with validation and error recovery

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd lol-clicker

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000` (or next available port).

### Other Commands
```bash
# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type check
npx tsc --noEmit
```

## 🏗️ Technology Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with modern hooks
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS v4** - Utility-first CSS framework
- **Turbopack** - Fast development builds
- **break_eternity.js** - Big number support for astronomical values

## 📋 Development Roadmap

### ✅ Phase 1: Core Foundation (Complete)
- [x] Basic last-hitting mechanics with LoL theming
- [x] Gold and Experience currency systems
- [x] Item shop with 11 League of Legends themed items
- [x] Rank progression system (Iron → Challenger)
- [x] Auto-save/load functionality
- [x] Visual feedback and animations
- [x] Responsive UI design

### ✅ Phase 2.1: Upgrades System (Complete)
- [x] Item shop interface with LoL-themed items
- [x] 5 item tiers with visual distinction
- [x] Click multipliers and passive gold generation
- [x] Experience bonuses for faster leveling
- [x] Exponential cost scaling (1.15x per level)

### ✅ Phase 2.2: Enhanced Rank Progression (Complete)
- [x] Proper LP system with 100 LP per division
- [x] Rank-specific bonuses from Iron (1.0x) to Challenger (4.0x)
- [x] Visual LP progress tracking with next promotion targets
- [x] Rank bonus integration with all game systems

### ✅ Phase 3.1: Prestige System (Complete)
- [x] "Season Reset" prestige mechanic
- [x] Mastery Points currency system
- [x] 4 permanent mastery upgrade types
- [x] Exponential mastery upgrade scaling
- [x] Smart reset requirements (1K gold OR 100 LP)
- [x] Season tracking and progression persistence

### 🚧 Phase 3.2: Mini-Games & Events (Planned)
- [ ] Team fight simulation mini-games
- [ ] Random events (Double XP weekends, tournaments)
- [ ] Limited-time events (World Championship, MSI)
- [ ] Achievement system with LoL-themed accomplishments

### 🌟 Phase 4: Polish & Enhancement (Future)
- [ ] Enhanced animations and particle effects
- [ ] Sound effects and ambient audio
- [ ] Theme system (Classic Rift, Dark/Light modes)
- [ ] Advanced statistics dashboard
- [ ] Export/import save functionality

### 🎯 Phase 5: Extended Content (Future)
- [ ] Champion collection system
- [ ] Role specialization (ADC, Support, Jungle, Mid, Top)
- [ ] Storyline and lore elements
- [ ] Social features and leaderboards

## 🎯 Game Balance

**Progression Design:**
- **Early Game** (0-100g): Learn last-hitting, purchase starting items
- **Mid Game** (100-1Kg): Build item collection, climb through Bronze/Silver
- **Late Game** (1K-10Kg): Focus on high-tier items, reach Gold/Platinum
- **End Game** (10K+ gold): Mythic items, Diamond+ ranks, prestige preparation
- **Mastery Game** (Post-Prestige): Multi-season optimization, mastery upgrades

**Cost Scaling:**
- **Consistent Scaling**: 1.15x cost increase per item level
- **Rank Bonuses**: Multiplicative bonuses encourage rank progression
- **Mastery Benefits**: Permanent upgrades provide long-term goals
- **Strategic Depth**: Multiple viable upgrade paths and timing decisions

**Idle-Friendly Design:**
- Passive gold generation available from early game
- Multiple tiers of passive income sources
- Experience bonuses reduce active clicking requirement
- Mastery system rewards long-term planning over rapid clicking

## 🤝 Contributing

This project follows the roadmap outlined in `ROADMAP.md`. See `CLAUDE.md` for technical guidance when working with Claude Code.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Gameplay Tips

**For New Players:**
1. Start with Doran's Blade for immediate click damage boost
2. Add Doran's Ring for passive income once you can afford it
3. Focus on reaching level 5 to start earning League Points
4. Balance click items vs passive income based on playstyle

**For Advanced Players:**
1. Plan mastery upgrades based on intended playstyle
2. Consider resetting early for quick mastery points
3. Item Knowledge mastery becomes very powerful with many upgrades
4. Champion Mastery provides the highest long-term scaling

**Optimization Strategies:**
- Reset when mastery point gains exceed current progress rate
- Prioritize Champion Mastery for multiplicative scaling
- Use Item Knowledge to reduce costs across all items
- Balance Wealthy Start and Ranked Expertise based on preferred strategy