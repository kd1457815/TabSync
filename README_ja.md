# TabSync 🌐✨

TabSyncは、生産性の高いプロフェッショナルのために構築されたChrome拡張機能です。ウェブスクレイピングと **Cloudflare Workers AI (Llama 3.1)** を組み合わせることで、ブラウザで開いているすべてのタブの内容をワンクリックで統合、翻訳、カスタム要約することができます。

## ✨ 主な機能

*   **🤖 クラウドAIスマート要約**: 開いているすべての有効なタブの内容をワンクリックで取得し、Cloudflareのクラウドブレインに送信して要約。情報過多を解消します。
*   **🌍 ゼロ遅延フルUI多言語対応 (i18n)**: 5ヶ国語（繁体字中国語、簡体字中国語、日本語、英語、韓国語）を内蔵。言語を切り替えるとUIが瞬時に変更され、AIの出力言語も強制的に切り替わります。
*   **🎯 カスタムAI指示 (Custom Prompts)**: 単なる要約ではありません！カスタム指示を入力することで（例：「これらのウェブページの見積もりをMarkdownテーブルに整理してください」）、AIを専属のアシスタントに変えることができます。
*   **💾 インビジブル・データ・フライホイール (Data Flywheel)**: すべてのスクレイピング記録とAI要約は、非同期で自動的にCloudflare D1（SQLデータベース）に書き込まれます。これにより、将来の専用モデルの微調整 (Fine-tuning) のために高品質なデータが静かに収集されます。
*   **📋 基本的な生産性ツール**: 開いているすべてのタブのタイトルとURLをワンクリックでコピーしたり、単一のウェブページの全文をスクレイピングしたりできます。

## 🛠️ 技術アーキテクチャ

このプロジェクトは、コストをほぼ $0 に抑える、フロントエンドとバックエンドが分離されたサーバーレス (Serverless) アーキテクチャを採用しています：

*   **フロントエンド (Chrome Extension)**:
    *   Manifest V3
    *   ピュアなネイティブJavaScript (Vanilla JS) + HTML + CSS
    *   UIの動的翻訳を担当する、高度にモジュール化された `i18n.js`
*   **バックエンド (Cloudflare Workers)**:
    *   **コンピューティングコア**: Cloudflare Workers（CORS、ルーティング、ロジックの処理）
    *   **AI推論**: Workers AI (`@cf/meta/llama-3.1-8b-instruct-fp8`)
    *   **リレーショナルデータベース**: Cloudflare D1 (`logs` データの保存)

## 🚀 デプロイとインストールのガイド

### 1. バックエンドのデプロイ (Cloudflare)
Node.jsがインストールされており、Cloudflareアカウントを持っていることを確認してください。
1. `backend` フォルダに入ります: `cd backend`
2. Wranglerにログインします: `npx wrangler login`
3. D1データベースを作成します: `npx wrangler d1 create tabsync_logs`
4. 生成された `database_id` を `backend/wrangler.toml` に記入します。
5. データテーブルを初期化します: `npx wrangler d1 execute tabsync_logs --local --file=./schema.sql` (ローカル) / `--local` を `--remote` に置き換えます (オンライン)。
6. Workerを公開します: `npm run deploy`
7. 公開後に得られたURL（例: `https://tabsync-backend.xxx.workers.dev`）を、フロントエンドの `popup.js` にある `BACKEND_URL` に記入します。

### 2. フロントエンドのインストール (Chrome)
1. Chromeブラウザを開き、`chrome://extensions/` にアクセスします。
2. 右上の「デベロッパーモード」をオンにします。
3. 左上の「パッケージ化されていない拡張機能を読み込む」をクリックし、`TabSync` のルートフォルダを選択します。
4. 完了です！拡張機能バーの ✨ アイコンをクリックして使い始めてください。

## 📁 プロジェクト構造
```text
TabSync/
├── manifest.json       # 拡張機能の設定ファイル
├── popup.html          # 操作UIインターフェース
├── popup.css           # UIスタイル
├── popup.js            # コア実行ロジック (実行コード)
├── i18n.js             # 多言語辞書と切り替えロジック (構造コード)
├── content.js          # ウェブページに注入するスクレイパースクリプト
└── backend/            # バックエンドCloudflareプロジェクト
    ├── worker.js       # APIルーティングとAI/DB呼び出しロジック
    ├── wrangler.toml   # Cloudflareバインディング設定ファイル
    ├── schema.sql      # データベーステーブル作成SQL
    └── package.json    # デプロイスクリプト
```
