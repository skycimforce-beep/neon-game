const SHORT_LABELS = {
  vocab: '單字詞彙',
  sort: '句構重組',
  type: '動詞活用',
  mcq: '文法辨析',
  reading: '長文閱讀'
};

export const SkillRadarChart = ({ coreSkills = [], size = 210 }) => {
  if (!coreSkills || coreSkills.length === 0) return null;

  const cx = 120;
  const cy = 112;
  const maxR = 72;
  const count = coreSkills.length;

  const getPoint = (index, ratio) => {
    const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / count;
    return {
      x: cx + Math.cos(angle) * maxR * ratio,
      y: cy + Math.sin(angle) * maxR * ratio
    };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = coreSkills.map((skill, idx) => {
    const visualRatio = Math.max(0.08, Math.min(1, (skill.pct || 0) / 100));
    return getPoint(idx, visualRatio);
  });
  const polygonPoints = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg
        viewBox="0 0 240 224"
        style={{ width: size, height: Math.round((size * 224) / 240) }}
        className="overflow-visible select-none"
        role="img"
        aria-label="五大日語實力雷達圖"
      >
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.18" />
          </radialGradient>
        </defs>

        {/* Concentric guide pentagons */}
        {rings.map((r) => {
          const pts = coreSkills.map((_, i) => getPoint(i, r));
          return (
            <polygon
              key={r}
              points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
              fill="none"
              stroke="rgba(34, 211, 238, 0.18)"
              strokeWidth={r === 1 ? '1.2' : '0.8'}
              strokeDasharray={r === 1 ? undefined : '3 3'}
            />
          );
        })}

        {/* Axis spokes */}
        {coreSkills.map((skill, idx) => {
          const outer = getPoint(idx, 1);
          return (
            <line
              key={skill.key}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(34, 211, 238, 0.2)"
              strokeWidth="0.9"
            />
          );
        })}

        {/* Filled skill polygon */}
        <polygon
          points={polygonPoints}
          fill="url(#radarFill)"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Vertex dots */}
        {dataPoints.map((pt, idx) => (
          <circle
            key={coreSkills[idx].key}
            cx={pt.x}
            cy={pt.y}
            r="3.4"
            fill="#34d399"
            stroke="#0f172a"
            strokeWidth="1.2"
          />
        ))}

        {/* Axis Labels */}
        {coreSkills.map((skill, idx) => {
          const labelPt = getPoint(idx, 1.28);
          const anchor =
            Math.abs(labelPt.x - cx) < 10
              ? 'middle'
              : (labelPt.x > cx ? 'start' : 'end');
          return (
            <g key={`${skill.key}_label`}>
              <text
                x={labelPt.x}
                y={labelPt.y - 3}
                textAnchor={anchor}
                fill="#cbd5e1"
                fontSize="10"
                fontWeight="800"
              >
                {SHORT_LABELS[skill.key] || skill.label}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + 9}
                textAnchor={anchor}
                fill="#22d3ee"
                fontSize="9.5"
                fontWeight="900"
              >
                {skill.pct}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
