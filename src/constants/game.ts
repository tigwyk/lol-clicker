import Decimal from "break_eternity.js";
import { Rank, Item } from "@/types/game";

// LoL rank system
export const RANKS: Rank[] = [
  { name: "Iron", divisions: 4, color: "#8B5A3C", lpRequired: 0 },
  { name: "Bronze", divisions: 4, color: "#CD7F32", lpRequired: 400 },
  { name: "Silver", divisions: 4, color: "#C0C0C0", lpRequired: 800 },
  { name: "Gold", divisions: 4, color: "#FFD700", lpRequired: 1200 },
  { name: "Platinum", divisions: 4, color: "#00CED1", lpRequired: 1600 },
  { name: "Diamond", divisions: 4, color: "#40E0D0", lpRequired: 2000 },
  { name: "Master", divisions: 1, color: "#9932CC", lpRequired: 2400 },
  { name: "Grandmaster", divisions: 1, color: "#FF4500", lpRequired: 2700 },
  { name: "Challenger", divisions: 1, color: "#FFD700", lpRequired: 3000 },
];

// LoL Items for upgrades
export const ITEMS: Item[] = [
  // Starting Items
  {
    id: 'dorans_blade',
    name: "Doran's Blade",
    description: 'Increases gold per last-hit',
    baseCost: new Decimal(15),
    tier: 'starting',
    effect: { type: 'click_multiplier', value: new Decimal(1.5) },
    icon: '⚔️',
    color: '#8B4513'
  },
  {
    id: 'dorans_ring',
    name: "Doran's Ring",
    description: 'Provides passive gold generation',
    baseCost: new Decimal(25),
    tier: 'starting',
    effect: { type: 'passive_gold', value: new Decimal(1) },
    icon: '💍',
    color: '#4169E1'
  },
  
  // Basic Items
  {
    id: 'long_sword',
    name: 'Long Sword',
    description: 'Significantly increases last-hit damage',
    baseCost: new Decimal(100),
    tier: 'basic',
    effect: { type: 'click_multiplier', value: new Decimal(2) },
    icon: '🗡️',
    color: '#C0C0C0'
  },
  {
    id: 'amplifying_tome',
    name: 'Amplifying Tome',
    description: 'Boosts experience gain',
    baseCost: new Decimal(150),
    tier: 'basic',
    effect: { type: 'experience_bonus', value: new Decimal(2) },
    icon: '📖',
    color: '#9932CC'
  },
  {
    id: 'rejuvenation_bead',
    name: 'Rejuvenation Bead',
    description: 'Steady passive income',
    baseCost: new Decimal(200),
    tier: 'basic',
    effect: { type: 'passive_gold', value: new Decimal(5) },
    icon: '🔮',
    color: '#32CD32'
  },
  
  // Epic Items
  {
    id: 'bf_sword',
    name: 'B.F. Sword',
    description: 'Massive damage increase',
    baseCost: new Decimal(500),
    tier: 'epic',
    effect: { type: 'click_multiplier', value: new Decimal(3) },
    icon: '⚡',
    color: '#FF6347'
  },
  {
    id: 'pickaxe',
    name: 'Pickaxe',
    description: 'Enhanced farming efficiency',
    baseCost: new Decimal(750),
    tier: 'epic',
    effect: { type: 'passive_gold', value: new Decimal(15) },
    icon: '⛏️',
    color: '#FFD700'
  },
  
  // Legendary Items
  {
    id: 'infinity_edge',
    name: 'Infinity Edge',
    description: 'Critical last-hit multiplier',
    baseCost: new Decimal(2000),
    tier: 'legendary',
    effect: { type: 'click_multiplier', value: new Decimal(5) },
    icon: '💎',
    color: '#FF1493'
  },
  {
    id: 'blade_of_ruined_king',
    name: 'Blade of the Ruined King',
    description: 'Sustain and continuous income',
    baseCost: new Decimal(3000),
    tier: 'legendary',
    effect: { type: 'passive_gold', value: new Decimal(50) },
    icon: '👑',
    color: '#8A2BE2'
  },
  
  // Mythic Items
  {
    id: 'kraken_slayer',
    name: 'Kraken Slayer',
    description: 'Every third attack deals massive bonus gold',
    baseCost: new Decimal(10000),
    tier: 'mythic',
    effect: { type: 'click_multiplier', value: new Decimal(10) },
    icon: '🔱',
    color: '#FF4500'
  },
  {
    id: 'riftmaker',
    name: 'Riftmaker',
    description: 'Tears through the rift for massive passive income',
    baseCost: new Decimal(15000),
    tier: 'mythic',
    effect: { type: 'passive_gold', value: new Decimal(200) },
    icon: '🌌',
    color: '#4B0082'
  }
];