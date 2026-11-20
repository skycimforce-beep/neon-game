const MONSTER_LABELS = {
  vocab: { code: 'NODE-V', name: '漢字語彙病毒', color: 'text-cyan-300', bar: 'from-cyan-400 to-blue-500', stroke: '#22d3ee', glow: 'rgba(34,211,238,0.45)' },
  sort: { code: 'NODE-S', name: '句構重組守護者', color: 'text-emerald-300', bar: 'from-emerald-400 to-teal-500', stroke: '#34d399', glow: 'rgba(52,211,153,0.45)' },
  type: { code: 'NODE-T', name: '活用變形核心', color: 'text-amber-300', bar: 'from-amber-400 to-orange-500', stroke: '#fbbf24', glow: 'rgba(251,191,36,0.45)' },
  mcq: { code: 'NODE-M', name: '文法邏輯幻影', color: 'text-purple-300', bar: 'from-purple-400 to-fuchsia-500', stroke: '#c084fc', glow: 'rgba(192,132,252,0.45)' },
  reading: { code: 'BOSS-R', name: '深層長文霸主', color: 'text-rose-300', bar: 'from-rose-500 to-red-600', stroke: '#f43f5e', glow: 'rgba(244,63,94,0.55)' },
  potion: { code: 'MED-01', name: '量子修復補給艙', color: 'text-emerald-300', bar: 'from-emerald-400 to-green-500', stroke: '#10b981', glow: 'rgba(16,185,185,0.4)' }
};

