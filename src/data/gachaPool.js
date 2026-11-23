export const VIRTUAL_GACHA_POOL = [
  // 🌸 櫻華神樂系列 (Sakura Set - SSR 3件套)
  {
    id: 'vfx_sakura',
    set: 'sakura',
    item: '【特效】🌸 櫻華千本舞',
    chance: 1.5,
    rarity: 'SSR',
    type: 'vfx',
    buff: '閱讀測驗時間 +1 秒，浪漫加成',
    vfxClass: 'bg-pink-400 drop-shadow-[0_0_25px_pink]',
    shieldClass: 'text-pink-400 drop-shadow-[0_0_20px_pink]',
    magicClass: 'to-pink-400 drop-shadow-[0_0_25px_pink]',
    extra: '🌸',
    desc: '「桜が散るスピードは秒速5センチ。」但考前背的單字消散速度大概是秒速 500 字。'
  },
  {
    id: 'skin_sakura',
    set: 'sakura',
    item: '【外觀】🦊 白狐巫女偶',
    chance: 1.5,
    rarity: 'SSR',
    type: 'skin',
    buff: '通關結算金幣 +20%',
    emoji: '🦊',
    bossEmoji: '⛩️',
    battleQuip: '「コンコン！這題不會的話狐狸大人要收香油錢囉～」',
    desc: '神社打工兼職中！答錯的時候會用「大丈夫ですか？」的關愛眼神看著你。'
  },
  {
    id: 'chip_sakura',
    set: 'sakura',
    item: '【晶片】🍃 落櫻風雅回路',
    chance: 1.5,
    rarity: 'SSR',
    type: 'chip',
    buff: '答對時回復 5 點護盾',
    icon: '🍃',
    desc: '一邊賞櫻一邊默背「〜てみる」，優雅得像日劇主角（雖然文法還是常背錯）。'
  },

  // ⚡ 量子駭客系列 (Cyber Set - SSR 3件套)
  {
    id: 'vfx_cyber',
    set: 'cyber',
    item: '【特效】⚡ 量子電磁脈衝',
    chance: 1.5,
    rarity: 'SSR',
    type: 'vfx',
    buff: 'Combo 3 以上每題額外 +15 G',
    vfxClass: 'bg-cyan-400 drop-shadow-[0_0_25px_cyan]',
    shieldClass: 'text-cyan-400 drop-shadow-[0_0_20px_cyan]',
    magicClass: 'to-cyan-400 drop-shadow-[0_0_25px_cyan]',
    extra: '⚡',
    desc: '試圖用腦波直接下載整本《大家的日本語》，副作用是作夢都在喊「ます形」。'
  },
  {
    id: 'skin_cyber',
    set: 'cyber',
    item: '【外觀】🤖 賽博智械核',
    chance: 1.5,
    rarity: 'SSR',
    type: 'skin',
    buff: '每場首題答對金幣 +50 G',
    emoji: '🤖',
    bossEmoji: '🛸',
    battleQuip: '「ピピピ…偵測到您的敬語轉換失敗，請重新投胎！」',
    desc: 'AI 翻譯機偷偷叛變：「這個 N4 自他動詞我也不確定，你自己猜猜看ピピピ。」'
  },
  {
    id: 'chip_cyber',
    set: 'cyber',
    item: '【晶片】💠 超頻演算矩陣',
    chance: 1.5,
    rarity: 'SSR',
    type: 'chip',
    buff: '閱讀測驗倒數延長 20 秒',
    icon: '💠',
    desc: '將長文閱讀測驗自動腦內斷句，再也不用害怕看到沒標點的整片假名海！'
  },

  // 🚃 終電社畜組 (Shachiku Set - SSR 3件套)
  {
    id: 'skin_train',
    set: 'shachiku',
    item: '【外觀】🚃 終電狂奔大叔',
    chance: 1.5,
    rarity: 'SSR',
    type: 'skin',
    buff: '答對非藥水題額外 +12 G（加班費）',
    emoji: '💼',
    bossEmoji: '🚅',
    battleQuip: '「終電に間に合わない！快回答，電車門要關了！」',
    desc: '穿著西裝手提公事包百米衝刺山手線！被車門夾住領帶也要順便背完這題。'
  },
  {
    id: 'vfx_coffee',
    set: 'shachiku',
    item: '【特效】☕ 黑咖啡續命光束',
    chance: 1.5,
    rarity: 'SSR',
    type: 'vfx',
    buff: 'Combo 2 以上答對額外 +6 G',
    vfxClass: 'bg-amber-500 drop-shadow-[0_0_25px_#f59e0b]',
    shieldClass: 'text-amber-500 drop-shadow-[0_0_20px_#f59e0b]',
    magicClass: 'to-amber-500 drop-shadow-[0_0_25px_#f59e0b]',
    extra: '☕',
    desc: '凌晨兩點灌下第三罐販賣機無糖黑咖啡，眼皮跟五段動詞一起劇烈顫抖！'
  },
  {
    id: 'chip_deadline',
    set: 'shachiku',
    item: '【晶片】⏰ 死線腎上腺素晶片',
    chance: 1.5,
    rarity: 'SSR',
    type: 'chip',
    buff: '護盾低於 50% 時答對額外 +12 G（絕地賞金）',
    icon: '⏰',
    desc: '「明天就要考 N4 了今晚才開始翻課本！」人類在死線前的潛能是平常的 300%。'
  },

  // 🍻 居酒屋微醺組 (Izakaya Set - SSR 3件套)
  {
    id: 'skin_takoyaki',
    set: 'izakaya',
    item: '【外觀】🐙 暴走章魚燒君',
    chance: 1.5,
    rarity: 'SSR',
    type: 'skin',
    buff: '閱讀測驗通關額外 +20 G',
    emoji: '🐙',
    bossEmoji: '🏮',
    battleQuip: '「アツッ！太燙了！答錯就噴你一臉柴魚片！」',
    desc: '外表滾燙、內心柔軟的深夜宵夜霸主，會提醒你「熱いから気をつけて！」'
  },
  {
    id: 'vfx_highball',
    set: 'izakaya',
    item: '【特效】🍺 氣泡爽快乾杯斬',
    chance: 1.5,
    rarity: 'SSR',
    type: 'vfx',
    buff: '藥水題護盾回復量提升至 1.5 倍',
    vfxClass: 'bg-yellow-300 drop-shadow-[0_0_25px_#fde047]',
    shieldClass: 'text-yellow-300 drop-shadow-[0_0_20px_#fde047]',
    magicClass: 'to-yellow-300 drop-shadow-[0_0_25px_#fde047]',
    extra: '🍻',
    desc: '「とりあえず生で！」進居酒屋第一句只會點生啤，但靠這句就夠在東京活下來。'
  },
  {
    id: 'chip_nomihodai',
    set: 'izakaya',
    item: '【晶片】🍢 關東煮無限續湯晶片',
    chance: 1.5,
    rarity: 'SSR',
    type: 'chip',
    buff: '每進入下一波自動回復 8 點護盾',
    icon: '🍢',
    desc: '吃到飽的靈魂在於回本；背單字的靈魂在於今天背完明天至少還記得一半。'
  },

  // 🍜 深夜動畫中二組 (Chuuni Set - 1 UR + 2 SSR)
  {
    id: 'chip_ramen',
    set: 'chuuni',
    item: '【神話晶片】🍜 三分鐘泡麵結界',
    chance: 0.5,
    rarity: 'UR',
    type: 'chip',
    buff: '答對題目 +10 G，每 3 連擊額外回復 10 護盾',
    icon: '🍜',
    desc: '在等日清泡麵熟透的 180 秒內剛好刷完一波題目！麵糊掉前必須全對通關！'
  },
  {
    id: 'skin_neko',
    set: 'chuuni',
    item: '【外觀】🐈 踩鍵盤主子貓',
    chance: 1.5,
    rarity: 'SSR',
    type: 'skin',
    buff: '觸發神速直覺或 3 連擊以上時額外 +8 G',
    emoji: '🐈',
    bossEmoji: '🦁',
    battleQuip: '「ニャー！（翻譯：你這個助詞又放錯了喵）」',
    desc: '「にゃんぱすー！」主子一腳踩在 Enter 鍵上幫你送出答案，竟然比你猜得還準。'
  },
  {
    id: 'vfx_chuuni',
    set: 'chuuni',
    item: '【特效】👁️‍🗨️ 邪王真眼爆炎波',
    chance: 1.5,
    rarity: 'SSR',
    type: 'vfx',
    buff: '動詞變化與文法重組答對額外 +10 G',
    vfxClass: 'bg-fuchsia-500 drop-shadow-[0_0_28px_#d946ef]',
    shieldClass: 'text-fuchsia-500 drop-shadow-[0_0_22px_#d946ef]',
    magicClass: 'to-fuchsia-500 drop-shadow-[0_0_28px_#d946ef]',
    extra: '🔥',
    desc: '「漆黒の炎に抱かれて消えろ！」聽得懂這句中二台詞的人，N4 應該都能輕鬆過吧？'
  },

  // 🌌 虛數神話套裝 (Mythic Set - UR 3件套)
  {
    id: 'chip_ur1',
    set: 'mythic',
    item: '【神話晶片】🛡️ 量子死線防禦',
    chance: 0.5,
    rarity: 'UR',
    type: 'chip',
    buff: '單場免除護盾歸零 1 次（強制保留 1 點護盾）',
    icon: '🛡️',
    desc: '「まだ終わっていない！」只要監考老師還沒喊停筆，就永遠還有逆轉的奇蹟！'
  },
  {
    id: 'vfx_ur1',
    set: 'mythic',
    item: '【神話特效】🌌 虛數黑洞湮滅',
    chance: 0.5,
    rarity: 'UR',
    type: 'vfx',
    buff: '全通關額外獎勵 +150 G',
    vfxClass: 'bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 drop-shadow-[0_0_30px_cyan]',
    shieldClass: 'text-purple-400 drop-shadow-[0_0_25px_cyan]',
    magicClass: 'via-purple-500 to-cyan-400 drop-shadow-[0_0_30px_cyan]',
    extra: '🌌',
    desc: '把所有搞混的自動詞、他動詞還有敬語尊敬語通通吸進黑洞，眼不見為淨！'
  },
  {
    id: 'skin_ur1',
    set: 'mythic',
    item: '【神話外觀】🐉 合格祈願金龍神',
    chance: 0.5,
    rarity: 'UR',
    type: 'skin',
    buff: '擊敗 Boss 通關時額外紅包 +100 G',
    emoji: '🐲',
    bossEmoji: '⛩️',
    battleQuip: '「合格祈願！讓金龍神看看你的日文實力吧！」',
    desc: '傳說抽到這尊金龍的學習者，上考場遇到不會的題目全猜 C 都會奇蹟般答對！'
  },

  // 🌟 R 級 (搞怪實用)
  {
    id: 'vfx_r1',
    set: 'standard',
    item: '【特效】⚡ 紫電一閃',
    chance: 5.5,
    rarity: 'R',
    type: 'vfx',
    buff: '答對時 25% 機率觸發額外 +12 G 閃電紅包',
    vfxClass: 'bg-purple-400 drop-shadow-[0_0_20px_purple]',
    shieldClass: 'text-purple-400 drop-shadow-[0_0_18px_purple]',
    magicClass: 'to-purple-400 drop-shadow-[0_0_20px_purple]',
    desc: '中規中矩但很帥氣的紫色電弧，至少讓鄰座的人以為你正在打什麼高深電競。'
  },
  {
    id: 'skin_r1',
    set: 'standard',
    item: '【外觀】👾 霓虹軟體怪',
    chance: 5.5,
    rarity: 'R',
    type: 'skin',
    buff: '通關金幣 +10%',
    emoji: '👾',
    bossEmoji: '👾',
    battleQuip: '「ビープ！又是誰把『は』跟『わ』打反了？」',
    desc: '原本是系統裡的小 Bug，被 N4 考生抓來當練習沙包後變得乖巧許多。'
  },
  {
    id: 'chip_r_keigo',
    set: 'standard',
    item: '【晶片】🙇 敬語土下座輔助器',
    chance: 5.5,
    rarity: 'R',
    type: 'chip',
    buff: '答錯失誤時護盾損失減免 3 點',
    icon: '🙇',
    desc: '「大変申し訳ございませんでした！」只要道歉姿勢夠誠懇，扣護盾都能少扣一點。'
  },
  {
    id: 'chip_r_anime',
    set: 'standard',
    item: '【晶片】🎧 動漫自學雙倍速',
    chance: 5.5,
    rarity: 'R',
    type: 'chip',
    buff: '每場首次答錯保護 Combo 不歸零',
    icon: '🎧',
    desc: '號稱「看五百部動畫就能學會日文」，結果考試時腦袋只有「ばか」跟「お前」。'
  },
  {
    id: 'vfx_r_pencil',
    set: 'standard',
    item: '【特效】✏️ 斷芯塗卡神筆',
    chance: 5.0,
    rarity: 'R',
    type: 'vfx',
    buff: '文法選擇題答對 +8 G',
    vfxClass: 'bg-emerald-400 drop-shadow-[0_0_20px_#34d399]',
    shieldClass: 'text-emerald-400 drop-shadow-[0_0_18px_#34d399]',
    magicClass: 'to-emerald-400 drop-shadow-[0_0_20px_#34d399]',
    extra: '✏️',
    desc: '考前忘記帶專用 2B 鉛筆的救星！在答案卡上高速畫圈也能刷出炫光。'
  },
  {
    id: 'skin_r_conbini',
    set: 'standard',
    item: '【外觀】🏪 袋子不要店員',
    chance: 5.0,
    rarity: 'R',
    type: 'skin',
    buff: '通關結算額外 +60 G（省塑膠袋）',
    emoji: '🏪',
    bossEmoji: '🍙',
    battleQuip: '「レジ袋はご利用ですか？お弁当温めますか？」',
    desc: '每次結帳都鼓起勇氣練習「袋いりません」，結果店員還是聽成了要袋子。'
  },
  {
    id: 'skin_r_shiba',
    set: 'standard',
    item: '【外觀】🐕 拒否柴犬守護靈',
    chance: 5.0,
    rarity: 'R',
    type: 'skin',
    buff: '單字題答對額外 +6 G',
    emoji: '🐕',
    bossEmoji: '🐕‍🦺',
    battleQuip: '「ワン！不背完今天份單字，我是絕對不會走的柴！」',
    desc: '散步時死活不肯回家的拒否柴柴！牠盯著你寫完這一輪才會肯移開屁股。'
  },

  // 📦 N 級 (日語學習迷因收藏卡)
  {
    id: 'vfx_n1',
    set: 'nature',
    item: '【特效】💧 水波紋斬擊',
    chance: 5.0,
    rarity: 'N',
    type: 'vfx',
    buff: null,
    vfxClass: 'bg-blue-400 drop-shadow-[0_0_15px_blue]',
    shieldClass: 'text-blue-400 drop-shadow-[0_0_15px_blue]',
    magicClass: 'to-blue-400 drop-shadow-[0_0_15px_blue]',
    desc: '像丟進池塘的小水花一樣清澈，也像考前一天讀進腦的單字一樣瞬間散開。'
  },
  {
    id: 'skin_n1',
    set: 'nature',
    item: '【外觀】🪵 原木訓練樁',
    chance: 5.0,
    rarity: 'N',
    type: 'skin',
    buff: null,
    emoji: '🪵',
    bossEmoji: '🌳',
    battleQuip: '「……」安靜挨打中（木曜日の木）',
    desc: '「木曜日」の「木」。永遠不還手的溫柔前輩，最適合拿來暖身練習五十音。'
  },
  {
    id: 'chip_n_wa_ga',
    set: 'nature',
    item: '【晶片】😵 「は」與「が」迷惘碎片',
    chance: 5.0,
    rarity: 'N',
    type: 'chip',
    buff: '每次答對額外 +2 G（迷惘補貼）',
    icon: '😵',
    desc: '學了兩年日文，每次造句碰到「は」跟「が」還是只能全憑心電感應二選一。'
  },
  {
    id: 'chip_n_forget',
    set: 'nature',
    item: '【晶片】🐟 金魚腦七秒記憶體',
    chance: 5.0,
    rarity: 'N',
    type: 'chip',
    buff: '閱讀測驗時間 +3 秒',
    icon: '🐟',
    desc: '剛背完「えーと、なんだっけ…」翻到下一頁立刻忘光，多 3 秒讓你翻找記憶！'
  },
  {
    id: 'vfx_n_stamp',
    set: 'nature',
    item: '【特效】💮 老師蓋的紅花印',
    chance: 5.0,
    rarity: 'N',
    type: 'vfx',
    buff: '滿懷童年成就感的答題特效',
    vfxClass: 'bg-rose-400 drop-shadow-[0_0_15px_#fb7185]',
    shieldClass: 'text-rose-400 drop-shadow-[0_0_15px_#fb7185]',
    magicClass: 'to-rose-400 drop-shadow-[0_0_15px_#fb7185]',
    extra: '💮',
    desc: '小時候作業本上最想收集的大紅花「よくできました！」看到心情就變好。'
  },
  {
    id: 'vfx_n_mos',
    set: 'nature',
    item: '【特效】🦟 深夜讀書蚊子拍',
    chance: 5.0,
    rarity: 'N',
    type: 'vfx',
    buff: '答對額外 +2 G（夜間手速）',
    vfxClass: 'bg-lime-400 drop-shadow-[0_0_15px_#a3e635]',
    shieldClass: 'text-lime-400 drop-shadow-[0_0_15px_#a3e635]',
    magicClass: 'to-lime-400 drop-shadow-[0_0_15px_#a3e635]',
    extra: '🦟',
    desc: '半夜背動詞變化總有蚊子在耳邊「ぶーん」，揮手打蚊子的反射神經比選答案還快。'
  },
  {
    id: 'skin_n_teru',
    set: 'nature',
    item: '【外觀】👻 祈願晴天娃娃',
    chance: 5.0,
    rarity: 'N',
    type: 'skin',
    buff: '保佑下一題出你會的單字',
    emoji: '👻',
    bossEmoji: '☀️',
    battleQuip: '「明日天気になあれ～今天不要考自他動詞～」',
    desc: '掛在螢幕上的心靈寄託，祈求今天系統不要隨機抽到最討厭的使役被動形。'
  },
  {
    id: 'skin_n_dictionary',
    set: 'nature',
    item: '【外觀】📘 嶄新沒翻過課本',
    chance: 5.0,
    rarity: 'N',
    type: 'skin',
    buff: '書頁潔白無瑕（精神防禦+0）',
    emoji: '📘',
    bossEmoji: '📚',
    battleQuip: '「書本發出『你根本沒翻開過我吧』的無言嘆息…」',
    desc: '買了《大家的日本語進階 II》，結果只讀到第 26 課就安靜地放在書架上供奉。'
  }
];

