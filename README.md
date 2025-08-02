# Cop-Clicker
## An incremental game about cop life

A browser-based clicker game where players progress through a police officer's career, earning respect points and climbing the ranks from Beat Cop to Chief.

## 🎮 Current Features

### Core Gameplay
- **Click Mechanics**: Click the police car to earn Respect Points (RP)
- **Big Number Support**: Handle ridiculously large numbers using break_eternity.js
- **Smart Formatting**: K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, and scientific notation
- **Visual Feedback**: Floating "+X" animations on clicks
- **Auto-Save**: Progress automatically saved every 5 seconds to localStorage

### Progression System
- **6 Police Ranks**: Beat Cop → Detective → Sergeant → Lieutenant → Captain → Chief
- **Rank Requirements**: 0, 100, 500, 2K, 10K, 50K Respect Points
- **Rank Bonuses**: +25% multiplier to all values per rank
- **Progress Tracking**: Visual progress bar showing promotion status

### Upgrade System
**👤 Click Upgrades:**
- **🔧 Equipment**: +1 click value (starts at 10 RP, 1.4x scaling)
- **📚 Training**: +2 click value (starts at 25 RP, 1.6x scaling)

**💰 Passive Income Generators:**
- **👮 Partner**: +1 RP/sec (starts at 15 RP, 1.3x scaling)
- **🚗 Patrol Unit**: +3 RP/sec (starts at 50 RP, 1.5x scaling)
- **🔍 Investigation**: +12 RP/sec (starts at 200 RP, 1.7x scaling)
- **🏢 Precinct**: +50 RP/sec (starts at 1K RP, 2.0x scaling)

**⚡ Automation:**
- **🤖 AI System**: +50% passive income multiplier (starts at 5K RP, 2.5x scaling)

### Prestige System
**🏆 Retirement Mechanic:**
- **Unlock Requirement**: Reach Chief rank (50K RP)
- **Legacy Points**: Gain √(totalRP/50000) Legacy Points on retirement
- **Full Reset**: All progress resets except Legacy Points and Legacy Upgrades
- **Bulk Purchasing**: 1x, 10x, 100x, 1000x, and Max quantity options

**💎 Legacy Upgrades:**
- **⚡ Legacy Efficiency**: +10% income per level (cost: 2^level LP)
- **🧠 Legacy Wisdom**: -2% upgrade costs per level (cost: 2^level LP)  
- **🔨 Legacy Equipment**: -10% rank requirements per level (cost: 2^level LP)
  - Reduces RP needed for all rank promotions
  - Stacks multiplicatively (Level 3 = 72.9% requirements)
  - Maximum 90% reduction at Level 10+
  - Faster rank progression = faster rank bonuses

### Achievement System
**🏆 Achievement Categories:**
- **Progress Milestones**: RP thresholds, rank achievements
- **Upgrade Mastery**: Purchase certain amounts of upgrades
- **Efficiency Goals**: Income/click power milestones
- **Legacy Achievements**: Prestige-related accomplishments
- **Special Challenges**: Unique gameplay goals

**🎯 Achievement Features:**
- **Real-time Checking**: Achievements unlock automatically when criteria are met
- **Instant Notifications**: Pop-up notifications with claim buttons
- **Reward System**: RP bonuses, Legacy Points, or progress boosts
- **Progress Tracking**: Visual progress counter showing unlocked achievements
- **Persistent Progress**: Achievements survive prestige and game resets

**Progression Design:**
- Gentler cost scaling for early passive income access
- Multiple tiers of passive generators for meaningful progression
- Automation multipliers for exponential growth
- Reduced emphasis on clicking in favor of strategic upgrading

### Mini-Games & Events
**📋 Case-Solving System:**
- **Multiple Game Types**: Multiple choice, sequence ordering, evidence analysis
- **Difficulty Tiers**: Easy, Medium, Hard, Expert cases with varying rewards
- **Timer Challenges**: Time-limited cases for extra pressure
- **Equipment Bonuses**: Equipped gear can improve success rates
- **Rank Progression**: New cases unlock as you advance through ranks

**🎲 Random Events:**
- **Dynamic Events**: Crime waves, commendations, equipment finds, training opportunities
- **Temporary Bonuses**: Click multipliers, passive income boosts, upgrade discounts
- **Rank-Based**: Higher ranks unlock access to more event types
- **Visual Notifications**: Real-time event notifications with effects

### Equipment System
**⚔️ Gear Management:**
- **6 Equipment Slots**: Radio, Badge, Weapon, Vest, Vehicle, Gadget
- **5 Rarity Tiers**: Common, Uncommon, Rare, Epic, Legendary
- **Multiple Effects**: Click power, passive income, upgrade costs, case success rates
- **Collection Progress**: Discover and equip better gear as you progress
- **Visual Equipment Grid**: Dedicated UI for managing your equipment loadout