export const CyberMonster = ({
  type = 'vocab',
  isBoss = false,
  isNemesis = false,
  equippedSkin = null,
  hpPercent = 100,
  isHit = false,
  isHealed = false,
  damageNumbers = [],
  vfxOverlay = null
}) => {
  const baseMeta = MONSTER_LABELS[type] || MONSTER_LABELS.vocab;
  const meta = isNemesis
    ? { code: 'NEMESIS', name: '宿敵弱點獵殺體', color: 'text-rose-300', bar: 'from-rose-500 via-red-500 to-amber-500', stroke: '#fb7185', glow: 'rgba(244,63,94,0.65)' }
    : (isBoss && type !== 'potion'
      ? { ...baseMeta, code: 'OVERLORD', color: 'text-red-300', bar: 'from-red-500 to-orange-500', stroke: '#ef4444', glow: 'rgba(239,68,68,0.6)' }
      : baseMeta);

  const skinSymbol = equippedSkin ? (isBoss ? equippedSkin.bossEmoji : equippedSkin.emoji) : null;
  const clampedHp = Math.max(0, Math.min(100, hpPercent));

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[260px] mx-auto select-none">
      {/* Enemy Nameplate & HP Bar */}
      <div className="w-full mb-2 px-2.5 py-1.5 rounded-lg bg-gray-900/85 border border-cyan-900/60 backdrop-blur-sm z-10 shadow-md">
        <div className="flex items-center justify-between text-[10px] font-black tracking-wider mb-1">
          <span className={`${meta.color} flex items-center gap-1.5 truncate`}>
            <span className="px-1.5 py-0.2 rounded bg-black/50 border border-white/10 text-[9px] font-mono">{meta.code}</span>
            <span className="truncate">{equippedSkin ? equippedSkin.item.replace(/【.*?】/, '') : meta.name}</span>
          </span>
          <span className="text-gray-400 font-mono shrink-0">{Math.round(clampedHp)}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden border border-white/10">
          <div
            className={`h-full bg-gradient-to-r ${meta.bar} transition-all duration-300`}
            style={{ width: `${clampedHp}%` }}
          />
        </div>
      </div>

      {/* Monster Stage */}
      <div className="relative flex items-center justify-center w-36 h-32">
        {vfxOverlay}

        {/* Ambient radial aura */}
        <div
          className={`absolute w-28 h-28 rounded-full blur-xl transition-all duration-300 pointer-events-none ${isHit ? 'scale-150 opacity-90' : 'opacity-50'}`}
          style={{ background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)` }}
        />

        {/* Animated SVG Cyber Unit */}
        <div
          className={`relative z-10 flex items-center justify-center transition-all duration-150 ${
            isHit
              ? 'scale-90 brightness-200 -translate-y-1 rotate-3'
              : (isHealed ? 'scale-110 brightness-125' : 'animate-[float-idle_3.2s_ease-in-out_infinite]')
          }`}
        >
          <svg
            viewBox="0 0 140 140"
            className="w-28 h-28 drop-shadow-[0_0_16px_rgba(6,182,212,0.35)] overflow-visible"
            aria-hidden="true"
          >
            {/* Outer Rotating Targeting Ring */}
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke={meta.stroke}
              strokeWidth="1.5"
              strokeDasharray={isBoss || isNemesis ? '10 6 3 6' : '6 8'}
              opacity="0.55"
              style={{ transformOrigin: '70px 70px', animation: 'ring-spin-right 12s linear infinite' }}
            />
            <circle
              cx="70"
              cy="70"
              r="49"
              fill="none"
              stroke={meta.stroke}
              strokeWidth="1"
              strokeDasharray="3 9"
              opacity="0.35"
              style={{ transformOrigin: '70px 70px', animation: 'ring-spin-left 9s linear infinite' }}
            />

            {type === 'potion' ? (
              /* Medical Repair Drone */
              <g>
                <polygon
                  points="70,24 110,47 110,93 70,116 30,93 30,47"
                  fill="#064e3b"
                  fillOpacity="0.85"
                  stroke="#34d399"
                  strokeWidth="2.5"
                />
                <rect x="63" y="46" width="14" height="48" rx="3" fill="#6ee7b7" />
                <rect x="46" y="63" width="48" height="14" rx="3" fill="#6ee7b7" />
                <circle cx="70" cy="70" r="7" fill="#ecfdf5" />
              </g>
            ) : isNemesis ? (
              /* Nemesis Corrupted Hunter */
              <g>
                <polygon points="22,36 48,46 36,68" fill="#881337" stroke="#fb7185" strokeWidth="2" />
                <polygon points="118,36 92,46 104,68" fill="#881337" stroke="#fb7185" strokeWidth="2" />
                <polygon
                  points="70,20 108,52 96,106 70,122 44,106 32,52"
                  fill="#1f0a14"
                  stroke="#f43f5e"
                  strokeWidth="3"
                />
                <polygon points="70,34 94,58 84,96 70,106 56,96 46,58" fill="#4c0519" stroke="#fda4af" strokeWidth="1.5" />
                {/* Twin crimson hunter eyes */}
                <polygon points="48,60 66,68 52,74" fill="#fbbf24" />
                <polygon points="92,60 74,68 88,74" fill="#fbbf24" />
                <polygon points="70,76 78,90 70,98 62,90" fill="#fb7185" />
              </g>
            ) : isBoss ? (
              /* Overlord Boss Mecha Core */
              <g>
                {/* Wing stabilizers */}
                <path d="M18,52 L40,42 L40,92 L18,82 Z" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
                <path d="M122,52 L100,42 L100,92 L122,82 Z" fill="#450a0a" stroke="#ef4444" strokeWidth="2" />
                {/* Crown horns */}
                <polygon points="44,32 54,14 62,32" fill="#dc2626" />
                <polygon points="96,32 86,14 78,32" fill="#dc2626" />
                {/* Main armored chassis */}
                <polygon
                  points="70,24 104,44 104,92 70,116 36,92 36,44"
                  fill="#18090c"
                  stroke="#ef4444"
                  strokeWidth="3"
                />
                <polygon
                  points="70,36 92,50 92,86 70,104 48,86 48,50"
                  fill="#450a0a"
                  stroke="#fca5a5"
                  strokeWidth="1.2"
                />
                {/* Glowing visor */}
                <rect x="47" y="56" width="46" height="12" rx="4" fill="#09090b" stroke="#f87171" strokeWidth="1.5" />
                <circle cx="58" cy="62" r="3.5" fill="#fde047" />
                <circle cx="82" cy="62" r="3.5" fill="#fde047" />
                {/* Reactor grille */}
                <line x1="56" y1="80" x2="84" y2="80" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="60" y1="88" x2="80" y2="88" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
              </g>
            ) : (
              /* Standard Cyber Drone / Virus */
              <g>
                {/* Antenna */}
                <line x1="70" y1="22" x2="70" y2="34" stroke={meta.stroke} strokeWidth="2.5" />
                <circle cx="70" cy="19" r="4" fill={meta.stroke} />
                {/* Outer shield shell */}
                <polygon
                  points="70,32 106,52 102,94 70,112 38,94 34,52"
                  fill="#0f172a"
                  stroke={meta.stroke}
                  strokeWidth="2.8"
                />
                <polygon
                  points="70,42 94,56 90,88 70,100 50,88 46,56"
                  fill="#1e293b"
                  stroke={meta.stroke}
                  strokeWidth="1"
                  opacity="0.85"
                />
                {/* Cyber Visor */}
                <rect x="49" y="59" width="42" height="15" rx="7" fill="#020617" stroke={meta.stroke} strokeWidth="1.5" />
                <circle cx="60" cy="66.5" r="3.2" fill={meta.stroke} />
                <circle cx="80" cy="66.5" r="3.2" fill={meta.stroke} />
                {/* Core pulse bar */}
                <rect x="59" y="82" width="22" height="4" rx="2" fill={meta.stroke} opacity="0.75" />
              </g>
            )}
          </svg>

          {/* Gacha Skin Holo-Badge (preserves collected gacha skins visibly) */}
          {skinSymbol && (
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gray-950/95 border-2 border-cyan-400/80 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(6,182,212,0.5)]">
              {skinSymbol}
            </div>
          )}

          {/* Hit spark burst */}
          {isHit && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="absolute -top-2 -left-2 text-amber-300 text-lg animate-ping">✦</span>
              <span className="absolute -bottom-2 -right-2 text-cyan-300 text-lg animate-ping">✦</span>
              <span className="absolute top-0 right-0 text-white text-sm animate-ping">⚡</span>
            </div>
          )}
        </div>

        {/* Floating Bounty / Shield Popups */}
        {damageNumbers.map((d) => (
          <div
            key={d.id}
            className={`absolute z-20 font-black font-cyber pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] whitespace-nowrap flex items-center gap-1 ${
              d.isHeal ? 'text-emerald-400 text-2xl' : (d.isCrit ? 'text-amber-300 text-3xl' : 'text-cyan-200 text-xl')
            }`}
            style={{ left: `calc(50% + ${d.offsetX}px)`, top: '6%', transform: 'translateX(-50%)', animation: 'damage-float 1s ease-out forwards' }}
          >
            {d.label || `${d.isCrit ? '⚡ ' : ''}${d.amount}`}
          </div>
        ))}
      </div>
    </div>
  );
};
