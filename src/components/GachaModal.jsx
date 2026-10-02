import React from 'react';
import { Hexagon, Flame } from 'lucide-react';

export const GachaModal = ({ gachaState, currentRarityConfig, getRarityConfig, closeGacha }) => {
  if (gachaState.status === 'idle') return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden touch-none">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity duration-500" />

      {(gachaState.status === 'charging' || gachaState.status === 'upgrading') && (
        <div className={`relative flex items-center justify-center w-full h-full ${gachaState.displayRarity === 'UR' || gachaState.displayRarity === 'SSR' ? 'animate-[camera-shake_0.3s_infinite]' : ''}`}>
          <div className={`absolute w-80 h-80 rounded-full border-2 border-dashed ${currentRarityConfig.ring1}`} style={{ animation: `ring-spin-right 1.2s linear infinite` }} />
          <div className={`absolute w-64 h-64 rounded-full border-[4px] border-dotted ${currentRarityConfig.ring2}`} style={{ animation: `ring-spin-left 0.8s linear infinite` }} />

          <div className={`relative flex flex-col items-center justify-center z-10 ${gachaState.status === 'upgrading' ? 'animate-[upgrade-burst_0.6s_ease-out]' : ''}`} style={{ animation: 'core-shake 0.1s infinite' }}>
            <Hexagon size={110} className={currentRarityConfig.color} fill="currentColor" />
            <div className="absolute font-black text-black text-xl">解析</div>

            {gachaState.status === 'upgrading' ? (
              <div className="text-rose-400 font-black text-2xl tracking-widest mt-8 animate-bounce flex items-center gap-1">
                <Flame /> ⚠️ 協議臨界！信號昇格！ <Flame />
              </div>
            ) : (
              <div className={`${currentRarityConfig.color} font-bold tracking-[0.3em] mt-8`}>
                正在解構資料包 ({gachaState.results.length} 連抽)...
              </div>
            )}
          </div>
        </div>
      )}

      {gachaState.status === 'revealed' && (
        <div className="relative flex flex-col items-center justify-between w-full h-full z-20 p-4 pt-12">
          <div className="text-center">
            <span className={`font-black text-xl tracking-widest ${getRarityConfig(gachaState.highestRarity).color}`}>
              {gachaState.results.length > 1 ? '✨ 十連重構解析結果 ✨' : getRarityConfig(gachaState.highestRarity).label}
            </span>
            {gachaState.isUpgrade && <div className="text-xs text-rose-400 font-bold mt-1 animate-pulse">⚡ 成功突發昇格：突破底層機率限制！</div>}
          </div>

          {/* 抽卡結果卡牌清單 */}
          <div className={`w-full overflow-y-auto max-h-[68vh] p-2 flex flex-col gap-2.5 my-auto ${gachaState.results.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
            {gachaState.results.map((res, i) => {
              const cfg = getRarityConfig(res.rarity);
              const itemName = res.item.item || res.item;
              return (
                <div
                  key={i}
                  className={`bg-gray-900 border-2 ${cfg.border} p-3 rounded-xl ${cfg.shadow} flex flex-col justify-between items-center text-center relative`}
                  style={{ animation: `card-pop ${0.3 + i * 0.08}s ease-out forwards` }}
                >
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black absolute top-2 right-2 ${cfg.badge}`}>
                    {res.rarity}
                  </span>
                  <div className="mt-3 mb-2 font-bold text-sm text-white flex items-center gap-1">
                    {itemName}
                  </div>
                  {res.item.buff && <div className="text-[10px] text-yellow-300 bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-800/40 mb-1">🔥 {res.item.buff}</div>}
                  {res.isDuplicate && <div className="text-[10px] text-cyan-400 font-bold">+1 資料核心 / +100G</div>}
                </div>
              );
            })}
          </div>

          <button onClick={closeGacha} className="bg-gray-800 border-2 border-cyan-500 hover:bg-gray-700 text-cyan-300 font-black text-lg py-3 px-8 rounded-full active:scale-95 transition-transform w-full max-w-sm mb-4">
            確認入庫
          </button>
        </div>
      )}
    </div>
  );
};
