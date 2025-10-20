@echo off
echo ========================================
echo Vercel デプロイスクリプト
echo ========================================
echo.

echo [Step 1/4] Vercel CLI を確認...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI がインストールされていません
    echo.
    echo インストール中...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Vercel CLI のインストールに失敗しました
        pause
        exit /b 1
    )
)

vercel --version
echo ✅ Vercel CLI 確認完了
echo.

echo [Step 2/4] Vercel にログイン...
echo.
echo ⚠️ ブラウザが開きます。Vercel アカウントでログインしてください
echo.
pause

vercel login
if %errorlevel% neq 0 (
    echo.
    echo ❌ ログインに失敗しました
    pause
    exit /b 1
)

echo ✅ ログイン完了
echo.

echo [Step 3/4] プロジェクトをデプロイ（プレビュー）...
echo.
echo 以下の質問に答えてください：
echo   - Set up and deploy? Y
echo   - Which scope? （自分のアカウントを選択）
echo   - Link to existing project? N
echo   - Project name? 520-habit-stack （またはお好みの名前）
echo   - In which directory is your code? ./
echo   - Want to override settings? N
echo.
pause

vercel
if %errorlevel% neq 0 (
    echo.
    echo ❌ デプロイに失敗しました
    pause
    exit /b 1
)

echo.
echo ✅ プレビューデプロイ完了
echo.

echo [Step 4/4] 本番環境にデプロイ...
echo.
echo ⚠️ 環境変数を設定してから本番デプロイしてください
echo.
echo 必要な環境変数:
echo   - ANTHROPIC_API_KEY
echo   - DATABASE_URL
echo   - NEXTAUTH_URL
echo   - NEXTAUTH_SECRET
echo.
echo Vercel Dashboard で設定:
echo   https://vercel.com/dashboard
echo.
echo または CLI で設定:
echo   vercel env add ANTHROPIC_API_KEY
echo   vercel env add DATABASE_URL
echo   vercel env add NEXTAUTH_SECRET
echo.
echo 本番デプロイを実行しますか？ (Y/N)
set /p DEPLOY_PROD="> "

if /i "%DEPLOY_PROD%"=="Y" (
    echo.
    echo 本番環境にデプロイ中...
    vercel --prod

    if %errorlevel% neq 0 (
        echo.
        echo ❌ 本番デプロイに失敗しました
        echo.
        echo 環境変数が設定されていない可能性があります
        echo Vercel Dashboard で設定してから再度実行してください
        pause
        exit /b 1
    )

    echo.
    echo ========================================
    echo ✅ 本番デプロイ完了！
    echo ========================================
) else (
    echo.
    echo 本番デプロイはスキップされました
    echo.
    echo 後で以下のコマンドで本番デプロイできます:
    echo   vercel --prod
)

echo.
echo 次のステップ:
echo   1. Vercel Dashboard で環境変数を設定
echo   2. データベースをセットアップ (Vercel Postgres 推奨)
echo   3. npx prisma db push でスキーマを適用
echo   4. vercel --prod で本番デプロイ
echo.
echo 詳細は DEPLOY.md を参照してください
echo.
pause
