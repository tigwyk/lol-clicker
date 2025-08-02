"use client";

import { useState, useEffect, useCallback } from "react";
import Decimal from "break_eternity.js";
import { GameState, Item } from "@/types/game";
import { 
  calculateLevel, 
  calculateRank, 
  calculateClickValue, 
  calculatePassiveGold, 
  calculateExperienceMultiplier,
  calculateUpgradeCost 
} from "@/utils/gameCalculations";
import StatsPanel from "@/components/StatsPanel";
import ClickArea from "@/components/ClickArea";
import ItemShop from "@/components/ItemShop";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    gold: new Decimal(0),
    experience: new Decimal(0),
    level: 1,
    clickValue: new Decimal(1),
    goldPerSecond: new Decimal(0),
    totalGoldEarned: new Decimal(0),
    rank: "Iron",
    division: 1,
    leaguePoints: 0,
    upgrades: {},
  });

  const [lastHitEffect, setLastHitEffect] = useState(false);

  // Load game data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('lol-clicker-save');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const upgrades: { [itemId: string]: Decimal } = {};
        
        // Convert saved upgrade data back to Decimal
        if (parsed.upgrades) {
          Object.keys(parsed.upgrades).forEach(key => {
            upgrades[key] = new Decimal(parsed.upgrades[key] || 0);
          });
        }
        
        setGameState(prev => ({
          ...prev,
          gold: new Decimal(parsed.gold || 0),
          experience: new Decimal(parsed.experience || 0),
          level: parsed.level || 1,
          clickValue: calculateClickValue(upgrades),
          goldPerSecond: calculatePassiveGold(upgrades),
          totalGoldEarned: new Decimal(parsed.totalGoldEarned || 0),
          rank: parsed.rank || "Iron",
          division: parsed.division || 1,
          leaguePoints: parsed.leaguePoints || 0,
          upgrades,
        }));
      } catch (error) {
        console.error('Failed to load save data:', error);
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const upgrades: { [itemId: string]: string } = {};
      Object.keys(gameState.upgrades).forEach(key => {
        upgrades[key] = gameState.upgrades[key].toString();
      });
      
      const saveData = {
        gold: gameState.gold.toString(),
        experience: gameState.experience.toString(),
        level: gameState.level,
        clickValue: gameState.clickValue.toString(),
        goldPerSecond: gameState.goldPerSecond.toString(),
        totalGoldEarned: gameState.totalGoldEarned.toString(),
        rank: gameState.rank,
        division: gameState.division,
        leaguePoints: gameState.leaguePoints,
        upgrades,
      };
      localStorage.setItem('lol-clicker-save', JSON.stringify(saveData));
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [gameState]);

  // Passive income generation
  useEffect(() => {
    if (gameState.goldPerSecond.gt(0)) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          gold: prev.gold.add(prev.goldPerSecond),
          totalGoldEarned: prev.totalGoldEarned.add(prev.goldPerSecond),
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.goldPerSecond]);

  // Update level when experience changes
  useEffect(() => {
    const newLevel = calculateLevel(gameState.experience);
    if (newLevel !== gameState.level) {
      setGameState(prev => ({ ...prev, level: newLevel }));
    }
  }, [gameState.experience, gameState.level]);

  // Update rank when LP changes
  useEffect(() => {
    const rankInfo = calculateRank(gameState.leaguePoints);
    if (rankInfo.rank !== gameState.rank || rankInfo.division !== gameState.division) {
      setGameState(prev => ({
        ...prev,
        rank: rankInfo.rank,
        division: rankInfo.division,
      }));
    }
  }, [gameState.leaguePoints, gameState.rank, gameState.division]);

  // Handle item purchase
  const purchaseItem = useCallback((item: Item) => {
    const currentLevel = gameState.upgrades[item.id] || new Decimal(0);
    const cost = calculateUpgradeCost(item, currentLevel);
    
    if (gameState.gold.gte(cost)) {
      setGameState(prev => {
        const newUpgrades = { ...prev.upgrades };
        newUpgrades[item.id] = currentLevel.add(1);
        
        return {
          ...prev,
          gold: prev.gold.sub(cost),
          upgrades: newUpgrades,
          clickValue: calculateClickValue(newUpgrades),
          goldPerSecond: calculatePassiveGold(newUpgrades),
        };
      });
    }
  }, [gameState.gold, gameState.upgrades]);

  // Handle minion last-hit click
  const handleLastHit = useCallback(() => {
    const goldGained = gameState.clickValue;
    const expMultiplier = calculateExperienceMultiplier(gameState.upgrades);
    const expGained = new Decimal(1).mul(expMultiplier);
    const lpGained = gameState.level >= 5 ? 1 : 0;

    setGameState(prev => ({
      ...prev,
      gold: prev.gold.add(goldGained),
      experience: prev.experience.add(expGained),
      totalGoldEarned: prev.totalGoldEarned.add(goldGained),
      leaguePoints: prev.leaguePoints + lpGained,
    }));

    // Visual feedback
    setLastHitEffect(true);
    setTimeout(() => setLastHitEffect(false), 200);
  }, [gameState.clickValue, gameState.level, gameState.upgrades]);

  const currentRankInfo = calculateRank(gameState.leaguePoints);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            LoL Clicker
          </h1>
          <p className="text-gray-300">Rise through the ranks of the Rift</p>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <StatsPanel gameState={gameState} currentRankInfo={currentRankInfo} />
          <ClickArea 
            gameState={gameState} 
            lastHitEffect={lastHitEffect} 
            onLastHit={handleLastHit} 
          />
        </div>

        <ItemShop gameState={gameState} onPurchaseItem={purchaseItem} />

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Welcome to the Rift, Summoner. Your journey begins now.</p>
        </div>
      </div>
    </div>
  );
}