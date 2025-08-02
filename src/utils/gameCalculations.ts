import Decimal from "break_eternity.js";
import { Item, RankInfo, MasteryUpgrade } from "@/types/game";
import { RANKS, ITEMS, LP_PER_DIVISION, RANK_BONUSES, MASTERY_UPGRADES } from "@/constants/game";

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
        const division = Math.min(rank.divisions, Math.floor(lpInRank / LP_PER_DIVISION) + 1);
        return { rank: rank.name, division, color: rank.color };
      }
    }
  }
  return { rank: "Iron", division: 1, color: "#8B5A3C" };
}

// Get rank bonus multiplier
export function getRankBonus(rank: string): number {
  return RANK_BONUSES[rank] || 1.0;
}

// Calculate LP needed for next division/rank
export function getLPNeededForNext(currentLP: number): { needed: number; isRankUp: boolean; nextTarget: string } {
  const currentRank = calculateRank(currentLP);
  const currentRankIndex = RANKS.findIndex(r => r.name === currentRank.rank);
  
  if (currentRankIndex === -1) return { needed: 0, isRankUp: false, nextTarget: "Max Rank" };
  
  const rank = RANKS[currentRankIndex];
  
  // If we're at max rank
  if (currentRankIndex === RANKS.length - 1) {
    return { needed: 0, isRankUp: false, nextTarget: "Challenger" };
  }
  
  // If we're in the highest division of current rank, next is rank up
  if (currentRank.division === rank.divisions) {
    const nextRank = RANKS[currentRankIndex + 1];
    const needed = nextRank.lpRequired - currentLP;
    return { needed, isRankUp: true, nextTarget: `${nextRank.name} 1` };
  }
  
  // Otherwise, next division
  const nextDivisionLP = (currentRank.division) * LP_PER_DIVISION;
  const needed = rank.lpRequired + nextDivisionLP - currentLP;
  return { needed, isRankUp: false, nextTarget: `${rank.name} ${currentRank.division + 1}` };
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

// Calculate mastery upgrade cost
export function calculateMasteryUpgradeCost(upgrade: MasteryUpgrade, currentLevel: Decimal): Decimal {
  return upgrade.baseCost.mul(new Decimal(2).pow(currentLevel));
}

// Calculate global multiplier from mastery upgrades
export function calculateMasteryBonus(masteryUpgrades: { [upgradeId: string]: Decimal }): {
  globalMultiplier: Decimal;
  startingGold: Decimal;
  lpBonus: Decimal;
  itemDiscount: Decimal;
} {
  let globalMultiplier = new Decimal(1);
  let startingGold = new Decimal(0);
  let lpBonus = new Decimal(0);
  let itemDiscount = new Decimal(1);

  MASTERY_UPGRADES.forEach(upgrade => {
    const level = masteryUpgrades[upgrade.id] || new Decimal(0);
    if (level.gt(0)) {
      switch (upgrade.effect.type) {
        case 'global_multiplier':
          globalMultiplier = globalMultiplier.mul(upgrade.effect.value.pow(level));
          break;
        case 'starting_gold':
          startingGold = startingGold.add(upgrade.effect.value.mul(level));
          break;
        case 'lp_bonus':
          lpBonus = lpBonus.add(upgrade.effect.value.mul(level));
          break;
        case 'item_discount':
          itemDiscount = itemDiscount.mul(upgrade.effect.value.pow(level));
          break;
      }
    }
  });

  return { globalMultiplier, startingGold, lpBonus, itemDiscount };
}

// Check if prestige is available (minimum requirements)
export function canPrestige(gameState: { totalGoldEarned: Decimal; leaguePoints: number }): boolean {
  return gameState.totalGoldEarned.gte(1000) || gameState.leaguePoints >= 100;
}