### Enhanced Animations & Effects
**✨ Visual Polish:**
- **Color-Coded Numbers**: Blue (small), Green (medium), Gold (large values)
- **Advanced Animations**: FloatUp particle effects with scale transitions
- **Interactive Feedback**: Button pulse animations for affordable upgrades
- **Glow Effects**: Main button glows when bonuses are active
- **Achievement Celebrations**: Gradient notifications with dual animations

### Sound System
**🔊 Audio Experience:**
- **Dynamic Sound Effects**: Unique tones for clicks, upgrades, achievements, case results, and rank-ups
- **Web Audio API**: Professional audio synthesis using oscillators (sine, square, triangle, sawtooth waves)
- **Ambient Audio**: Optional looping police radio chatter background
- **Volume Controls**: Master volume slider with separate SFX and ambient controls
- **Smart Settings**: Per-category enable/disable toggles with test sound functionality
- **Cross-Browser Support**: Compatible with AudioContext and webkitAudioContext
- **Persistent Preferences**: Sound settings saved with game progress
- **Performance Optimized**: Minimal memory usage with efficient real-time audio generation

### Theme System
**🎨 Visual Customization:**
- **3 Theme Modes**: Dark, Light, and Auto (follows system preference detection)
- **Real-time Theme Switching**: Instant visual transitions with smooth 300ms animations
- **Custom Color Palette**: User-configurable primary, secondary, and accent colors
- **Color Picker Interface**: Intuitive hex color selection with live preview
- **CSS Custom Properties**: Dynamic theme variables for consistent styling across all components
- **Professional Color Schemes**: High-contrast dark and light themes optimized for readability
- **Themed Scrollbars**: Custom scrollbar styling that adapts to the selected theme
- **System Integration**: Auto mode automatically detects and follows OS dark/light preference
- **Reset Functionality**: One-click restoration to default police-themed color scheme
- **Persistent Settings**: Theme preferences and custom colors saved with game progress

### Statistics & Analytics
**📊 Performance Insights:**
- **Comprehensive Tracking**: Real-time monitoring of clicks, RP earned/spent, upgrades purchased, cases solved
- **Performance Metrics**: Click efficiency analysis, passive vs active income ratios, net worth calculations
- **Progression Analytics**: Rank advancement tracking, achievement completion rates, prestige statistics
- **Session Management**: Play time tracking, session counting, first/last play dates
- **Efficiency Analysis**: Income breakdown with optimization insights and strategic recommendations
- **Visual Progress Bars**: Achievement completion rates with color-coded progress indicators
- **Smart Insights**: AI-powered suggestions for optimizing gameplay based on current statistics
- **Historical Data**: Persistent tracking across sessions and prestige cycles
- **Comparative Analysis**: Passive vs click income ratios and efficiency benchmarking
- **Dashboard Interface**: Professional analytics layout with categorized performance sections

### Save Management System
**💾 Import/Export Functionality:**
- **Save Export**: One-click download of complete game state as encoded text file
- **Cross-Platform Compatibility**: Save files work across different devices and browsers
- **Complete Data Preservation**: All progress, settings, equipment, achievements, and statistics included
- **Version Control**: Save files include version metadata for future compatibility
- **Security Features**: Base64 encoding with data validation and error handling
- **Import Validation**: Comprehensive error checking prevents corrupted save data
- **Backup Recommendations**: Built-in warnings encourage users to backup before importing
- **File Naming**: Automatic date-stamped filenames for easy organization
- **User-Friendly Interface**: Clear modals with helpful instructions and warnings

### Mobile Responsive Design
**📱 Cross-Device Compatibility:**
- **Adaptive Layout**: Responsive grid system that works from 320px to 4K displays
- **Touch-Optimized**: 44px minimum touch targets for mobile accessibility compliance
- **Smart Typography**: Responsive text scaling (sm:text-lg, lg:text-xl) for optimal readability
- **Mobile-First Modals**: Optimized modal sizing and positioning for mobile devices
- **Improved Spacing**: Dynamic padding and margins that adapt to screen size
- **Notification System**: Mobile-aware positioning for achievement and event notifications
- **Button Scaling**: Click button scales from 128px (mobile) to 192px (desktop)
- **Input Enhancement**: 16px font size on inputs to prevent zoom on iOS Safari
- **Gesture Support**: Touch-friendly interactions with proper active states
- **Horizontal Scroll Prevention**: CSS safeguards against unwanted horizontal scrolling

