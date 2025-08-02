import Decimal from "break_eternity.js";
import { GameState, MasteryUpgrade } from "@/types/game";
import { MASTERY_UPGRADES, calculateMasteryPointsGained } from "@/constants/game";
import { formatNumber, calculateMasteryUpgradeCost, canPrestige } from "@/utils/gameCalculations";

interface PrestigePanelProps {
  gameState: GameState;
  onPrestige: () => void;
  onPurchaseMasteryUpgrade: (upgrade: MasteryUpgrade) => void;
}

export default function PrestigePanel({ gameState, onPrestige, onPurchaseMasteryUpgrade }: PrestigePanelProps) {
  const prestigeAvailable = canPrestige(gameState);
  const masteryPointsGained = calculateMasteryPointsGained(gameState.totalGoldEarned, gameState.leaguePoints);

  return (
    <div className="mt-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Season Reset (Prestige)</h2>
        
        {/* Current Mastery Points */}
        <div className="text-center mb-6">
          <div className="text-xl font-bold text-purple-400 mb-2">
            {formatNumber(gameState.masteryPoints)} Mastery Points
          </div>
          <div className="text-sm text-gray-400">
            Total Earned: {formatNumber(gameState.totalMasteryPoints)}
          </div>
          <div className="text-xs text-gray-400">
            Season {gameState.seasonCount}
          </div>
        </div>

        {/* Prestige Button */}
        <div className="text-center mb-8">
          <button
            onClick={onPrestige}
            disabled={!prestigeAvailable}
            className={`
              px-6 py-3 rounded-lg font-bold transition-all duration-200
              ${prestigeAvailable 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white cursor-pointer transform hover:scale-105' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {prestigeAvailable 
              ? `Reset Season (+${formatNumber(masteryPointsGained)} MP)`
              : 'Requires 1K Gold or 100 LP'
            }
          </button>
          
          {prestigeAvailable && (
            <div className="text-xs text-yellow-400 mt-2">
              Warning: This will reset all progress except Mastery upgrades!
            </div>
          )}
        </div>

        {/* Mastery Upgrades */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-center">Mastery Upgrades</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MASTERY_UPGRADES.map(upgrade => {
              const currentLevel = gameState.masteryUpgrades[upgrade.id] || new Decimal(0);
              const cost = calculateMasteryUpgradeCost(upgrade, currentLevel);
              const canAfford = gameState.masteryPoints.gte(cost);
              const maxed = currentLevel.gte(upgrade.maxLevel);
              
              return (
                <div
                  key={upgrade.id}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200
                    ${canAfford && !maxed
                      ? 'border-purple-500 bg-purple-900/20 hover:bg-purple-900/30 cursor-pointer' 
                      : maxed
                      ? 'border-yellow-500 bg-yellow-900/20'
                      : 'border-gray-600 bg-gray-900/20 cursor-not-allowed opacity-60'
                    }
                  `}
                  onClick={() => canAfford && !maxed && onPurchaseMasteryUpgrade(upgrade)}
                >
                  {/* Maxed Badge */}
                  {maxed && (
                    <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold bg-yellow-600 text-white">
                      MAX
                    </div>
                  )}
                  
                  {/* Upgrade Icon */}
                  <div className="text-2xl mb-2 text-center">
                    {upgrade.icon}
                  </div>
                  
                  {/* Upgrade Name */}
                  <h4 className="font-bold text-center mb-2 text-purple-300">
                    {upgrade.name}
                  </h4>
                  
                  {/* Current Level */}
                  <div className="text-center mb-2">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                      Level {currentLevel.toString()}/{upgrade.maxLevel}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-300 text-center mb-3">
                    {upgrade.description}
                  </p>
                  
                  {/* Effect */}
                  <div className="text-xs text-center mb-3">
                    {upgrade.effect.type === 'global_multiplier' && (
                      <span className="text-green-400">
                        +{((upgrade.effect.value.toNumber() - 1) * 100).toFixed(1)}% per level
                      </span>
                    )}
                    {upgrade.effect.type === 'starting_gold' && (
                      <span className="text-yellow-400">
                        +{upgrade.effect.value.toString()} starting gold per level
                      </span>
                    )}
                    {upgrade.effect.type === 'lp_bonus' && (
                      <span className="text-blue-400">
                        +{upgrade.effect.value.toString()} LP per last-hit per level
                      </span>
                    )}
                    {upgrade.effect.type === 'item_discount' && (
                      <span className="text-orange-400">
                        -{((1 - upgrade.effect.value.toNumber()) * 100).toFixed(1)}% item cost per level
                      </span>
                    )}
                  </div>
                  
                  {/* Cost */}
                  {!maxed && (
                    <div className="text-center">
                      <span className={`
                        text-sm font-bold
                        ${canAfford ? 'text-purple-400' : 'text-red-400'}
                      `}>
                        {formatNumber(cost)} MP
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Mastery Points are earned based on total gold earned and League Points achieved.</p>
          <p className="mt-1">Season Reset keeps your Mastery upgrades but resets everything else!</p>
        </div>
      </div>
    </div>
  );
}