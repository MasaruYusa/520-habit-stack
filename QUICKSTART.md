# 🚀 クイックスタートガイド

## セットアップ完了済み ✅

以下のセットアップは**すでに完了**しています：
- ✅ pnpm インストール済み
- ✅ 依存関係インストール済み (`pnpm install`)
- ✅ Prisma Client 生成済み
- ✅ SQLite データベース作成済み (`dev.db`)
- ✅ 環境変数ファイル作成済み (`.env`)

---

## 🎯 すぐに始める

### 1. 環境変数の設定（重要）

`.env` ファイルを編集して、以下を設定してください：

#### 必須項目

**Anthropic API Key**（LLM機能に必要）
```bash
ANTHROPIC_API_KEY="sk-ant-api03-your-actual-key-here"
```

取得方法：
1. https://console.anthropic.com/ にアクセス
2. サインアップ/ログイン
3. API Keys → Create Key
4. `.env` の `ANTHROPIC_API_KEY` を置き換える

#### オプション（後で設定可）

**メール送信**（認証に必要だが、テストでは後回しでOK）

ローカルテスト用には [Ethereal Email](https://ethereal.email/) が便利：
1. https://ethereal.email/ にアクセス
2. "Create Ethereal Account" をクリック
3. 表示された認証情報を `.env` にコピー：

```bash
EMAIL_SERVER_HOST="smtp.ethereal.email"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-generated-user@ethereal.email"
EMAIL_SERVER_PASSWORD="your-generated-password"
EMAIL_FROM="noreply@520habitstack.local"
```

---

### 2. 開発サーバーを起動

```bash
pnpm run dev
```

起動すると：
- **Next.js**: http://localhost:3000
- ターミナルにログが表示されます

---

### 3. アプリを使ってみる

#### Step 1: サインイン
1. http://localhost:3000/signin にアクセス
2. メールアドレスを入力
3. **Ethereal Email を設定している場合**:
   - https://ethereal.email/messages で受信メールを確認
   - マジックリンクをクリック
4. **メール未設定の場合**:
   - ターミナルのログに表示されるトークンURLを直接開く（Next Auth開発モード）

#### Step 2: 目標を作成
1. ダッシュボードが `/goal/new` にリダイレクト
2. 起床時刻を入力（例: `05:20`）
3. 実施する曜日を選択
4. 「AIで習慣スタックを生成」をクリック
   - ⚠️ **ANTHROPIC_API_KEY が正しく設定されている必要があります**
5. 生成された習慣を編集（追加/削除/修正可能）
6. 「目標を保存」

#### Step 3: デイリーチェック
1. ダッシュボードに戻る
2. 「チェックリストを開始」をクリック
3. 実際の起床時刻を入力
4. 習慣をチェック
5. ステータスを選択（完了/スヌーズ/スキップ）
6. 「記録を保存」

#### Step 4: 週次振り返り
1. `/reflection` にアクセス
2. 「週次振り返りを生成」をクリック
3. AIによる分析とアドバイスを表示

---

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
pnpm run dev

# ビルド
pnpm run build

# 型チェック
pnpm run typecheck

# リンター
pnpm run lint

# フォーマット
pnpm run format

# Prismaスキーマ変更後の反映
pnpm exec prisma db push
pnpm exec prisma generate

# データベースをリセット（すべてのデータが消えます）
pnpm exec prisma db push --force-reset
```

---

## 📁 プロジェクト構造

```
apps/web/
├── app/
│   ├── (auth)/signin/      # サインインページ
│   ├── (dashboard)/page.tsx # ダッシュボード
│   ├── goal/new/           # 目標作成
│   ├── checklist/          # デイリーチェック
│   ├── reflection/         # 週次振り返り
│   └── api/                # API Routes
│       ├── auth/           # Auth.js
│       ├── goal/           # 目標CRUD
│       ├── habit-stack/    # LLM習慣生成
│       ├── checklist/      # チェック記録
│       └── reflection/     # 週次分析
└── lib/
    ├── auth.ts             # 認証設定
    └── prisma.ts           # DBクライアント

packages/core/src/
├── streak.ts               # 連続日数計算
├── analytics.ts            # 週次メトリクス
└── llm/
    ├── client.ts           # Claude API
    └── prompts/            # プロンプトテンプレート

prisma/
└── schema.prisma           # データベーススキーマ
```

---

## ⚠️ トラブルシューティング

### "LLM service is not configured" エラー
→ `.env` の `ANTHROPIC_API_KEY` を正しく設定してください

### メールが送信されない
→ Ethereal Email を使うか、ターミナルのログからトークンURLを取得

### データベースエラー
```bash
# データベースをリセット
pnpm exec prisma db push --force-reset
```

### Windows環境でのフォントエラー（解決済み）
**エラー**: `ERR_UNSUPPORTED_ESM_URL_SCHEME` (next/font関連)

**解決策**: 本プロジェクトでは既に修正済みです。Google Fontsを直接読み込む方式に変更しています。
もし問題が発生する場合は、`apps/web/app/layout.tsx`を確認してください。

### ポート3000が使用中
Next.jsは自動的に次の利用可能なポート（3001, 3002...）を使用します。
ターミナルに表示されるURLを確認してください：
```
- Local:        http://localhost:3001
```

手動でポートを指定する場合：
```bash
PORT=3001 pnpm run dev
```

---

## 📚 詳細ドキュメント

- **[CLAUDE.md](./CLAUDE.md)** - 要件・アーキテクチャ・決定事項
- **[README.md](./README.md)** - プロジェクト概要
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - 開発ガイドライン

---

**質問があれば CLAUDE.md または issue を確認してください！** 🎉
