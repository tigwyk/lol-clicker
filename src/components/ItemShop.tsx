import Decimal from "break_eternity.js";
import { GameState, Item } from "@/types/game";
import { ITEMS } from "@/constants/game";
import { formatNumber, calculateUpgradeCost } from "@/utils/gameCalculations";

interface ItemShopProps {
  gameState: GameState;
  onPurchaseItem: (item: Item) => void;
}

export default function ItemShop({ gameState, onPurchaseItem }: ItemShopProps) {
  return (
    <div className="mt-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Item Shop</h2>
        
        {/* Shop Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ITEMS.map(item => {
            const currentLevel = gameState.upgrades[item.id] || new Decimal(0);
            const cost = calculateUpgradeCost(item, currentLevel);
            const canAfford = gameState.gold.gte(cost);
            
            return (
              <div
                key={item.id}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200
                  ${canAfford 
                    ? 'border-green-500 bg-green-900/20 hover:bg-green-900/30 cursor-pointer' 
                    : 'border-gray-600 bg-gray-900/20 cursor-not-allowed opacity-60'
                  }
                `}
                onClick={() => canAfford && onPurchaseItem(item)}
              >
                {/* Item Tier Badge */}
                <div className={`
                  absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold
                  ${item.tier === 'starting' && 'bg-gray-600 text-white'}
                  ${item.tier === 'basic' && 'bg-green-600 text-white'}
                  ${item.tier === 'epic' && 'bg-purple-600 text-white'}
                  ${item.tier === 'legendary' && 'bg-orange-600 text-white'}
                  ${item.tier === 'mythic' && 'bg-red-600 text-white'}
                `}>
                  {item.tier.toUpperCase()}
                </div>
                
                {/* Item Icon */}
                <div className="text-3xl mb-2 text-center" style={{ color: item.color }}>
                  {item.icon}
                </div>
                
                {/* Item Name */}
                <h3 className="font-bold text-center mb-2" style={{ color: item.color }}>
                  {item.name}
                </h3>
                
                {/* Current Level */}
                {currentLevel.gt(0) && (
                  <div className="text-center mb-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      Level {currentLevel.toString()}
                    </span>
                  </div>
                )}
                
                {/* Item Description */}
                <p className="text-sm text-gray-300 text-center mb-3">
                  {item.description}
                </p>
                
                {/* Effect Description */}
                <div className="text-xs text-center mb-3">
                  {item.effect.type === 'click_multiplier' && (
                    <span className="text-red-400">
                      +{item.effect.value.toString()}x click damage
                    </span>
                  )}
                  {item.effect.type === 'passive_gold' && (
                    <span className="text-green-400">
                      +{item.effect.value.toString()} gold/sec
                    </span>
                  )}
                  {item.effect.type === 'experience_bonus' && (
                    <span className="text-blue-400">
                      +{item.effect.value.toString()}x experience
                    </span>
                  )}
                </div>
                
                {/* Cost */}
                <div className="text-center">
                  <span className={`
                    text-sm font-bold
                    ${canAfford ? 'text-yellow-400' : 'text-red-400'}
                  `}>
                    {formatNumber(cost)}g
                  </span>
                </div>
                
                {/* Purchase Button Effect */}
                {canAfford && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Shop Instructions */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Purchase items to increase your farming efficiency and passive income!</p>
          <p className="mt-1">Items scale with exponential costs (1.15x per level)</p>
        </div>
      </div>
    </div>
  );
}