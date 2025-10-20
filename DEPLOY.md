# デプロイガイド

## 🚀 GitHub & Vercel デプロイ手順

### 前提条件
- ✅ Git コミット完了
- ✅ GitHub CLI インストール済み (`gh version 2.76.2`)
- ⚠️ GitHub CLI 認証が必要

---

## 📦 Step 1: GitHub にプッシュ

### 1-1. GitHub CLI にログイン

```bash
gh auth login
```

プロンプトに従って選択：
1. **What account do you want to log into?** → `GitHub.com`
2. **What is your preferred protocol for Git operations?** → `HTTPS`
3. **Authenticate Git with your GitHub credentials?** → `Yes`
4. **How would you like to authenticate GitHub CLI?** → `Login with a web browser`
5. ブラウザが開くので、表示されたワンタイムコードを入力してログイン

### 1-2. GitHub リポジトリを作成してプッシュ

```bash
gh repo create 520-habit-stack --public --source=. --remote=origin --push
```

オプション：
- `--public`: パブリックリポジトリ（プライベートにする場合は `--private`）
- `--source=.`: 現在のディレクトリ
- `--remote=origin`: リモート名を `origin` に設定
- `--push`: 作成後すぐにプッシュ

または、個別に実行：
```bash
# リポジトリ作成
gh repo create 520-habit-stack --public --description "LLM-powered habit formation app for consistent 5:20 AM wake-up"

# リモートを追加
git remote add origin https://github.com/あなたのユーザー名/520-habit-stack.git

# プッシュ
git push -u origin master
```

---

## ☁️ Step 2: Vercel にデプロイ

### 2-1. Vercel CLI をインストール

```bash
npm install -g vercel
```

### 2-2. Vercel にログイン

```bash
vercel login
```

メールアドレスを入力 → 送信されたメールのリンクをクリックして認証

### 2-3. プロジェクトをデプロイ

```bash
vercel
```

プロンプトに従って選択：
1. **Set up and deploy?** → `Y`
2. **Which scope?** → 自分のアカウントを選択
3. **Link to existing project?** → `N`
4. **What's your project's name?** → `520-habit-stack`
5. **In which directory is your code located?** → `./` (Enterでデフォルト)
6. **Want to override the settings?** → `N`

デプロイが完了すると、URLが表示されます：
```
✅ Production: https://520-habit-stack.vercel.app
```

### 2-4. 環境変数を設定

#### オプション1: Vercel Dashboard（推奨）
1. https://vercel.com/dashboard にアクセス
2. プロジェクト `520-habit-stack` を選択
3. **Settings** → **Environment Variables** に移動
4. 以下の環境変数を追加：

```
DATABASE_URL = postgresql://... (Vercel Postgres または Supabase の接続文字列)
NEXTAUTH_URL = https://あなたのデプロイURL.vercel.app
NEXTAUTH_SECRET = openssl rand -base64 32 で生成した値
ANTHROPIC_API_KEY = sk-ant-api03-...
EMAIL_SERVER_HOST = smtp.example.com
EMAIL_SERVER_PORT = 587
EMAIL_SERVER_USER = noreply@example.com
EMAIL_SERVER_PASSWORD = password
EMAIL_FROM = noreply@example.com
```

#### オプション2: Vercel CLI
```bash
vercel env add ANTHROPIC_API_KEY
# プロンプトでAPI keyを入力
# Environment を選択: Production, Preview, Development

vercel env add DATABASE_URL
# PostgreSQL接続文字列を入力

vercel env add NEXTAUTH_SECRET
# openssl rand -base64 32 で生成した値を入力
```

### 2-5. データベースをセットアップ

#### Vercel Postgres（推奨）
```bash
# Vercel Dashboardから:
# Storage → Create Database → Postgres
# 作成後、接続文字列をコピーして環境変数 DATABASE_URL に設定
```

#### Prisma マイグレーション
```bash
# ローカルで本番DB用のマイグレーション作成
npx prisma migrate dev --name init

# または、本番環境でPrismaスキーマをプッシュ
vercel env pull .env.production
DATABASE_URL="接続文字列" npx prisma db push
```

### 2-6. 再デプロイ

環境変数を設定後、再デプロイ：
```bash
vercel --prod
```

---

## ✅ デプロイ完了チェックリスト

- [ ] GitHub リポジトリ作成 & プッシュ完了
- [ ] Vercel プロジェクト作成
- [ ] 環境変数設定完了
  - [ ] `DATABASE_URL`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `NEXTAUTH_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] メール設定（オプション）
- [ ] データベース初期化完了
- [ ] 本番デプロイ成功
- [ ] アプリが正常に動作することを確認

---

## 🔗 デプロイ後のURL

### Production
```
https://520-habit-stack.vercel.app
```

### GitHub Repository
```
https://github.com/あなたのユーザー名/520-habit-stack
```

---

## ⚠️ トラブルシューティング

### デプロイエラー: "DATABASE_URL not set"
→ Vercel Dashboard で環境変数を設定してください

### Prisma Client エラー
```bash
# package.jsonにpostinstallスクリプトを追加
"postinstall": "prisma generate"
```

### 認証エラー
→ `NEXTAUTH_SECRET` と `NEXTAUTH_URL` が正しく設定されているか確認

---

## 📚 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
