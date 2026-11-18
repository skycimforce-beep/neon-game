import { Brain, Zap, Trophy, Coins, CheckCircle2, Swords } from 'lucide-react';
import { RubyText } from './RubyText';

export const BattleReportModal = ({ report, onClose }) => {
  if (!report) return null;

  const {
    avgSpeed,
    prevAvgSpeed,
    isNewBestSpeed,
    flashCount,
    correctCount,
    totalAnswered,
    levelUps,
    nemesisSlain,
    earnedGold,
    bonusGold,
    rankInfo
  } = report;

  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;
  const grade = accuracy === 100 && flashCount >= 2 ? 'S' : (accuracy >= 85 ? 'A' : 'B');
  const gradeColor = grade === 'S'
    ? 'from-amber-400 to-rose-500 text-amber-300'
    : (grade === 'A' ? 'from-cyan-400 to-blue-500 text-cyan-300' : 'from-emerald-400 to-teal-500 text-emerald-300');

  const speedDiff = prevAvgSpeed > 0 && avgSpeed > 0 ? (prevAvgSpeed - avgSpeed) : 0;

  return (
    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border-2 border-cyan-500/70 rounded-3xl w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.35)]">
        <div className="bg-gradient-to-r from-cyan-950 via-gray-900 to-blue-950 p-5 border-b border-cyan-800/60 flex items-center justify-between shrink-0">
          <div>
            <div className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <Brain size={14} /> 本場學習吸收報告
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">🧠 大腦語譯戰報</h3>
          </div>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradeColor} p-[2px] flex items-center justify-center shadow-lg`}>
            <div className="w-full h-full bg-gray-950 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[9px] text-gray-400 font-bold leading-none">GRADE</span>
              <span className={`text-2xl font-black leading-tight ${grade === 'S' ? 'text-amber-300' : (grade === 'A' ? 'text-cyan-300' : 'text-emerald-300')}`}>{grade}</span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col gap-3.5">
          {/* 速度與反射指標 */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                <Zap size={12} className="text-amber-400" /> 平均反應速度
              </span>
              <div className="text-xl font-black text-white">
                {avgSpeed > 0 ? `${avgSpeed.toFixed(1)} 秒` : '--'}
              </div>
              {isNewBestSpeed ? (
                <span className="text-[10px] text-amber-300 font-black">🏆 個人最快紀錄！</span>
              ) : speedDiff > 0.05 ? (
                <span className="text-[10px] text-emerald-400 font-bold">▲ 比上回快 {speedDiff.toFixed(1)} 秒</span>
              ) : speedDiff < -0.05 ? (
                <span className="text-[10px] text-gray-400">穩健仔細閱讀中</span>
              ) : (
                <span className="text-[10px] text-cyan-400">神速直覺 {flashCount} 次</span>
              )}
            </div>

            <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                <Coins size={12} className="text-yellow-400" /> 學習津貼結算
              </span>
              <div className="text-xl font-black text-yellow-400">+{earnedGold} G</div>
              <span className="text-[10px] text-gray-400">
                準確率 {accuracy}% {bonusGold > 0 ? `(含速度/宿敵 +${bonusGold}G)` : ''}
              </span>
            </div>
          </div>

          {/* 當前階級進度 */}
          {rankInfo && (
            <div className="bg-cyan-950/30 border border-cyan-800/50 p-3 rounded-xl flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-cyan-300">{rankInfo.currentRank.badge} {rankInfo.currentRank.title}</span>
                <span className="text-gray-400">總經驗 {rankInfo.xp} XP</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500" style={{ width: `${rankInfo.rankProgressPct}%` }} />
              </div>
              {rankInfo.nextRank && (
                <div className="text-[10px] text-gray-400 text-right">
                  距離「{rankInfo.nextRank.title}」還差 {Math.max(0, rankInfo.nextRank.minXp - rankInfo.xp)} XP
                </div>
              )}
            </div>
          )}

          {/* 宿敵討伐清單 */}
          {nemesisSlain && nemesisSlain.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-500/60 p-3 rounded-xl flex flex-col gap-1.5">
              <div className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                <Swords size={14} /> ⚔️ 宿敵討伐成功（克服過往弱點！）
              </div>
              <div className="flex flex-col gap-1">
                {nemesisSlain.map((n, idx) => (
                  <div key={idx} className="text-xs text-white bg-black/30 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                    <span className="font-bold truncate"><RubyText text={n.label} showRuby={false} /></span>
                    <span className="text-[10px] text-rose-300 font-black shrink-0 ml-2">弱點突破 +30G</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 熟練度升級清單 */}
          <div className="bg-gray-950 border border-gray-800 p-3 rounded-xl flex flex-col gap-2">
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Trophy size={14} /> 本場日語熟練度成長 ({levelUps.length} 項)
            </div>
            {levelUps.length === 0 ? (
              <div className="text-xs text-gray-500">持續複習中，每一題都在強化長期記憶！</div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                {levelUps.map((u, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs bg-gray-900 px-2.5 py-1.5 rounded-lg border border-gray-800">
                    <span className="text-gray-200 font-bold truncate"><RubyText text={u.label} showRuby={false} /></span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${
                      u.toLv >= 3
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'bg-emerald-900/50 text-emerald-300'
                    }`}>
                      {u.toLv >= 3 ? '👑 完全掌握 Lv.3' : `Lv.${u.fromLv} → Lv.${u.toLv}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-950 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-black text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <CheckCircle2 size={20} /> 確認戰報並返回終端機
          </button>
        </div>
      </div>
    </div>
  );
};
