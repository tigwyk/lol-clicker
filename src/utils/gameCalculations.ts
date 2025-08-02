import Decimal from "break_eternity.js";
import { Item, RankInfo } from "@/types/game";
import { RANKS, ITEMS } from "@/constants/game";

// Utility function to format large numbers
export function formatNumber(num: Decimal): string {
  if (num.lt(1000)) return num.toFixed(0);
  if (num.lt(1000000)) return (num.div(1000)).toFixed(1) + "K";
  if (num.lt(1000000000)) return (num.div(1000000)).toFixed(1) + "M";
  if (num.lt(1000000000000)) return (num.div(1000000000)).toFixed(1) + "B";
  return (num.div(1000000000000)).toFixed(1) + "T";
}

// Calculate level from experience
export function calculateLevel(experience: Decimal): number {
  return Math.floor(experience.div(100).toNumber()) + 1;
}

// Calculate current rank and division
export function calculateRank(lp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (lp >= RANKS[i].lpRequired) {
      const rank = RANKS[i];
      if (rank.divisions === 1) {
        return { rank: rank.name, division: 1, color: rank.color };
      } else {
        const lpInRank = lp - rank.lpRequired;
        const lpPerDivision = (RANKS[i + 1]?.lpRequired || rank.lpRequired + 400) / rank.divisions;
        const division = Math.min(rank.divisions, Math.floor(lpInRank / lpPerDivision) + 1);
        return { rank: rank.name, division, color: rank.color };
      }
    }
  }
  return { rank: "Iron", division: 1, color: "#8B5A3C" };
}

// Calculate upgrade cost with exponential scaling
export function calculateUpgradeCost(item: Item, currentLevel: Decimal): Decimal {
  return item.baseCost.mul(new Decimal(1.15).pow(currentLevel));
}

// Calculate total click value from upgrades
export function calculateClickValue(upgrades: { [itemId: string]: Decimal }): Decimal {
  let totalMultiplier = new Decimal(1);
  
  ITEMS.forEach(item => {
    if (item.effect.type === 'click_multiplier') {
      const level = upgrades[item.id] || new Decimal(0);
      if (level.gt(0)) {
        totalMultiplier = totalMultiplier.mul(item.effect.value.pow(level));
      }
    }
  });
  
  return totalMultiplier;
}

// Calculate total passive gold from upgrades
export function calculatePassiveGold(upgrades: { [itemId: string]: Decimal }): Decimal {
  let totalPassive = new Decimal(0);
  
  ITEMS.forEach(item => {
    if (item.effect.type === 'passive_gold') {
      const level = upgrades[item.id] || new Decimal(0);
      if (level.gt(0)) {
        totalPassive = totalPassive.add(item.effect.value.mul(level));
      }
    }
  });
  
  return totalPassive;
}

// Calculate experience multiplier from upgrades
export function calculateExperienceMultiplier(upgrades: { [itemId: string]: Decimal }): Decimal {
  let totalMultiplier = new Decimal(1);
  
  ITEMS.forEach(item => {
    if (item.effect.type === 'experience_bonus') {
      const level = upgrades[item.id] || new Decimal(0);
      if (level.gt(0)) {
        totalMultiplier = totalMultiplier.mul(item.effect.value.pow(level));
      }
    }
  });
  
  return totalMultiplier;
}