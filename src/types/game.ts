import Decimal from "break_eternity.js";

// Item interface
export interface Item {
  id: string;
  name: string;
  description: string;
  baseCost: Decimal;
  tier: 'starting' | 'basic' | 'epic' | 'legendary' | 'mythic';
  effect: {
    type: 'click_multiplier' | 'passive_gold' | 'experience_bonus';
    value: Decimal;
  };
  icon: string;
  color: string;
}

// Game state interface
export interface GameState {
  gold: Decimal;
  experience: Decimal;
  level: number;
  clickValue: Decimal;
  goldPerSecond: Decimal;
  totalGoldEarned: Decimal;
  rank: string;
  division: number;
  leaguePoints: number;
  upgrades: {
    [itemId: string]: Decimal;
  };
}

// Rank interface
export interface Rank {
  name: string;
  divisions: number;
  color: string;
  lpRequired: number;
}

// Rank info interface
export interface RankInfo {
  rank: string;
  division: number;
  color: string;
}