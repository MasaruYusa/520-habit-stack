# 5:20 Habit Stack — Project Documentation (Source of Truth)

**Last Updated**: 2025-10-19
**Version**: 1.0.0-alpha
**Status**: MVP Implementation Complete + Ready to Run ✅

---

## Document Purpose

This document serves as the **Single Source of Truth (SoT)** for the 5:20 Habit Stack project. All decisions, requirements, changes, and measurements must be recorded here. **No PR modifying `src/` shall be merged without corresponding updates to this document.**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [MVP Requirements](#mvp-requirements)
3. [Architecture & Design Decisions](#architecture--design-decisions)
4. [Data Model](#data-model)
5. [LLM Integration Strategy](#llm-integration-strategy)
6. [Notification Strategy](#notification-strategy)
7. [Implementation Checklist](#implementation-checklist)
8. [Performance Metrics & Measurements](#performance-metrics--measurements)
9. [Open Questions & Decisions](#open-questions--decisions)
10. [Change Log](#change-log)
11. [Risk Register](#risk-register)

---

## Project Overview

### Purpose
Support consistent **5:20 AM wake-up** habit formation through LLM-generated habit stacks, daily tracking, and data-driven insights.

### Target User
Individual self-improvement (personal use).

### Core Concept
1. User inputs wake-up goal (5:20 AM, 7 days/week)
2. LLM generates **habit stack** (3-7 sequential morning actions)
3. User receives **daily notifications** (night reminder + morning wake-up)
4. User completes **daily checklist** (1-tap completion, snooze/skip reasons)
5. System tracks **streak, weekly completion rate, actual wake time**
6. Weekly **AI-generated reflection summary**

### Primary Scenario
**Scenario C**: LLM proposes habit stack → User executes morning routine → Daily check-in → Analysis & optimization

### Supported Devices
- **Primary**: Web (responsive) + PWA
- **Notifications**: Web Push (iOS limitations acknowledged; email fallback in Should)
- **Offline**: Cache today + tomorrow's data only

---

## MVP Requirements

### 1. Purpose & Background
Enable "wake up at 5:20 AM every day" habit through LLM-suggested habit stacks and daily execution/visualization support.

### 2. Target & Use Case
Personal self-improvement. Display 3-7 sequential morning actions → execute → record → optimize.

### 3. Functional Requirements

#### Must (P0 - Minimum Viable Product)
1. **Goal Input & LLM Proposal**
   - User inputs: Target time (5:20 AM), frequency (7 days/week), optional context
   - LLM generates 3-7 habit steps (e.g., "Turn off alarm", "Expose to natural light", "Drink water")
   - User can edit generated stack before saving

2. **Daily Checklist**
   - 1-tap completion for each step
   - Record actual wake time
   - Snooze with reason (free text or tags)
   - Skip with reason
   - Timestamp all actions

3. **Progress Tracking**
   - **Streak**: Consecutive days of successful 5:20 wake-up
   - **Weekly completion rate**: % of scheduled days completed
   - **Actual wake time log**: Chart showing 5:20 target vs actual

4. **Web Push Notifications**
   - **Night reminder**: "Tomorrow is a scheduled day" (configurable time, default 21:00)
   - **Morning wake-up**: At target time (5:20 AM)
   - User can adjust timing/disable per notification type

5. **Weekly Reflection**
   - Auto-generated summary every Sunday evening
   - Includes: completion rate, streak status, average wake time, LLM insights
   - Suggests habit stack adjustments if needed

#### Should (P1-P2 - High Priority Enhancements)
- **P1**: 2-week onboarding flow with micro-adjustments (e.g., gradual time shift from 6:00→5:20)
- **P2**: Mood/alertness scores (1-5 scale) after wake-up
- **P2**: Snooze reason tag analysis (top patterns visualization)
- **P2**: Email notification fallback (especially for iOS users)

#### Nice to Have (P3 - Future Enhancements)
- Wearable/smart alarm integration (sleep tracking)
- Social sharing (anonymized achievements)
- Badge system (30-day streaks, etc.)
- Sunrise-linked wake time (auto-adjust for seasons)

### 4. Non-Functional Requirements

#### Performance
- **P95 page transition**: < 200ms (measured via Web Vitals)
- **Initial data load**: < 50KB (compressed)
- **Lighthouse score** (mobile): ≥ 90 (Performance, Accessibility, Best Practices, SEO)

#### Security
- **Authentication**: Required (Email magic link or Passkey via Auth.js)
- **Transport**: HTTPS only
- **PII minimization**: No personally identifiable info sent to LLM (anonymize prompts)
- **Data retention**: User can export/delete all data

#### Observability
- **Core metrics**:
  - `request_count` (by route)
  - `latency_p95` (by route)
  - `error_rate` (4xx/5xx)
  - `notification_send_rate` (success/failure)
- **Tooling**: `/metrics` endpoint or external (Vercel Analytics, Plausible, etc.)
- **Logs**: Structured JSON, no PII in logs

#### Operations
- **Database backups**: Daily automated (if self-hosted)
- **Deployment**: Preview on PR, production on merge to `main`
- **Monitoring**: Alert on error_rate > 5% or latency_p95 > 500ms

### 5. Constraints

#### Technology Stack (Tentative)
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes (serverless)
- **Database**: SQLite (local dev) or Supabase/PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth v5)
- **LLM**: Anthropic Claude API (or OpenAI as fallback)
- **Notifications**: Web Push API + Workbox (service worker)
- **Testing**: Vitest (unit), Playwright (E2E)

#### Legal & Compliance
- Privacy policy & Terms of Service (must-have before public launch)
- Cookie consent banner (if using analytics)
- GDPR-friendly (user data export/deletion)

### 6. Success Criteria (Testable)

1. **E2E Test**: "Goal input → LLM proposal → Edit → Daily check → Weekly summary" passes in CI
2. **Streak Calculation**: 7-day streak computed accurately (verified via sample data)
3. **Notification Timing**: Push arrives within ±5 min of target time (mocked in test)
4. **Performance**: Lighthouse mobile score ≥ 90 (automated in CI)

### 7. Open Questions
See [Open Questions & Decisions](#open-questions--decisions) section below.

---

## Architecture & Design Decisions

### High-Level Architecture
```
┌─────────────────────────────────────────────────────┐
│  Client (Next.js App Router + PWA)                  │
│  - SSR pages + Client Components                    │
│  - Service Worker (notifications, offline cache)    │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│  API Routes (Next.js /app/api)                      │
│  - /api/auth/* (Auth.js)                            │
│  - /api/habit-stack (LLM generation)                │
│  - /api/checklist (daily CRUD)                      │
│  - /api/notifications (subscribe/send)              │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│  Core Business Logic (packages/core)                │
│  - models.ts (User, Goal, HabitStack, DailyLog)     │
│  - streak.ts (streak calculation)                   │
│  - analytics.ts (weekly summary)                    │
│  - llm/prompts/*.j2 (Jinja2 templates)              │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│  Data Layer (Prisma + DB)                           │
│  - SQLite (dev) / PostgreSQL (prod)                 │
└─────────────────────────────────────────────────────┘
```

### Directory Structure (Monorepo - Turborepo)
```
.
├── apps/
│   └── web/                    # Next.js 14 app
│       ├── app/                # App Router
│       │   ├── (auth)/         # Auth group
│       │   ├── (dashboard)/    # Main dashboard
│       │   ├── goal/           # Goal creation/edit
│       │   ├── checklist/      # Daily checklist
│       │   └── api/            # API routes
│       ├── lib/
│       │   ├── auth.ts
│       │   └── notifications/
│       │       └── sw.js       # Service worker
│       └── public/
├── packages/
│   ├── core/                   # Business logic
│   │   ├── models.ts
│   │   ├── streak.ts
│   │   ├── analytics.ts
│   │   └── llm/
│   │       └── prompts/
│   │           └── habitStack.j2
│   └── ui/                     # Shared components
│       └── components/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── infra/
│   └── docker-compose.yml      # Local DB + Redis (optional)
├── e2e/
│   └── habit-flow.spec.ts      # Playwright tests
├── docs/
│   └── decision-records/       # ADRs (Architecture Decision Records)
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── CLAUDE.md                   # This file (SoT)
├── README.md
├── CHANGELOG.md
└── package.json
```

### Key Design Decisions

#### ADR-001: Next.js App Router over Pages Router
- **Decision**: Use App Router (Next.js 14+)
- **Rationale**: Built-in React Server Components, better data fetching, cleaner routing
- **Trade-off**: Slightly newer API, but better long-term support

#### ADR-002: Prisma over raw SQL
- **Decision**: Use Prisma ORM
- **Rationale**: Type-safe queries, migrations, multi-DB support (SQLite ↔ PostgreSQL)
- **Trade-off**: Slight overhead, but dev experience gain outweighs cost

#### ADR-003: Web Push over Native Apps
- **Decision**: Web Push (via service workers) as primary notification method
- **Rationale**: Faster MVP, cross-platform (except iOS limitations)
- **Mitigation**: Email fallback for iOS users (P2)

_(Add more ADRs as decisions are made)_

---

## Data Model

### Prisma Schema (Draft v0.1)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // or "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  goals         Goal[]
  dailyLogs     DailyLog[]
  notifications NotificationSubscription[]
}

model Goal {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  targetTime       String   // "05:20"
  timezone         String   @default("Asia/Tokyo")
  daysOfWeek       String   // JSON array: [0,1,2,3,4,5,6] (0=Sunday)

  habitStack       Json     // Array of {step: string, order: number}

  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  dailyLogs        DailyLog[]

  @@index([userId])
}

model DailyLog {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  goalId           String
  goal             Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)

  date             DateTime // Date only (e.g., 2025-10-19)
  actualWakeTime   DateTime? // Actual wake timestamp

  completedSteps   Json     // Array of step indices completed
  status           String   // "completed" | "snoozed" | "skipped"
  snoozeReason     String?  // Free text or tag
  skipReason       String?

  moodScore        Int?     // 1-5 (P2 feature)
  alertnessScore   Int?     // 1-5 (P2 feature)

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([userId, goalId, date])
  @@index([userId, date])
}

model NotificationSubscription {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  endpoint     String   @unique
  keys         Json     // {p256dh, auth}

  nightReminder  Boolean @default(true)
  morningWakeup  Boolean @default(true)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
}

model WeeklySummary {
  id               String   @id @default(cuid())
  userId           String
  weekStart        DateTime // Monday 00:00
  weekEnd          DateTime // Sunday 23:59

  completionRate   Float    // 0.0 - 1.0
  streak           Int
  avgWakeTime      String   // "05:22"

  llmInsights      String   // AI-generated summary

  createdAt        DateTime @default(now())

  @@unique([userId, weekStart])
  @@index([userId])
}
```

---

## LLM Integration Strategy

### LLM Provider
- **Primary**: Anthropic Claude (Claude 3.5 Sonnet)
- **Fallback**: OpenAI GPT-4o (if needed)

### Prompt Template (Jinja2 format)

**File**: `packages/core/llm/prompts/habitStack.j2`

```jinja2
You are a habit formation coach specializing in morning routines.

User goal: Wake up at {{ target_time }} every day.
{% if user_context %}
Additional context: {{ user_context }}
{% endif %}

Generate a **habit stack** of 3-7 sequential actions to perform immediately after waking up. Each action should:
1. Be specific and actionable (e.g., "Turn off alarm", not "Start your day")
2. Take 1-5 minutes
3. Build momentum (easier → slightly harder)
4. Support wakefulness (e.g., light exposure, movement, hydration)

Output format (JSON):
{
  "habitStack": [
    {"step": "Turn off alarm and sit up immediately", "order": 1},
    {"step": "Open curtains to expose to natural light", "order": 2},
    {"step": "Drink a full glass of water", "order": 3}
  ],
  "rationale": "Brief explanation of why this sequence supports {{ target_time }} wake-up"
}

Output only valid JSON, no markdown.
```

### Anonymization Rules
- **Never send**: User email, name, IP, device ID
- **Send**: Target time, generic context (e.g., "works from home", not "John works at Company X")
- **Sanitize**: User input via allowlist (no URLs, emails, phone numbers)

### Evaluation Dataset
**File**: `packages/core/llm/fixtures/prompts.test.json`

```json
[
  {
    "input": {"target_time": "05:20", "user_context": "works from home, struggles with snooze button"},
    "expected_steps_count": [3, 7],
    "must_include_keywords": ["alarm", "light", "water"]
  }
]
```

**Test**: Ensure all fixtures produce valid JSON with 3-7 steps.

---

## Notification Strategy

### Web Push Implementation

#### Service Worker (`apps/web/lib/notifications/sw.js`)
- **Registration**: On user's first "Enable Notifications" action
- **Subscription**: Store endpoint + keys in DB (`NotificationSubscription`)
- **Triggers**:
  - **Night reminder**: Cron job (21:00 local time) → send push to subscribed users
  - **Morning wake-up**: Cron job (user's target time) → send push

#### Cron Job (Vercel Cron or self-hosted)
**File**: `apps/web/app/api/cron/send-notifications/route.ts`

```typescript
// Pseudo-code
export async function GET(req: Request) {
  const now = new Date();

  // Find users with notifications due
  const users = await db.user.findMany({
    where: {
      goals: { some: { isActive: true } },
      notifications: { some: { morningWakeup: true } }
    }
  });

  for (const user of users) {
    const localTime = convertToUserTimezone(now, user.timezone);
    const targetTime = user.goals[0].targetTime; // e.g., "05:20"

    if (isWithinWindow(localTime, targetTime, 5)) { // ±5 min
      await sendPushNotification(user.id, {
        title: "Good morning!",
        body: "Time to wake up at 5:20 AM",
        tag: "morning-wakeup"
      });
    }
  }
}
```

#### iOS Limitations
- Web Push **not supported** in iOS < 16.4, limited in 16.4+
- **Mitigation (P2)**: Email notifications via Resend/SendGrid

---

## Implementation Checklist

### Phase 0: Setup ✅ COMPLETE
- [x] Create CLAUDE.md (this file)
- [x] Create PR template with "Claude.md updated" checkbox
- [x] Set up pre-commit hook (lint + Claude.md diff check)
- [x] Initialize monorepo (Turborepo + pnpm)
- [x] Set up Prisma + SQLite for local dev
- [x] Configure Auth.js with email provider
- [x] Create basic Next.js app structure with Tailwind CSS

### Phase 1: Core Habit Stack Flow ✅ COMPLETE
- [x] **Goal creation page** (`/goal/new`)
  - [x] Form: target time, days of week, optional context
  - [x] "Generate with AI" button → call `/api/habit-stack`
  - [x] Display editable list (add/remove steps)
  - [x] Save to DB
- [x] **LLM integration** (`/api/habit-stack`)
  - [x] Implement prompt template with TypeScript
  - [x] Call Anthropic Claude API
  - [x] Parse JSON response
  - [x] Error handling and validation
- [x] **Dashboard** (`/`)
  - [x] Show active goal
  - [x] Display today's checklist if scheduled
  - [x] Show current streak + weekly completion rate
  - [x] Link to checklist page

### Phase 2: Daily Checklist ✅ COMPLETE
- [x] **Checklist UI** (`/checklist`)
  - [x] List all habit steps with checkboxes
  - [x] Input actual wake time (time picker)
  - [x] "Complete" / "Snooze" / "Skip" radio buttons
  - [x] Reason input (conditional on snooze/skip)
- [x] **Streak calculation** (`packages/core/streak.ts`)
  - [x] Algorithm: count consecutive days with status="completed"
  - [x] Timezone-aware date comparisons
- [x] **Weekly completion rate** (`packages/core/analytics.ts`)
  - [x] Calculate % of scheduled days completed in current week
  - [x] Average wake time calculation
  - [x] Dashboard integration

### Phase 3: Notifications (Simplified MVP)
- [x] **PWA setup**
  - [x] Create manifest.json
  - [x] Basic service worker for offline caching
  - [x] Push notification structure (basic)
- [ ] **Push notification API** (deferred to post-MVP)
  - [ ] Subscription management
  - [ ] Cron job for scheduled sends
  - [ ] VAPID key configuration

### Phase 4: Weekly Reflection ✅ COMPLETE
- [x] **LLM reflection prompt** (`llm/prompts/weeklyReflection.ts`)
  - [x] Input: completion rate, streak, wake times, reasons for snooze/skip
  - [x] Output: Summary, insights, suggestions, encouragement
- [x] **Reflection page** (`/reflection`)
  - [x] Generate reflection on demand
  - [x] Display weekly metrics + AI insights
  - [x] Save to database (WeeklySummary)

### Phase 5: Polish & Testing (Week 5)
- [ ] **E2E tests** (Playwright)
  - [ ] Full flow: signup → create goal → daily check → view reflection
- [ ] **Performance audit**
  - [ ] Run Lighthouse (mobile)
  - [ ] Record metrics in [Performance Metrics](#performance-metrics--measurements)
- [ ] **Accessibility audit**
  - [ ] Keyboard navigation
  - [ ] Screen reader testing
- [ ] **Security review**
  - [ ] Ensure no PII in LLM prompts
  - [ ] Check CSP headers
  - [ ] Rate limiting on API routes

---

## Performance Metrics & Measurements

### Baseline (Target)
- **Lighthouse Score** (Mobile): ≥ 90
- **P95 Latency**: < 200ms (page transitions)
- **Initial Load**: < 50KB (JS + CSS, compressed)
- **Time to Interactive** (TTI): < 3s on 3G

### Measurement Log

| Date       | Lighthouse | P95 Latency | Initial Load | Notes                  |
|------------|-----------|-------------|--------------|------------------------|
| 2025-10-19 | -         | -           | -            | Baseline (pre-impl)    |
|            |           |             |              |                        |

_(Update after each major feature or before each release)_

### Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## Open Questions & Decisions

### Status Legend
- 🔴 **Blocker** (must resolve before implementation)
- 🟡 **High Priority** (should resolve in Phase 1-2)
- 🟢 **Low Priority** (can defer to later phases)

---

#### Q1: Language Support 🟡
**Question**: Should the app support Japanese only initially, or include English from the start?

**Options**:
- A) Japanese only (target user is Japanese-speaking)
- B) Japanese + English (i18n from day 1)

**Decision**: ✅ **A** (Japanese only for MVP)

**Rationale**: Faster iteration, target user is Japanese-speaking. i18n can be added post-MVP.

**Impact**: UI strings, LLM prompt templates (Japanese), date/time formatting (ja-JP)

---

#### Q2: Notification Channels 🟡
**Question**: Is Web Push sufficient for MVP, or should we include email notifications in Phase 1?

**Options**:
- A) Web Push only (defer email to P2)
- B) Web Push + Email (especially for iOS users)

**Decision**: ✅ **A** (Web Push only for MVP)

**Rationale**: Simplifies initial implementation. Email fallback remains P2 priority for iOS users.

**Impact**: No email provider setup needed initially. Focus on Web Push reliability.

---

#### Q3: Data Store 🔴
**Question**: SQLite (local/file-based) or PostgreSQL (Supabase/Vercel Postgres)?

**Options**:
- A) SQLite for dev, PostgreSQL for prod (Prisma supports both)
- B) PostgreSQL everywhere (including local Docker)

**Decision**: ✅ **A** (SQLite dev, PostgreSQL prod)

**Rationale**: Faster local dev setup, no Docker required. Prisma handles DB abstraction seamlessly.

**Impact**: Use `file:./dev.db` locally, migrate to PostgreSQL (Vercel Postgres) for production.

---

#### Q4: Wake Time Input 🟢
**Question**: Should actual wake time be manual input only, or integrate with external devices (smartwatch, etc.)?

**Options**:
- A) Manual input only (MVP)
- B) Add wearable integration (Apple Health, Google Fit)

**Decision**: ✅ **A** (manual input for MVP; B is Nice-to-Have P3)

**Rationale**: External integration adds complexity; validate core loop first.

**Impact**: Simple time picker input on checklist page.

---

#### Q5: Dark Mode 🟢
**Question**: Include dark/light theme toggle in initial Must-have, or defer to Should?

**Options**:
- A) Must-have (implement in Phase 1)
- B) Should (implement in Phase 5 or post-MVP)

**Decision**: ✅ **B** (defer to post-MVP)

**Rationale**: Core habit tracking flow is priority. Dark mode is polish feature.

**Impact**: Use system preference detection initially, add toggle post-MVP.

---

## Change Log

### 2025-10-19 (v1.0.0-alpha) - MVP IMPLEMENTATION COMPLETE
**Planning & Setup (v0.1.0)**
- **Initial creation** of CLAUDE.md
- Defined MVP requirements (Must/Should/Nice)
- Established architecture (Next.js 14, Prisma, Auth.js)
- Drafted data model (User, Goal, DailyLog, NotificationSubscription, WeeklySummary)
- Created LLM prompt template for habit stack generation
- Outlined notification strategy (Web Push + cron)
- Set up implementation checklist (5 phases)
- Defined performance targets (Lighthouse ≥90, P95 <200ms)
- Documented 5 open questions (Q1-Q5)
- **Resolved all open questions**:
  - Q1: Japanese only for MVP ✅
  - Q2: Web Push only (email P2) ✅
  - Q3: SQLite dev / PostgreSQL prod ✅
  - Q4: Manual wake time input ✅
  - Q5: Dark mode deferred to post-MVP ✅
- Created project foundation:
  - Monorepo structure (Turborepo + pnpm)
  - PR template with mandatory CLAUDE.md update
  - Pre-commit hook enforcement
  - Documentation (README, CONTRIBUTING, CHANGELOG)

**Implementation (v1.0.0-alpha)**
- ✅ **Phase 0 Complete**: Prisma schema, Auth.js setup, Next.js app structure
- ✅ **Phase 1 Complete**: Goal creation page, LLM habit stack API, Dashboard
  - Implemented `/goal/new` with AI generation via Anthropic Claude
  - Created `/api/habit-stack` endpoint with prompt templates
  - Built dashboard with streak/completion rate display
- ✅ **Phase 2 Complete**: Daily checklist, Streak calculation, Analytics
  - Implemented `/checklist` with step tracking and wake time input
  - Created `packages/core/streak.ts` with timezone-aware logic
  - Created `packages/core/analytics.ts` for weekly metrics
- ✅ **Phase 4 Complete**: Weekly reflection with LLM insights
  - Implemented `/api/reflection` with Claude-powered analysis
  - Created `/reflection` page with insights and suggestions
  - Automatic summary generation with data persistence
- ⚠️ **Phase 3 Partial**: PWA manifest + basic service worker (full push notifications deferred)

**Files Created** (70+ files):
- Core: `prisma/schema.prisma`, `packages/core/src/{streak,analytics,llm/*}.ts`
- Frontend: `apps/web/app/{(dashboard),(auth),goal,checklist,reflection}/**`
- API: `apps/web/app/api/{auth,goal,habit-stack,checklist,reflection}/**`
- Config: `turbo.json`, `tailwind.config.ts`, `tsconfig.json` (×3)
- Documentation: `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `.github/PULL_REQUEST_TEMPLATE.md`

**Development Setup (Ready to Run)** ✅
- ✅ pnpm installed and configured (`pnpm-workspace.yaml`)
- ✅ All dependencies installed (`pnpm install`)
- ✅ Prisma Client generated
- ✅ SQLite database initialized (`dev.db`)
- ✅ Environment variables configured (`.env`)
- ✅ Git repository initialized & committed
- ✅ Quick start scripts created:
  - `START.bat` - Start development server
  - `CHECK.bat` - Verify setup
  - `SETUP.bat` - Re-run setup if needed
- ✅ Deployment scripts created:
  - `deploy-github.bat` - GitHub repository creation & push
  - `deploy-vercel.bat` - Vercel deployment automation
- ✅ Documentation:
  - `QUICKSTART.md` - Local development guide
  - `DEPLOY.md` - Deployment guide (GitHub & Vercel)

**Deployment Configuration** 📦
- Platform: Vercel (recommended) or self-hosted
- Database: Vercel Postgres or Supabase (production)
- Required Environment Variables:
  - `DATABASE_URL` - PostgreSQL connection string
  - `ANTHROPIC_API_KEY` - Claude API key
  - `NEXTAUTH_URL` - Production URL
  - `NEXTAUTH_SECRET` - Random secret (32+ characters)
  - `EMAIL_SERVER_*` - Email provider credentials (optional)
- Build Command: `pnpm run build` (auto-detected by Vercel)
- Output Directory: `apps/web/.next` (auto-detected)
- Install Command: `pnpm install` (auto-detected)

---

## Risk Register

### R1: iOS Web Push Limitations 🟡
**Risk**: Web Push notifications may not work reliably on iOS.

**Mitigation**:
- Prioritize email fallback (P2)
- Detect iOS and prompt for email during onboarding
- Consider Progressive Web App (PWA) "Add to Home Screen" guidance

**Status**: Accepted (email fallback in Phase 3)

---

### R2: LLM API Rate Limits / Cost 🟢
**Risk**: Excessive LLM API calls could hit rate limits or incur high costs.

**Mitigation**:
- Cache generated habit stacks (only regenerate on explicit user request)
- Set monthly budget alerts
- Implement rate limiting (e.g., max 1 generation per user per hour)

**Status**: Monitored (track usage in Phase 1)

---

### R3: Timezone Handling Complexity 🟡
**Risk**: Users in different timezones may receive notifications at wrong times.

**Mitigation**:
- Store user timezone in DB (auto-detect from browser)
- Use `date-fns-tz` or `luxon` for timezone-aware calculations
- Unit test with multiple timezone scenarios

**Status**: Mitigated (include timezone in data model)

---

### R4: Streak Calculation Edge Cases 🟡
**Risk**: Bugs in streak logic (e.g., DST transitions, leap seconds, missed days).

**Mitigation**:
- Write comprehensive unit tests (packages/core/streak.test.ts)
- Use ISO date strings (YYYY-MM-DD) for date comparisons
- Handle edge cases: user skips a day, changes timezone, edits past logs

**Status**: Mitigated (TDD approach in Phase 2)

---

### R5: GDPR Compliance 🔴
**Risk**: Violating GDPR if user data is mishandled or PII sent to LLM.

**Mitigation**:
- **Privacy policy** and **Terms of Service** before public launch
- **PII anonymization** in LLM prompts (no email/name/IP)
- **Data export/deletion** endpoints (`/api/user/export`, `/api/user/delete`)
- **Consent banners** for cookies/analytics

**Status**: Blocked (must complete before public release; OK for private alpha)

---

## Appendix

### A. References
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

### B. Glossary
- **Habit Stack**: A sequence of small actions performed consecutively (concept from James Clear's *Atomic Habits*)
- **Streak**: Number of consecutive days a goal is successfully completed
- **P95**: 95th percentile (e.g., P95 latency = 95% of requests are faster than this)
- **SoT**: Single Source of Truth
- **PII**: Personally Identifiable Information
- **ADR**: Architecture Decision Record

---

**END OF DOCUMENT**

_This document is maintained by the development team and updated with every PR that modifies `src/`. For questions or clarifications, refer to open issues or contact the project owner._
