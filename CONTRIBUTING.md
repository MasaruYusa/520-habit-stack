# Contributing to 5:20 Habit Stack

Thank you for your interest in contributing! This document outlines the guidelines and workflow for contributing to this project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [CLAUDE.md Update Policy](#claudemd-update-policy)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Code Style](#code-style)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something useful together.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18.0.0
- pnpm ≥ 8.0.0
- Git
- Basic knowledge of Next.js, TypeScript, and Prisma

### Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/520-habit-stack.git
cd 520-habit-stack

# Install dependencies
pnpm install

# Set up git hooks
pnpm run prepare

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Initialize database
pnpm run db:push

# Start development server
pnpm run dev
```

---

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `perf/` - Performance improvements

### 2. Follow Test-Driven Development (TDD)
1. Write failing tests first
2. Implement code to pass tests
3. Refactor if needed
4. Ensure all tests pass

```bash
# Run tests in watch mode
pnpm run test --watch
```

### 3. Make Incremental Commits
- Commit small, logical units of work
- Write clear commit messages (see [Commit Guidelines](#commit-guidelines))
- Test before each commit

### 4. Update CLAUDE.md (MANDATORY)
**If your PR modifies code in `apps/` or `packages/`**, you MUST update `CLAUDE.md` with:

1. **Description of changes** (in relevant section)
2. **Updated Change Log** (add entry with today's date)
3. **Risk Register** (if introducing new risks)
4. **Open Questions** (if new decisions are needed)
5. **Performance Metrics** (if affecting performance)

**Our pre-commit hook will enforce this automatically.**

---

## CLAUDE.md Update Policy

### Why CLAUDE.md?
`CLAUDE.md` is our **Single Source of Truth** for:
- Requirements and architecture
- Design decisions (ADRs)
- Data models
- LLM prompts
- Performance metrics
- Risk register
- Open questions
- Change history

### When to Update
- ✅ **Always**: When modifying `apps/*/src`, `packages/*/src`, or database schema
- ✅ **Often**: When adding new features, fixing bugs affecting architecture, or making performance changes
- ❌ **Not needed**: For documentation-only changes (README, comments) or test updates without implementation changes

### How to Update
1. Open `CLAUDE.md`
2. Find the relevant section (e.g., "Data Model", "LLM Integration", "Risk Register")
3. Add your changes with clear descriptions
4. Update **Change Log** section at the bottom:
   ```markdown
   ### 2025-10-20 (v0.x.x)
   - Added feature X to support use case Y
   - Updated data model: added `fieldName` to `TableName`
   - Resolved Q3 (decided on option B)
   ```
5. Stage the file: `git add CLAUDE.md`

---

## Commit Guidelines

### Format
```
<type>(<scope>): <short summary>

<optional detailed description>

<optional footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test additions/updates
- `chore`: Build process, dependencies, etc.

### Examples
```
feat(checklist): add snooze reason tag selection

Implemented multi-select tags for snooze reasons with
predefined options (sleep debt, stress, etc.).

Closes #42
```

```
fix(streak): correct timezone handling in streak calculation

Fixed bug where streak was broken across DST transitions.
Added unit tests for timezone edge cases.

Fixes #38
```

---

## Pull Request Process

### 1. Before Creating PR
- [ ] All tests pass locally (`pnpm run test`)
- [ ] E2E tests pass (`pnpm run test:e2e`)
- [ ] Linter passes (`pnpm run lint`)
- [ ] Type checks pass (`pnpm run typecheck`)
- [ ] **CLAUDE.md is updated** (if code changes in `src/`)
- [ ] Self-review completed

### 2. Create PR
- Use the PR template (auto-populated)
- Fill in all sections:
  - Description & motivation
  - **CLAUDE.md update** checkbox ✅
  - Testing section
  - Rollback plan
- Link related issues (`Closes #123`)

### 3. PR Review Checklist
Reviewers will check:
- [ ] CLAUDE.md updated appropriately
- [ ] Tests added/updated
- [ ] Code follows style guidelines
- [ ] No breaking changes (or documented if necessary)
- [ ] Performance impact acceptable (Lighthouse ≥ 90)
- [ ] Security considerations addressed

### 4. After Approval
- Squash merge to `main` (preferred)
- Delete feature branch
- Update related issues

---

## Testing Requirements

### Unit Tests
- Required for all business logic (`packages/core/*`)
- Required for complex UI components
- Minimum coverage: 80% (enforced by CI)

```bash
pnpm run test
```

### E2E Tests
- Required for critical user flows:
  - Goal creation → LLM proposal → Edit → Save
  - Daily checklist completion
  - Weekly reflection generation
- Use Playwright

```bash
pnpm run test:e2e
```

### Performance Tests
- Run Lighthouse before submitting PR if UI changes
- Target: ≥ 90 (mobile)

```bash
pnpm run lighthouse
```

---

## Code Style

### TypeScript
- Use strict mode
- Prefer interfaces over types (except for unions)
- Use meaningful variable names (no single letters except iterators)
- Add JSDoc comments for public APIs

### React
- Prefer Server Components (Next.js 14)
- Use Client Components only when needed (`'use client'`)
- Extract reusable components to `packages/ui`
- Use Tailwind CSS for styling

### File Naming
- Components: `PascalCase.tsx` (e.g., `HabitStackList.tsx`)
- Utilities: `camelCase.ts` (e.g., `calculateStreak.ts`)
- Tests: `*.test.ts` or `*.spec.ts`

### Imports
```typescript
// External dependencies
import { useState } from "react";
import { prisma } from "@acme/db";

// Internal dependencies
import { calculateStreak } from "@/lib/streak";
import { Button } from "@/components/ui/Button";

// Types
import type { Goal, DailyLog } from "@prisma/client";
```

---

## Questions?

- **Documentation**: See [CLAUDE.md](./CLAUDE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/520-habit-stack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/520-habit-stack/discussions)

---

**Thank you for contributing! 🚀**
