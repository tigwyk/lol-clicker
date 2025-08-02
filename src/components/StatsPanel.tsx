import { GameState, RankInfo } from "@/types/game";
import { formatNumber, getRankBonus, getLPNeededForNext } from "@/utils/gameCalculations";

interface StatsPanelProps {
  gameState: GameState;
  currentRankInfo: RankInfo;
}

export default function StatsPanel({ gameState, currentRankInfo }: StatsPanelProps) {
  const rankBonus = getRankBonus(gameState.rank);
  const lpProgress = getLPNeededForNext(gameState.leaguePoints);

  return (
    <div className="lg:col-span-1">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-center">Summoner Stats</h2>
        
        {/* Rank Display */}
        <div className="mb-6 text-center">
          <div 
            className="text-3xl font-bold mb-2"
            style={{ color: currentRankInfo.color }}
          >
            {gameState.rank}
            {currentRankInfo.rank !== "Master" && currentRankInfo.rank !== "Grandmaster" && currentRankInfo.rank !== "Challenger" && 
              ` ${gameState.division}`
            }
          </div>
          <div className="text-sm text-gray-400">
            {gameState.leaguePoints} LP
          </div>
          
          {/* Rank Bonus */}
          <div className="text-xs text-blue-400 mt-1">
            +{Math.round((rankBonus - 1) * 100)}% rank bonus
          </div>
          
          {/* Next Rank Progress */}
          {lpProgress.needed > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-400 mb-1">
                {lpProgress.needed} LP to {lpProgress.nextTarget}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    lpProgress.isRankUp ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-400 to-purple-500'
                  }`}
                  style={{ 
                    width: `${Math.max(10, 100 - (lpProgress.needed / 100) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Level */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Level</span>
            <span className="text-sm font-bold text-yellow-400">{gameState.level}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(gameState.experience.mod(100).toNumber())}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {formatNumber(gameState.experience.mod(100))} / 100 XP
          </div>
        </div>

        {/* Gold */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Gold</span>
            <span className="text-lg font-bold text-yellow-400">
              {formatNumber(gameState.gold)}g
            </span>
          </div>
        </div>

        {/* Gold per second */}
        {gameState.goldPerSecond.gt(0) && (
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Gold/sec</span>
              <span className="text-sm text-green-400">
                +{formatNumber(gameState.goldPerSecond)}g/s
              </span>
            </div>
          </div>
        )}

        {/* Total gold earned */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Gold Earned</span>
            <span className="text-sm text-gray-400">
              {formatNumber(gameState.totalGoldEarned)}g
            </span>
          </div>
        </div>

        {/* Click value */}
        <div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Gold per Last-hit</span>
            <span className="text-sm text-blue-400">
              {formatNumber(gameState.clickValue)}g
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}