### Department Building System
**🏛️ Advanced Management Framework:**
- **6 Building Types**: Police Station, Training Facility, Forensics Lab, Dispatch Center, Armory, Motor Pool
- **Rank-Gated Progression**: Buildings unlock as you advance through police ranks
- **Level-Based Scaling**: Each building has 4-10 upgrade levels with exponential cost scaling
- **Multi-Effect Benefits**: Buildings provide passive income, click bonuses, staff capacity, and special effects
- **Staff Management**: 5 staff types (Officer, Detective, Technician, Dispatcher, Sergeant) with unique skills
- **Assignment System**: Strategic staff placement in buildings for optimal efficiency
- **Skill Synergy**: Staff skills (Investigation, Patrol, Technical, Leadership) affect building performance
- **Upgrade Economics**: Exponential cost scaling (2.0x-2.8x) balanced for long-term progression
- **Visual Integration**: Custom icons and police-themed building designs
- **Save Compatibility**: Full integration with existing save/load and import/export systems

### Statistics & UI
- **Comprehensive Stats**: Track total RP, rank, click power, passive income, and upgrades
- **Adaptive Design**: Works on desktop and mobile devices with responsive layouts
- **Dynamic Theming**: User-customizable dark/light themes with police-inspired color schemes
- **Real-time Updates**: All displays update dynamically with game state changes
- **Accessibility**: High contrast ratios and theme-aware styling for optimal readability
- **Settings Panel**: Centralized control for sound, theme, and game preferences

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd cop-clicker

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

# Type check
npx tsc --noEmit
```

## 🏗️ Technology Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with modern hooks
- **TypeScript** - Type safety and better DX
- **Tailwind CSS v4** - Utility-first CSS framework
- **Turbopack** - Fast development builds
- **break_eternity.js** - Big number support for astronomical values
- **Web Audio API** - Professional sound effects and ambient audio synthesis
- **CSS Custom Properties** - Dynamic theming system with real-time color customization

## 📋 Development Roadmap

### ✅ Phase 1: Core Foundation (Complete)
- [x] Basic clicking mechanics
- [x] Respect Points currency system  
- [x] Upgrade shop with 3 upgrade types
- [x] Rank progression system (6 ranks)
- [x] Auto-save/load functionality
- [x] Visual feedback and animations
- [x] Responsive UI design

### ✅ Phase 2: Core Progression (Complete)
- [x] Prestige system ("Retirement" mechanic)
- [x] Legacy Points currency
- [x] Permanent progression bonuses
- [x] Achievement system with real-time unlocking
- [x] Case-solving mini-games (multiple choice, sequence, evidence)
- [x] Random events system with temporary bonuses

### ✅ Phase 3: Advanced Features (Complete)
- [x] Equipment system with 6 slot types and rarity tiers
- [x] Enhanced animations and particle effects
- [x] Visual click feedback with color-coded numbers
- [x] Button hover animations and glow effects
- [x] Achievement notification animations
- [x] Auto-save with localStorage persistence

### ✅ Phase 4.1: UI/UX Polish (Complete)
- [x] Advanced click animations with particle effects
- [x] Enhanced visual feedback and color coding
- [x] Responsive button interactions
- [x] Sound effects and ambient audio system
- [x] Dark/light theme toggle with customization

### ✅ Phase 4.2: Advanced Systems (Complete)
- [x] Statistics and analytics dashboard
- [x] Export/import save functionality
- [x] Mobile responsive design improvements
- [x] Department building and staff management system (foundational structure)

### 🌟 Phase 5: Extended Content (Future)
- [ ] Specialized units (SWAT, K-9, Detective)
- [ ] Storyline and narrative
- [ ] Social features and leaderboards
- [ ] Community challenges

## 🎯 Game Balance

**Idle-Friendly Design:**
- **Early Passive Access**: First passive income at just 15 RP (15 clicks)
- **Tiered Progression**: Multiple passive generators unlock meaningful growth stages
- **Reduced Click Dependence**: Passive income quickly overtakes clicking
- **Automation Rewards**: AI systems provide exponential scaling for dedicated players

**Progression Curve:**
- **Early Game** (0-100 RP): Learn clicking, unlock first Partner, solve basic cases
- **Mid Game** (100-1K RP): Build passive income portfolio, achieve Detective rank, unlock equipment
- **Late Game** (1K+ RP): Focus on high-tier generators, complete complex cases, optimize equipment
- **End Game** (5K+ RP): Automation multipliers, prestige cycling, achievement hunting
- **Master Game** (50K+ RP): Multiple prestige runs, legacy upgrade optimization, rare equipment collection

**Cost Scaling:**
- **Gentle Early Scaling**: 1.3x-1.6x for early upgrades
- **Strategic Late Scaling**: 2.0x-2.5x for high-tier content
- **Rank Bonuses**: +25% per rank affects all income sources

## 🤝 Contributing

This project follows the roadmap outlined in `ROADMAP.md`. See `CLAUDE.md` for technical guidance when working with Claude Code.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

