@echo off
echo ========================================
echo GitHub デプロイスクリプト
echo ========================================
echo.

echo [Step 1/2] GitHub CLI 認証状態を確認...
gh auth status
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ GitHub CLI にログインしてください
    echo.
    echo 以下のコマンドを実行してください：
    echo   gh auth login
    echo.
    echo ブラウザが開き、認証コードが表示されます
    echo 認証後、このスクリプトを再度実行してください
    echo.
    pause
    exit /b 1
)

echo ✅ GitHub CLI 認証済み
echo.

echo [Step 2/2] GitHub リポジトリを作成してプッシュ...
gh repo create 520-habit-stack ^
    --public ^
    --source=. ^
    --description "LLM-powered habit formation app for consistent 5:20 AM wake-up - Built with Next.js 14, Anthropic Claude API, and Prisma" ^
    --push

if %errorlevel% neq 0 (
    echo.
    echo ❌ エラーが発生しました
    echo.
    echo 既にリポジトリが存在する場合は、以下のコマンドで手動プッシュしてください：
    echo   git remote add origin https://github.com/あなたのユーザー名/520-habit-stack.git
    echo   git push -u origin master
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ GitHub デプロイ完了！
echo ========================================
echo.
echo リポジトリURL:
gh repo view --web
echo.
echo 次のステップ:
echo   1. deploy-vercel.bat を実行して Vercel にデプロイ
echo   2. または DEPLOY.md の手順に従って手動デプロイ
echo.
pause
