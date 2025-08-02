import { GameState } from "@/types/game";
import { formatNumber } from "@/utils/gameCalculations";

interface ClickAreaProps {
  gameState: GameState;
  lastHitEffect: boolean;
  onLastHit: () => void;
}

export default function ClickArea({ gameState, lastHitEffect, onLastHit }: ClickAreaProps) {
  return (
    <div className="lg:col-span-2">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-6">The Rift</h2>
        
        {/* Main Click Button */}
        <div className="mb-8">
          <button
            onClick={onLastHit}
            className={`
              relative w-48 h-48 mx-auto rounded-full 
              bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600
              hover:from-purple-400 hover:via-blue-400 hover:to-indigo-500
              active:scale-95 transition-all duration-150
              border-4 border-white/20 shadow-2xl
              ${lastHitEffect ? 'animate-pulse scale-105' : ''}
              group
            `}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <div className="text-4xl mb-2">⚔️</div>
              <div className="text-sm font-medium text-white/90">Last-hit</div>
              <div className="text-sm font-medium text-white/90">Minion</div>
            </div>
            
            {/* Click effect particles */}
            {lastHitEffect && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-bold animate-bounce">
                  +{formatNumber(gameState.clickValue)}g
                </div>
              </div>
            )}
          </button>
        </div>

        <p className="text-gray-400 text-sm">
          Click to last-hit minions and earn gold!
          {gameState.level >= 5 && " You're earning League Points!"}
        </p>

        {gameState.level < 5 && (
          <p className="text-yellow-400 text-sm mt-2">
            Reach level 5 to start earning League Points and climb the ranked ladder!
          </p>
        )}
      </div>
    </div>
  );
}