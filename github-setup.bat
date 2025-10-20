@echo off
echo ========================================
echo GitHub セットアップ
echo ========================================
echo.
echo [Step 1] GitHub CLI にログイン
echo.
echo ブラウザが開きます。以下の手順で進めてください：
echo.
echo 1. Account: GitHub.com を選択
echo 2. Protocol: HTTPS を選択
echo 3. Authenticate Git: Yes を選択
echo 4. How to authenticate: Login with a web browser を選択
echo 5. ブラウザで表示されるコードをコピー
echo 6. GitHub にログイン（ユーザー名: MasaruYusa）
echo 7. コードを入力して認証
echo.
pause

gh auth login

if %errorlevel% neq 0 (
    echo.
    echo ❌ ログインに失敗しました
    pause
    exit /b 1
)

echo.
echo ✅ ログイン成功
echo.

echo [Step 2] リポジトリ作成とプッシュ
echo.
echo リポジトリ名: 520-habit-stack
echo ユーザー名: MasaruYusa
echo 公開設定: Public
echo.
pause

gh repo create 520-habit-stack --public --source=. --description "LLM-powered habit formation app for consistent 5:20 AM wake-up - Built with Next.js 14, Anthropic Claude API, and Prisma" --push

if %errorlevel% neq 0 (
    echo.
    echo ❌ リポジトリ作成に失敗しました
    echo.
    echo 既にリポジトリが存在する可能性があります
    echo GitHub で確認してください: https://github.com/MasaruYusa/520-habit-stack
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
echo https://github.com/MasaruYusa/520-habit-stack
echo.
echo ブラウザで開きますか？ (Y/N)
set /p OPEN_BROWSER="> "

if /i "%OPEN_BROWSER%"=="Y" (
    start https://github.com/MasaruYusa/520-habit-stack
)

echo.
echo 次のステップ:
echo   1. deploy-vercel.bat を実行して Vercel にデプロイ
echo   2. Vercel で環境変数を設定
echo   3. データベースをセットアップ
echo.
echo 詳細は DEPLOY.md を参照してください
echo.
pause
