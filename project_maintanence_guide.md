N4 語譯駭客 (Cyber Japanese N4) - 專案交接與維護手冊
本專案為一套融合「現代手機遊戲多巴胺循環機制（抽卡、偽裝昇格、保底、Web Audio 音效、套裝共鳴）」與「JLPT N4 日語檢定（單字、文法排序、動詞變化、閱讀理解）」的單頁型 React 學習應用。
1. 專案架構概覽 (Architecture)
￼ 核心技術棧：React (Hooks: ⁠useState⁠, ⁠useEffect⁠, ⁠useRef⁠)、Tailwind CSS、Lucide React (圖標)、Firebase Firestore & Auth。
￼ 單檔案設計架構：目前的程式碼採用單一獨立檔案設計（Single File Component），可無縫嵌入各類沙盒環境或直接轉移至 Vite/Next.js 等專案。
￼ 音效模組 (⁠SoundFX⁠)：
￼ 使用 HTML5 Web Audio API 原生合成振盪器（Oscillator），無外部音檔或靜態資源依賴。
￼ 支援打擊音（Triangle Wave）、錯誤警告（Sawtooth Wave）、抽卡蓄力嗡鳴（Riser）、過載昇格警報（Glitch Alert）與稀有和弦（Chime Chord）。
￼ 文字注音引擎 (⁠RubyText⁠)：
￼ 支援漢字平假名標註語法：⁠漢字[ふりがな]⁠。
￼ ⁠showRuby=false⁠ 時僅渲染漢字主體（題目使用），⁠showRuby=true⁠ 時渲染 ⁠<ruby>⁠ 與 ⁠<rt>⁠ 假名（回饋解析與日誌使用）。
2. 遊戲系統與抽卡心理學模組
2.1 抽卡經濟與機制設計
1. 雙卡池架構：
￼ 虛擬裝備池 (Virtual Pool)：消耗遊戲內產出金幣（單抽 300G / 十連 2700G 享 9 折）。
￼ 現實犒賞池 (Real-life Pool)：玩家自訂現實犒賞目標（如手搖飲、遊戲時間），每抽 500G。
2. 保底與軟保底機制 (Pity System)：
￼ 硬保底：30 抽必出 SSR 或 UR。
￼ 軟保底：第 20 抽起，每抽額外遞增 5% 出貨率。
3. 偽裝昇格演出 (Fake-out Upgrade)：
￼ 當系統抽中 SSR/UR 時，有 35% 機率觸發「變異昇格」：最初顯示為普通的藍光或紫光，在蓄力最後一刻觸發螢幕劇烈震動與警報音效，瞬間轉變為彩虹金色卡牌。
4. 重複補償與天井黑市 (Data Cores & Sparking)：
￼ 抽到重複裝備不會浪費，轉化為「資料核心（Data Core）」與 100G 補償。
￼ 天井黑市可使用核心直接自選兌換指定 SSR (8核心) / UR (15核心)。
5. 數值節制與套裝共鳴 (Set Synergy)：
￼ 避免數值過度膨脹（Power Creep），裝備與套裝 Buff 僅提供**「作答時間寬限」、「金幣收益提升」與「失誤免死護盾」**，確保玩家必須真正理解題目才能破關。
3. 題庫擴充指南 (Question Database)
題庫位於程式碼前段常數區，擴充時請遵循以下資料格式：
3.1 單字題 (⁠VOCAB_DATA⁠)
3.2 文法排序題 (⁠GRAMMAR_SORT_DATA⁠)
3.3 動詞變化詠唱題 (⁠GRAMMAR_TYPE_DATA⁠)
3.4 二擇一藥水題 (⁠POTION_DATA⁠)
3.5 閱讀測驗題 (⁠READING_DATA⁠)
4. 如何在 GitHub 上讓 Jules 接手維護
當你將專案推送到 GitHub 後，Jules（或支援 GitHub Issue/PR 的 AI Agent）可以幫你進行維護、拆分檔案或追加新功能。請依照以下步驟操作：
步驟一：專案推上 GitHub
建議的專案目錄結構：
步驟二：指派任務給 Jules 的標準 Prompt 範本
在 GitHub 的 Issue 或 PR 中，直接 tag Jules 並給予結構清晰的指令：
範例 1：要求將單檔案拆分為標準專案架構
範例 2：批次擴充題庫
範例 3：新增自訂功能（如：錯題複習專區）
5. 常見維護注意事項
￼ 金幣與平衡性：單局通關基礎獎勵為 500G，單抽 300G。請勿隨意提升單字擊殺直接傷害，維持「重視作答理解而非純數值碾壓」的初衷。
￼ 注音正規表示式：⁠RubyText⁠ 依賴 ⁠/([一-龯々]+)\[(.*?)\]/g⁠ 匹配漢字與平假名。若標註非漢字字元（如片假名），請留意匹配規則。