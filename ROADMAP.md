# LoL-Clicker Development Roadmap

## Project Vision
An incremental clicker game where players progress through the ranks of League of Legends, earning experience, climbing divisions, and unlocking new champions, items, and gameplay mechanics.

## Phase 1: Core Foundation (Weeks 1-2)

### 1.1 Basic Game Setup
- [ ] Remove default Next.js template content
- [ ] Set up basic game layout and UI structure with League of Legends theme
- [ ] Implement core clicking mechanic (Last-hitting minions)
- [ ] Add basic score/currency system (Gold and Experience Points)
- [ ] Create simple save/load functionality using localStorage

### 1.2 Initial Game Loop
- [ ] Click to last-hit minions for Gold and XP
- [ ] Display current gold, XP, and level
- [ ] Add basic visual feedback for successful last-hits
- [ ] Implement auto-save functionality

## Phase 2: Core Progression (Weeks 3-4)

### 2.1 Upgrades System
- [ ] Create item shop interface (inspired by LoL item system)
- [ ] Implement gold per click multiplier upgrades (starting items → core items)
- [ ] Add automatic income generators (farming efficiency, passive gold generation)
- [ ] Build upgrade cost scaling system with item tiers

### 2.2 Rank Progression
- [ ] Design rank progression system (Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster → Challenger)
- [ ] Implement rank unlocks and LP (League Points) system
- [ ] Add experience/match completion mechanics
- [ ] Create rank-specific upgrade categories and bonuses

## Phase 3: Advanced Features (Weeks 5-6)

### 3.1 Prestige System
- [ ] Implement "Season Reset" prestige mechanic
- [ ] Add prestige currency (Mastery Points)
- [ ] Create permanent progression bonuses (Mastery upgrades)
- [ ] Design prestige upgrade tree with champion mastery themes

### 3.2 Mini-Games & Events
- [ ] Add team fight simulation mini-games
- [ ] Implement random events (Double XP weekends, esports tournaments)
- [ ] Create special limited-time events (World Championship, MSI)
- [ ] Add achievement system with LoL-themed accomplishments

## Phase 4: Polish & Enhancement (Weeks 7-8)

### 4.1 UI/UX Improvements
- [ ] Add animations and particle effects (gold coins, XP particles)
- [ ] Implement sound effects and ambient audio (LoL game sounds)
- [ ] Create responsive design for mobile
- [ ] Add theme toggle (Classic Rift, Dark/Light mode)

### 4.2 Advanced Systems
- [ ] Equipment system (6 item slots: Boots, Core Items, Support Items)
- [ ] Team building and champion collection
- [ ] Statistics and match history dashboard
- [ ] Export/import save functionality

## Phase 5: Extended Content (Weeks 9+)

### 5.1 Content Expansion
- [ ] Add specialized roles (ADC, Support, Jungle, Mid, Top)
- [ ] Implement champion types and role specializations
- [ ] Create storyline and lore elements from LoL universe
- [ ] Add collectibles and easter eggs (skins, chromas, emotes)

### 5.2 Social Features
- [ ] Leaderboards and ranking comparisons
- [ ] Share achievements on social media
- [ ] Community challenges and tournaments
- [ ] Guild/Club system for team progression

## Technical Considerations

### Core Technologies
- Next.js 15 with App Router for routing and SSR
- React 19 for component state management
- TypeScript for type safety
- Tailwind CSS for styling with LoL color scheme
- localStorage for save data (Phase 1)
- Consider upgrading to IndexedDB for complex save data (Phase 3+)

### Performance Priorities
- Optimize click responsiveness (<16ms for smooth last-hitting)
- Implement efficient number formatting for large values (K, M, B notation)
- Use React.memo and useMemo for expensive calculations
- Consider Web Workers for complex team fight simulations in later phases

### Key Game Balance Considerations
- Exponential cost scaling for items and upgrades
- Meaningful choice between different champion builds and roles
- Regular sense of progression through ranks and divisions
- Clear goals and milestones for player engagement

## Success Metrics
- Time to first item purchase
- Session length and retention
- Progression velocity through ranks
- Feature adoption rates

## Stretch Goals: Advanced Progression Mechanics

*Inspired by successful incremental games and League of Legends systems*

### Advanced Scaling Systems
- [ ] Replace linear cost scaling with exponential (1.15x multiplier per purchase)
- [ ] Implement multi-tier resource hierarchy (Gold → Blue Essence → Riot Points)
- [ ] Add champion/item unlock gates at specific rank thresholds
- [ ] Create nested effect systems where item bonuses stack multiplicatively

### Enhanced Prestige Design
- [ ] Exponential prestige costs following ranked season structure
- [ ] Multiple prestige effect categories:
  - Economic bonuses (gold generation, item cost reductions)
  - Champion bonuses (ability power, attack damage multipliers)
  - Strategic improvements (team synergy, objective control)
  - Meta bonuses (patch adaptation, tier list positioning)

### Balance & Infrastructure Systems
- [ ] Champion synergy requirements (team composition bonuses)
- [ ] Diminishing returns on certain mechanics to prevent runaway scaling
- [ ] Resource dependencies (mana costs, cooldown management)
- [ ] Mathematical constants as meaningful progression milestones

### Late-Game Automation & Quality of Life
- [ ] Granular automation controls for different game systems
- [ ] Advanced statistics and build optimization guidance
- [ ] Multiple parallel progression systems (Ranked, ARAM, Teamfight Tactics)
- [ ] Resource persistence rules across season resets

### Complex Interdependencies
- [ ] Role specialization branches (Marksman, Assassin, Tank, Support, Mage)
- [ ] Cross-role synergy bonuses and team compositions
- [ ] Dynamic difficulty scaling based on MMR (Match Making Rating)
- [ ] Seasonal events with temporary progression modifiers (Worlds, MSI, Clash)

### Champion & Item Systems
- [ ] 160+ champion collection system with unique abilities
- [ ] Item build paths and optimization strategies
- [ ] Rune system integration for permanent bonuses
- [ ] Skin collection with cosmetic and minor gameplay bonuses

### Competitive & Social Elements
- [ ] Tournament bracket progression
- [ ] Spectator mode for high-level play simulation
- [ ] Professional scene integration (LCS, LEC, LCK, LPL)
- [ ] Coaching system for strategy optimization

---

*This roadmap is subject to iteration based on user feedback and development insights. All League of Legends content and references are used for educational and fan purposes only.*