export const SET_BONUSES = {
  sakura: {
    name: '🌸 櫻華神樂套裝 (3/3)',
    desc: '完美通關金幣 +40%，且失誤時護盾損失降低 20%'
  },
  cyber: {
    name: '⚡ 量子駭客套裝 (3/3)',
    desc: '閱讀時間寬裕度 +2 秒，每進入下一波回復 10 點護盾'
  },
  shachiku: {
    name: '🚃 終電社畜不屈套裝 (3/3)',
    desc: '失誤護盾損失減少 25%，全通關額外領取「加班津貼 +120 G」'
  },
  izakaya: {
    name: '🍻 居酒屋微醺流暢套裝 (3/3)',
    desc: '每次答對連擊額外 +10 G，失誤時 25% 機率「醉拳閃避」不扣護盾'
  },
  chuuni: {
    name: '🍜 深夜動畫狂熱套裝 (3/3)',
    desc: '中二魂覺醒：神速直覺判定放寬 +0.6 秒，全通關額外獎勵 +100 G'
  },
  mythic: {
    name: '🌌 虛數合格奇蹟套裝 (3/3)',
    desc: '全通關金幣 +50%、單題答對回 3 護盾、閱讀測驗時間 +10 秒'
  }
};

export const COLLECTION_MILESTONES = [
  { count: 5, title: '🌱 抽卡初心者', rewardGold: 500, rewardCores: 0, desc: '解鎖 5 件虛擬裝備' },
  { count: 10, title: '🎒 N4 裝備收藏家', rewardGold: 800, rewardCores: 3, desc: '解鎖 10 件虛擬裝備' },
  { count: 18, title: '🔥 迷因語譯大師', rewardGold: 1200, rewardCores: 5, desc: '解鎖 18 件虛擬裝備' },
  { count: 25, title: '👑 霓虹卡池霸主', rewardGold: 2000, rewardCores: 8, desc: '解鎖 25 件虛擬裝備' },
  { count: 33, title: '🌌 全圖鑑制霸傳說', rewardGold: 5000, rewardCores: 15, desc: '集齊全部 33 件虛擬收藏！' }
];

