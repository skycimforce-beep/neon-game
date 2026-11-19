import { useMemo, useState } from 'react';
import { Brain, BookOpen, Award, Zap, Swords, Search, Volume2, Layers } from 'lucide-react';
import { RubyText } from './RubyText';
import { tts } from '../utils/tts';
import { computeSkillProfile, getAllCodexEntries, getMasteryStage, stripRuby } from '../utils/learningProgress';

export const CodexScreen = ({ playerData, onBack }) => {
  const [activeTab, setActiveTab] = useState('skills');
  const [stageFilter, setStageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(40);

  const profile = useMemo(() => computeSkillProfile(playerData), [playerData]);
  const allEntries = useMemo(() => getAllCodexEntries(), []);

  const masteryObj = useMemo(() => playerData.mastery || {}, [playerData.mastery]);
  const mistakeCounts = useMemo(() => playerData.mistakeCounts || {}, [playerData.mistakeCounts]);

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEntries.filter((entry) => {
      const lv = masteryObj[entry.id] || 0;
      const failCnt = mistakeCounts[entry.id] || 0;
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
      if (stageFilter === 'mastered' && lv < 3) return false;
      if (stageFilter === 'learning' && (lv < 1 || lv >= 3)) return false;
      if (stageFilter === 'nemesis' && !(failCnt >= 2 && lv === 0)) return false;
      if (stageFilter === 'unseen' && (lv > 0 || failCnt >= 2)) return false;

      if (q) {
        const plainTitle = stripRuby(entry.title).toLowerCase();
        const hay = `${plainTitle} ${entry.reading} ${entry.sub}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allEntries, masteryObj, mistakeCounts, typeFilter, stageFilter, query]);

  const stageCounts = useMemo(() => {
    let mastered = 0, learning = 0, nemesis = 0, unseen = 0;
    for (const entry of allEntries) {
      const lv = masteryObj[entry.id] || 0;
      const failCnt = mistakeCounts[entry.id] || 0;
      if (lv >= 3) mastered += 1;
      else if (lv >= 1) learning += 1;
      else if (failCnt >= 2) nemesis += 1;
      else unseen += 1;
    }
    return { all: allEntries.length, mastered, learning, nemesis, unseen };
  }, [allEntries, masteryObj, mistakeCounts]);

  return (
    <div className="flex-1 min-h-0 p-4 flex flex-col h-full bg-gray-950">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h2 className="text-emerald-400 font-black text-2xl flex items-center gap-2">
          <Brain /> 日語能力樹＆圖鑑
        </h2>
        <span className="text-xs font-black bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2.5 py-1 rounded-full">
          {profile.currentRank.badge} {profile.currentRank.title}
        </span>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 mb-3 shrink-0">
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs border transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'skills'
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
              : 'bg-gray-900 border-gray-800 text-gray-400'
          }`}
        >
          <Layers size={14} /> 語感能力樹與稱號
        </button>
        <button
          onClick={() => setActiveTab('codex')}
          className={`flex-1 py-2.5 rounded-xl font-black text-xs border transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'codex'
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
              : 'bg-gray-900 border-gray-800 text-gray-400'
          }`}
        >
          <BookOpen size={14} /> 熟悉度圖鑑 ({stageCounts.mastered + stageCounts.learning}/{stageCounts.all})
        </button>
      </div>

      {activeTab === 'skills' && (
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pb-4">
          {/* 階級與總經驗 */}
          <div className="bg-gray-900 border border-cyan-800/50 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-400 font-bold">目前語感階級</div>
                <div className="text-lg font-black text-white mt-0.5">
                  {profile.currentRank.badge} {profile.currentRank.title}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-cyan-400 font-black">{profile.xp} XP</div>
                <div className="text-[10px] text-gray-400">已完全掌握 {profile.totalMastered} 項</div>
              </div>
            </div>
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${profile.rankProgressPct}%` }}
              />
            </div>
            {profile.nextRank && (
              <div className="text-[11px] text-gray-400 flex justify-between">
                <span>下一階：{profile.nextRank.badge} {profile.nextRank.title}</span>
                <span>還差 {Math.max(0, profile.nextRank.minXp - profile.xp)} XP</span>
              </div>
            )}
          </div>

          {/* 反應與戰績指標 */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl">
              <div className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                <Zap size={13} className="text-amber-400" /> 最快平均語感速度
              </div>
              <div className="text-xl font-black text-amber-300 mt-1">
                {playerData.bestAvgSpeed > 0 ? `${playerData.bestAvgSpeed.toFixed(1)} 秒/題` : '尚無紀錄'}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl">
              <div className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                <Swords size={13} className="text-rose-400" /> 宿敵弱點討伐數
              </div>
              <div className="text-xl font-black text-rose-300 mt-1">
                {playerData.nemesisSlainCount || 0} 次
              </div>
            </div>
          </div>

          {/* 五大核心能力條 */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="text-xs font-black text-cyan-300">📊 五大日語實戰能力維度</div>
            {profile.coreSkills.map((skill) => (
              <div key={skill.key} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-200">{skill.label}</span>
                  <span className="text-gray-400">
                    <span className="text-white font-black">{skill.mastered}</span>/{skill.total} 完全掌握 ({skill.pct}%)
                  </span>
                </div>
                <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${skill.color} transition-all duration-500`} style={{ width: `${skill.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* 文法專項語法突破 */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="text-xs font-black text-purple-300">🎯 N4 核心語法專項突破</div>
            {profile.subSkills.map((sub) => (
              <div key={sub.key} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-200">{sub.label}</span>
                  <span className="text-purple-300">{sub.pct}% ({sub.mastered}/{sub.total})</span>
                </div>
                <div className="text-[10px] text-gray-500">{sub.desc}</div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-500" style={{ width: `${sub.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* 稱號牆 */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="text-xs font-black text-amber-300 flex items-center gap-1">
              <Award size={14} /> 語譯實力稱號勳章
            </div>
            <div className="grid grid-cols-2 gap-2">
              {profile.titles.map((t) => (
                <div
                  key={t.id}
                  className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
                    t.unlocked
                      ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                      : 'bg-gray-950/60 border-gray-800 text-gray-500 opacity-65'
                  }`}
                >
                  <div className="text-xs font-black">{t.name}</div>
                  <div className="text-[10px]">{t.unlocked ? '✅ 已達成解鎖' : `🔒 ${t.req}`}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'codex' && (
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          {/* Search & Filters */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setVisibleLimit(40); }}
                placeholder="搜尋單字、假名或中文解釋..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: `全部 (${stageCounts.all})` },
                { id: 'mastered', label: `👑 已掌握 (${stageCounts.mastered})` },
                { id: 'learning', label: `⚡ 學習中 (${stageCounts.learning})` },
                { id: 'nemesis', label: `🔴 宿敵 (${stageCounts.nemesis})` },
                { id: 'unseen', label: `🌱 未解鎖 (${stageCounts.unseen})` }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setStageFilter(s.id); setVisibleLimit(40); }}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap border ${
                    stageFilter === s.id
                      ? 'bg-cyan-900/70 border-cyan-400 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: '全題型' },
                { id: 'vocab', label: '單字' },
                { id: 'sort', label: '重組' },
                { id: 'type', label: '活用' },
                { id: 'mcq', label: '文法' },
                { id: 'reading', label: '閱讀' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTypeFilter(t.id); setVisibleLimit(40); }}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap border ${
                    typeFilter === t.id
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                      : 'bg-gray-900 border-gray-800 text-gray-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Entry List */}
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pb-4">
            {filteredEntries.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-10 font-bold">目前篩選條件下沒有項目</div>
            ) : (
              <>
                {filteredEntries.slice(0, visibleLimit).map((entry) => {
                  const lv = masteryObj[entry.id] || 0;
                  const failCnt = mistakeCounts[entry.id] || 0;
                  const stage = getMasteryStage(lv, failCnt);
                  return (
                    <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">{entry.typeLabel}</span>
                          <span className="text-[10px] font-bold bg-gray-800/80 text-cyan-400 px-1.5 py-0.5 rounded">Lv.{entry.tier}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${stage.badgeClass}`}>
                            {stage.shortLabel}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-white leading-relaxed break-words">
                          <RubyText text={entry.title} showRuby={true} />
                        </div>
                        <div className="text-xs text-gray-400 leading-snug">{entry.sub}</div>
                      </div>
                      {tts.isSupported() && (
                        <button
                          type="button"
                          onClick={() => tts.speak(entry.speakText)}
                          className="p-2 rounded-lg bg-gray-800 hover:bg-cyan-900 border border-cyan-700/40 text-cyan-300 shrink-0 active:scale-90 transition-transform"
                          title="發音"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
                {filteredEntries.length > visibleLimit && (
                  <button
                    onClick={() => setVisibleLimit((v) => v + 40)}
                    className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-300 font-bold text-xs border border-gray-700"
                  >
                    顯示更多（還有 {filteredEntries.length - visibleLimit} 筆）
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-900 shrink-0 mt-auto">
        <button onClick={onBack} className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl font-black text-base active:scale-95 transition-transform">
          返回終端機
        </button>
      </div>
    </div>
  );
};
