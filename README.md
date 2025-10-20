# 5:20 Habit Stack

> LLM-powered habit formation app to help you consistently wake up at 5:20 AM every day

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## 🎉 セットアップ完了！

**このプロジェクトはすでにセットアップ済みです！**

### ローカル開発：

1. **環境変数を設定**: `.env` を編集して `ANTHROPIC_API_KEY` を追加
2. **開発サーバー起動**: `START.bat` をダブルクリック（または `pnpm run dev`）
3. **ブラウザで開く**: http://localhost:3001

📖 詳細は **[QUICKSTART.md](./QUICKSTART.md)** を参照

### 🚀 デプロイ：

**GitHub にプッシュ:**
```bash
# 1. GitHub CLI にログイン
gh auth login

# 2. リポジトリ作成 & プッシュ
deploy-github.bat
```

**Vercel にデプロイ:**
```bash
# 1. Vercel CLI にログイン & デプロイ
deploy-vercel.bat

# 2. 環境変数を設定（Vercel Dashboard）
# 3. データベースをセットアップ
```

📖 詳細は **[DEPLOY.md](./DEPLOY.md)** を参照

---

## Overview

**5:20 Habit Stack** is a Web/PWA application that helps you build and maintain a consistent early morning wake-up routine through:

1. **AI-Generated Habit Stacks**: Claude AI creates a personalized 3-7 step morning routine
2. **Daily Check-ins**: One-tap completion tracking with actual wake time logging
3. **Progress Visualization**: Streak tracking, weekly completion rates, and wake time charts
4. **Smart Notifications**: Web Push reminders (night + morning)
5. **Weekly Reflections**: AI-generated insights and habit stack optimization

---

## Key Features

### Must-Have (MVP)
- ✅ Goal input & LLM-generated habit stack (editable)
- ✅ Daily checklist with 1-tap completion
- ✅ Streak counter + weekly completion rate
- ✅ Actual wake time tracking
- ✅ Web Push notifications (night reminder + morning wake-up)
- ✅ Weekly AI reflection summaries

### Planned (Post-MVP)
- 📅 2-week onboarding with gradual time adjustment
- 📊 Mood/alertness scoring
- 🏷️ Snooze reason tag analysis
- 📧 Email notifications (iOS fallback)
- ⌚ Wearable integration (Apple Health, Google Fit)

---

## Project Status

**Current Phase**: 🔵 **Planning** (Phase 0)

See [CLAUDE.md](./CLAUDE.md) for detailed requirements, architecture, and implementation roadmap.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PWA**: Workbox (service worker)

### Backend
- **API**: Next.js API Routes (serverless)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma
- **Auth**: Auth.js (NextAuth v5)

### AI/LLM
- **Primary**: Anthropic Claude 3.5 Sonnet
- **Fallback**: OpenAI GPT-4o

### Infrastructure
- **Hosting**: Vercel (or self-hosted)
- **Notifications**: Web Push API
- **Monitoring**: Custom `/metrics` endpoint

---

## Project Structure

```
.
├── apps/
│   └── web/                    # Next.js 14 app
│       ├── app/                # App Router pages
│       ├── lib/                # Utilities (auth, notifications)
│       └── public/             # Static assets
├── packages/
│   ├── core/                   # Business logic (models, streak calc, LLM prompts)
│   └── ui/                     # Shared React components
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # DB migrations
├── e2e/                        # Playwright E2E tests
├── docs/
│   └── decision-records/       # Architecture Decision Records (ADRs)
├── .github/
│   ├── workflows/              # CI/CD (GitHub Actions)
│   └── PULL_REQUEST_TEMPLATE.md
├── CLAUDE.md                   # 📘 Single Source of Truth (requirements, decisions, changelog)
├── README.md                   # This file
└── package.json                # Monorepo root
```

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/520-habit-stack.git
cd 520-habit-stack

# Install dependencies
pnpm install

# Set up git hooks (husky)
pnpm run prepare

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (Anthropic, Auth.js secret, etc.)

# Initialize database
pnpm run db:push

# Run development server
pnpm run dev
```

Visit `http://localhost:3000` to see the app.

---

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write tests first (TDD)
- Implement feature
- **Update CLAUDE.md** with:
  - Description of changes
  - Updated change log
  - Any new risks or resolved questions

### 3. Pre-Commit Checks
Our husky pre-commit hook enforces:
- ✅ CLAUDE.md updates when `src/` changes
- ✅ Lint checks
- ✅ Type checks

### 4. Create Pull Request
Use the PR template (automatically populated) and fill in:
- [x] Description & motivation
- [x] **CLAUDE.md updated** checkbox
- [x] Test plan
- [x] Rollback plan

### 5. Review & Merge
- All CI checks must pass (tests, Lighthouse, etc.)
- At least 1 approval required
- Squash merge to `main`

---

## Testing

```bash
# Unit tests (Vitest)
pnpm run test

# E2E tests (Playwright)
pnpm run test:e2e

# Type checking
pnpm run typecheck

# Linting
pnpm run lint

# Run all checks (CI simulation)
pnpm run ci
```

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy on push to `main` (automatic)

### Self-Hosted
```bash
# Build for production
pnpm run build

# Start production server
pnpm run start
```

See [docs/deployment.md](./docs/deployment.md) for detailed instructions.

---

## Documentation

| Document | Purpose |
|----------|---------|
| **[CLAUDE.md](./CLAUDE.md)** | 📘 **Single Source of Truth** (requirements, architecture, decisions, changelog) |
| [CHANGELOG.md](./CHANGELOG.md) | User-facing release notes |
| [docs/decision-records/](./docs/decision-records/) | Architecture Decision Records (ADRs) |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |

**⚠️ Important**: All PRs modifying code in `src/` **must** update CLAUDE.md. This is enforced by pre-commit hooks.

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse (Mobile) | ≥ 90 | - |
| P95 Latency | < 200ms | - |
| Initial Load | < 50KB | - |
| Time to Interactive | < 3s (3G) | - |

See [CLAUDE.md § Performance Metrics](./CLAUDE.md#performance-metrics--measurements) for detailed measurements.

---

## Contributing

We welcome contributions! Please follow these steps:

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Check [open issues](https://github.com/yourusername/520-habit-stack/issues)
3. Create a feature branch
4. **Update CLAUDE.md** with your changes
5. Submit a PR using our template

**Key Rule**: No PR shall be merged without corresponding CLAUDE.md updates (enforced by CI).

---

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

## Acknowledgments

- Inspired by James Clear's *Atomic Habits* (habit stacking concept)
- Powered by [Anthropic Claude](https://www.anthropic.com/claude) for AI-generated insights
- Built with [Next.js](https://nextjs.org/), [Prisma](https://www.prisma.io/), and [Auth.js](https://authjs.dev/)

---

## Support

- **Documentation**: See [CLAUDE.md](./CLAUDE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/520-habit-stack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/520-habit-stack/discussions)

---

**Happy habit building! 🌅**
