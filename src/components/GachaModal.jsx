import { Hexagon, Flame, Sparkles } from 'lucide-react';
import { SET_BONUSES } from '../data/gachaPool';

export const GachaModal = ({ gachaState, currentRarityConfig, getRarityConfig, closeGacha }) => {
  if (gachaState.status === 'idle') return null;

  const isMulti = gachaState.results.length > 1;
  const newCount = gachaState.results.filter(r => r.item?.type && !r.isDuplicate).length;
  const totalDupCores = gachaState.results.reduce((sum, r) => {
    if (!r.isDuplicate) return sum;
    return sum + (r.rarity === 'UR' ? 5 : (r.rarity === 'SSR' ? 3 : 1));
  }, 0);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
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
        <div className="relative flex flex-col items-center justify-between w-full h-full z-20 p-4 pt-8">
          <div className="text-center shrink-0">
            <span className={`font-black text-xl tracking-widest ${getRarityConfig(gachaState.highestRarity).color}`}>
              {isMulti ? '✨ 十連重構解析結果 ✨' : getRarityConfig(gachaState.highestRarity).label}
            </span>
            {gachaState.isUpgrade && (
              <div className="text-xs text-rose-400 font-bold mt-1 animate-pulse">
                ⚡ 成功突發昇格：突破底層機率限制！
              </div>
            )}
            {gachaState.results.some(r => r.item?.type) && (
              <div className="flex items-center justify-center gap-2 mt-2 text-[11px] font-bold">
                {newCount > 0 && (
                  <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles size={11} /> 新收錄 {newCount} 件
                  </span>
                )}
                {totalDupCores > 0 && (
                  <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 px-2.5 py-0.5 rounded-full">
                    重複轉化 +{totalDupCores} 資料核心
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 抽卡結果卡牌清單 */}
          <div className={`w-full overflow-y-auto touch-pan-y max-h-[68vh] p-2 my-auto ${isMulti ? 'grid grid-cols-2 gap-2.5 items-stretch' : 'flex flex-col items-center justify-center'}`}>
            {gachaState.results.map((res, i) => {
              const cfg = getRarityConfig(res.rarity);
              const itemName = res.item.item || res.item;
              const dupCores = res.rarity === 'UR' ? 5 : (res.rarity === 'SSR' ? 3 : 1);
              const isVirtualNew = Boolean(res.item?.type) && !res.isDuplicate;
              const setInfo = res.item?.set && SET_BONUSES[res.item.set];
              const displaySymbol = res.item?.emoji || res.item?.extra || res.item?.icon;

              return (
                <div
                  key={i}
                  className={`bg-gray-900 border-2 ${cfg.border} ${isMulti ? 'p-3' : 'p-5 w-full max-w-sm'} rounded-xl ${cfg.shadow} flex flex-col justify-between items-center text-center relative`}
                  style={{ animation: `card-pop ${0.3 + i * 0.08}s ease-out forwards` }}
                >
                  {isVirtualNew && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black absolute -top-2 left-2 bg-gradient-to-r from-emerald-500 to-cyan-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse">
                      NEW!
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black absolute top-2 right-2 ${cfg.badge}`}>
                    {res.rarity}
                  </span>

                  {!isMulti && displaySymbol && (
                    <div className="text-5xl mt-3 mb-1 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                      {displaySymbol}
                    </div>
                  )}

                  <div className={`${isMulti ? 'mt-4 text-xs sm:text-sm' : 'mt-2 text-lg'} mb-1.5 font-black text-white leading-snug`}>
                    {itemName}
                  </div>

                  {setInfo && (
                    <div className="text-[10px] text-cyan-300/90 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full mb-1.5 font-bold">
                      套裝：{setInfo.name.replace(' (3/3)', '')}
                    </div>
                  )}

                  {res.item.buff && (
                    <div className="text-[10px] text-yellow-300 bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-800/40 mb-1.5">
                      🔥 {res.item.buff}
                    </div>
                  )}

                  {res.item.desc && (
                    <div className={`${isMulti ? 'text-[10px]' : 'text-xs'} text-gray-400 leading-relaxed bg-gray-950/60 px-2 py-1.5 rounded-lg border border-gray-800/80 w-full mb-1.5`}>
                      「{res.item.desc}」
                    </div>
                  )}

                  {res.isDuplicate && (
                    <div className="text-[10px] text-cyan-400 font-bold mt-auto">
                      +{dupCores} 資料核心 / +100G
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={closeGacha} className="bg-gray-800 border-2 border-cyan-500 hover:bg-gray-700 text-cyan-300 font-black text-lg py-3 px-8 rounded-full active:scale-95 transition-transform w-full max-w-sm mb-3 shrink-0">
            確認入庫
          </button>
        </div>
      )}
    </div>
  );
};
