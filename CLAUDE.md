# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "LoL-Clicker" - an incremental game about League of Legends progression built with Next.js 15 and TypeScript. Players progress through ranks, collect champions, and build items while experiencing the core mechanics of League of Legends in an incremental format.

## Development Commands

- `npm run dev` - Start development server with Turbopack for fast refresh
- `npm run build` - Build production version
- `npm start` - Start production server
- `npm run lint` - Run Next.js linter

## Architecture & Structure

**Framework Stack:**
- Next.js 15.4.4 with App Router (src/app directory structure)
- React 19.1.0 
- TypeScript with strict mode enabled
- Tailwind CSS v4 for styling
- Turbopack for development builds

**Key Files:**
- `src/app/layout.tsx` - Root layout with Geist fonts configured
- `src/app/page.tsx` - Main homepage (currently default Next.js template)
- `tsconfig.json` - TypeScript config with path aliasing (@/* -> ./src/*)
- Path aliasing available: Use `@/` to reference files in the src directory

**Current State:**
Ready for rebranding from police theme to League of Legends theme. The game features a comprehensive incremental system that needs adaptation:

**Core Systems (Needs Rebranding):**
- Advanced clicking mechanics (to be adapted for last-hitting minions)
- Big number support using break_eternity.js (K, M, B, T, Qa, Qi, Sx, Sp, Oc, No)
- Seven upgrade types (to be adapted for LoL items and champion progression)
- Rank progression system (to be adapted to LoL ranking: Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster → Challenger)
- Rank-based bonuses (to be adapted for LP and division bonuses)
- Auto-save/load functionality using localStorage

**Advanced Features (Needs Rebranding):**
- Prestige system (to be adapted as "Season Reset" mechanic) with Mastery Points
- Legacy upgrades (to be adapted for champion mastery and rune progression)
- Achievement system with real-time unlocking and notifications
- Mini-games (to be adapted for team fights and objective control)
- Random events system (to be adapted for LoL events like Double XP weekends)
- Equipment system (to be adapted for 6 item slots: Boots, Core Items, Support Items)
- 5 rarity tiers (to be adapted for item quality and champion skin tiers)

**Polish & Experience (Needs Rebranding):**
- Sound system with Web Audio API synthesis (to be adapted for LoL game sounds)
- Theme system (Dark/Light/Auto) with custom color picker (to be adapted for LoL themes)
- Statistics dashboard (to be adapted for match history and KDA tracking)
- Save import/export functionality with cross-platform compatibility
- Mobile responsive design with touch optimization
- Building system (to be adapted for team/guild management)
- Enhanced animations with particle effects (to be adapted for LoL visual effects)

**Technical Stack:**
- break_eternity.js for big number calculations
- Web Audio API for professional sound synthesis
- CSS Custom Properties for dynamic theming
- localStorage for persistent data with validation