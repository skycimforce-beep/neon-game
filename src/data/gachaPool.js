export const VIRTUAL_GACHA_POOL = [
  // 櫻花系列 (Sakura Set)
  { id: 'vfx_sakura', set: 'sakura', item: '【特效】🌸 櫻華千本舞', chance: 3.5, rarity: 'SSR', type: 'vfx', buff: '作答時間寬裕度 +0.5 秒', vfxClass: 'bg-pink-400 drop-shadow-[0_0_25px_pink]', extra: '🌸' },
  { id: 'skin_sakura', set: 'sakura', item: '【外觀】🦊 白狐巫女偶', chance: 3.5, rarity: 'SSR', type: 'skin', buff: '學習結算金幣 +20%', emoji: '🦊', bossEmoji: '⛩️' },
  { id: 'chip_sakura', set: 'sakura', item: '【晶片】🍃 落櫻風雅回路', chance: 3.5, rarity: 'SSR', type: 'chip', buff: '答對時微量回復 5 點 HP', icon: '🍃' },

  // 量子電磁系列 (Cyber Set)
  { id: 'vfx_cyber', set: 'cyber', item: '【特效】⚡ 量子電磁脈衝', chance: 3.5, rarity: 'SSR', type: 'vfx', buff: 'Combo 達到 3 以上金幣微幅增加', vfxClass: 'bg-cyan-400 drop-shadow-[0_0_25px_cyan]', extra: '⚡' },
  { id: 'skin_cyber', set: 'cyber', item: '【外觀】🤖 賽博智械核', chance: 3.5, rarity: 'SSR', type: 'skin', buff: '首題答對金幣 +50G', emoji: '🤖', bossEmoji: '🛸' },
  { id: 'chip_cyber', set: 'cyber', item: '【晶片】💠 超頻演算矩陣', chance: 3.5, rarity: 'SSR', type: 'chip', buff: '閱讀測驗倒數延長 10 秒', icon: '💠' },

  // UR 神話裝備
  { id: 'chip_ur1', set: 'mythic', item: '【神話晶片】🛡️ 量子死線防禦', chance: 0.5, rarity: 'UR', type: 'chip', buff: '單場作戰免死 1 次 (保留 1 HP)', icon: '🛡️' },
  { id: 'vfx_ur1', set: 'mythic', item: '【神話特效】🌌 虛數黑洞湮滅', chance: 0.5, rarity: 'UR', type: 'vfx', buff: '全通關額外獎勵 150 G', vfxClass: 'bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 drop-shadow-[0_0_30px_cyan]', extra: '🌌' },

  // R 級 (進階實用)
  { id: 'vfx_r1', set: 'standard', item: '【特效】⚡ 紫電一閃', chance: 20, rarity: 'R', type: 'vfx', buff: '攻擊視覺亮化', vfxClass: 'bg-purple-400 drop-shadow-[0_0_20px_purple]' },
  { id: 'skin_r1', set: 'standard', item: '【外觀】👾 霓虹軟體怪', chance: 18, rarity: 'R', type: 'skin', buff: '通關金幣 +10%', emoji: '👾', bossEmoji: '👾' },

  // N 級 (量產基礎)
  { id: 'vfx_n1', set: 'nature', item: '【特效】💧 水波紋斬擊', chance: 20, rarity: 'N', type: 'vfx', buff: null, vfxClass: 'bg-blue-400 drop-shadow-[0_0_15px_blue]' },
  { id: 'skin_n1', set: 'nature', item: '【外觀】🪵 原木訓練樁', chance: 20, rarity: 'N', type: 'skin', buff: null, emoji: '🪵', bossEmoji: '🌳' },
];

export const SET_BONUSES = {
  sakura: {
    name: '🌸 櫻華神樂套裝 (3/3)',
    desc: '完美連擊時金幣 +40%，且失誤時受到傷害降低 20%'
  },
  cyber: {
    name: '⚡ 量子駭客套裝 (3/3)',
    desc: '全作戰時間寬裕度 +1.5 秒，每完成一波修復 10 點 HP'
  }
};

export const BANNER_THEMES = [
  { id: 'sakura_up', name: '🌸【櫻華神樂】專屬主題特選', featuredSet: 'sakura', desc: '櫻花系列 SSR 出現機率大幅提升 50%！' },
  { id: 'cyber_up', name: '⚡【賽博矩陣】限定技術特選', featuredSet: 'cyber', desc: '量子電磁系列 SSR 出現機率大幅提升 50%！' },
  { id: 'classic', name: '🌐【全域標準】綜合資料庫', featuredSet: null, desc: '所有虛擬裝備平均隨機出現。' }
];

export const DEFAULT_GACHA_POOL = [
  { id: 'g1', item: '🧋 一杯手搖飲 / 點心犒賞', chance: 60 },
  { id: 'g2', item: '🎮 無罪惡感自由遊戲 1 小時', chance: 31 },
  { id: 'g3', item: '🎁 買一本喜歡的書或生活小物', chance: 9 }
];