export const BANNER_THEMES = [
  { id: 'sakura_up', name: '🌸【櫻華神樂】專屬主題特選', featuredSet: 'sakura', desc: '櫻花系列 SSR 出現機率大幅提升！' },
  { id: 'cyber_up', name: '⚡【賽博矩陣】限定技術特選', featuredSet: 'cyber', desc: '量子電磁系列 SSR 出現機率大幅提升！' },
  { id: 'shachiku_up', name: '🚃【終電社畜】加班狂奔特選', featuredSet: 'shachiku', desc: '終電大叔、黑咖啡、死線晶片機率 UP！' },
  { id: 'izakaya_up', name: '🍻【居酒屋微醺】乾杯宵夜特選', featuredSet: 'izakaya', desc: '章魚燒、生啤特效、關東煮晶片機率 UP！' },
  { id: 'chuuni_up', name: '🍜【深夜動畫】泡麵中二特選', featuredSet: 'chuuni', desc: 'UR泡麵結界、踩鍵盤貓咪、邪王真眼機率 UP！' },
  { id: 'mythic_up', name: '🌌【虛數神話】UR 奇蹟祈願池', featuredSet: 'mythic', desc: '神話 UR 量子防禦、黑洞、金龍神出現機率大幅 UP！' },
  { id: 'classic', name: '🌐【全域標準】綜合資料庫', featuredSet: null, desc: '全 33 件虛擬收藏與迷因卡牌隨機出現。' }
];

export const DEFAULT_GACHA_POOL = [
  { id: 'g1', item: '🧋 一杯手搖飲 / 點心犒賞', chance: 60 },
  { id: 'g2', item: '🎮 無罪惡感自由遊戲 1 小時', chance: 31 },
  { id: 'g3', item: '🎁 買一本喜歡的書或生活小物', chance: 9 }
];
