# TabSync 🌐✨

TabSync 是一款專為高效率工作者打造的 Chrome 擴充功能，結合了網頁爬蟲與 **Cloudflare Workers AI (Llama 3.1)**，能一鍵將您瀏覽器中所有開啟的分頁內容進行統整、翻譯與客製化摘要。

## ✨ 核心功能

*   **🤖 雲端 AI 智慧摘要**：一鍵抓取所有有效分頁的內容，送往 Cloudflare 雲端大腦進行總結，解決資訊焦慮。
*   **🌍 零延遲全介面多國語系 (i18n)**：內建 5 國語言（繁中、簡中、日文、英文、韓文），切換語言瞬間生效，連同 AI 輸出的語言也會一併強制轉換。
*   **🎯 自訂 AI 指令 (Custom Prompts)**：不只是總結！您可以輸入客製化指令（例如：「請幫我把這些網頁的報價整理成 Markdown 表格」），讓 AI 成為您的專屬助理。
*   **💾 隱形數據飛輪 (Data Flywheel)**：所有的爬取紀錄與 AI 摘要都會自動且非同步地寫入 Cloudflare D1 (SQL 資料庫) 中，為未來訓練您專屬的微調模型 (Fine-tuning) 默默收集高品質數據。
*   **📋 基礎生產力工具**：一鍵複製所有開啟分頁的標題與網址、單一網頁全文爬取。

## 🛠️ 技術架構

本專案採用前後端分離的無伺服器 (Serverless) 架構，將成本降至近乎 $0：

*   **前端 (Chrome Extension)**：
    *   Manifest V3
    *   純原生 JavaScript (Vanilla JS) + HTML + CSS
    *   高度模組化的 `i18n.js` 負責介面動態翻譯
*   **後端 (Cloudflare Workers)**：
    *   **運算核心**：Cloudflare Workers (處理 CORS、路由與邏輯)
    *   **AI 推論**：Workers AI (`@cf/meta/llama-3.1-8b-instruct-fp8`)
    *   **關聯式資料庫**：Cloudflare D1 (儲存 `logs` 數據)

## 🚀 部署與安裝指南

### 1. 後端部署 (Cloudflare)
請確保您已安裝 Node.js，並擁有 Cloudflare 帳號。
1. 進入 `backend` 資料夾：`cd backend`
2. 登入 Wrangler：`npx wrangler login`
3. 建立 D1 資料庫：`npx wrangler d1 create tabsync_logs`
4. 將產生的 `database_id` 填入 `backend/wrangler.toml` 中。
5. 初始化資料表：`npx wrangler d1 execute tabsync_logs --local --file=./schema.sql` (本地) / 替換 `--local` 為 `--remote` (線上)。
6. 發布 Worker：`npm run deploy`
7. 將發布後獲得的網址 (例如 `https://tabsync-backend.xxx.workers.dev`)，填入前端 `popup.js` 中的 `BACKEND_URL`。

### 2. 前端安裝 (Chrome)
1. 打開 Chrome 瀏覽器，進入 `chrome://extensions/`
2. 開啟右上角的「開發人員模式」。
3. 點擊左上角「載入未封裝項目」，選擇 `TabSync` 的根目錄資料夾。
4. 完成！點擊擴充功能列的 ✨ 圖示即可開始使用。

## 📁 專案結構
```text
TabSync/
├── manifest.json       # 擴充功能設定檔
├── popup.html          # 操作介面
├── popup.css           # 介面樣式
├── popup.js            # 核心執行邏輯 (執行文)
├── i18n.js             # 多國語系字典與切換邏輯 (構造文)
├── content.js          # 注入網頁的爬蟲腳本
└── backend/            # 後端 Cloudflare 專案
    ├── worker.js       # API 路由與 AI/DB 呼叫邏輯
    ├── wrangler.toml   # Cloudflare 綁定設定檔
    ├── schema.sql      # 資料庫建表語法
    └── package.json    # 部署腳本
```
