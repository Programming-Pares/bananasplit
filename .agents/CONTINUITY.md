# Continuity

## Snapshot
- 2026-04-21 [USER] Goal: build `bananasplit` as an offline-first expense-sharing app inspired by Splitwise.
- 2026-04-21 [USER] Current priority: focus on `app/` first; backend comes later for auth and sync.
- 2026-04-21 [USER] Repository shape should stay simple: `app/`, `api/`, `landing/`.
- 2026-04-21 [USER] No shared-package monorepo setup wanted right now.
- 2026-04-21 [USER] Frontend stack direction: React + TypeScript + `shadcn/ui`.
- 2026-04-21 [USER] State/data direction: TanStack Query in app, but core functionality must work offline.
- 2026-04-21 [CODE] `.agents` instructions were partially copied from another project and are being normalized to this repo.
- 2026-04-21 [TOOL] `.agents/AGENTS.md` now points continuity operations to `.agents/CONTINUITY.md`.

## Done (recent)
- 2026-04-23 [CODE] Reworked group edit/delete UX to match the hardened expense flow: group edits now use a real form with dirty-state gating and inline mutation errors, and group deletion now requires typing the group name plus surfaces mutation failures inline.
- 2026-04-23 [CODE] Fixed a Dexie schema bug blocking expense edits: `activity.relatedId` is now indexed in DB version 6, matching the expense update/delete queries that look up activity rows by related entity id.
- 2026-04-23 [CODE] Rebuilt the expense details edit drawer into a dedicated form component with explicit submit handling, dirty-state gating, and inline mutation error display so failed expense edits are no longer silent.
- 2026-04-23 [CODE] Fixed expense details edit persistence: the details page now remounts on saved expense field changes so the drawer and detail view refresh from latest query data, and expense updates now validate current payer/participant membership before rewriting shares.
- 2026-04-22 [CODE] Added optional multi-budget support in `app/`: Dexie schema now has `budgets`, expenses can link an optional `budgetId`, group queries return budget summaries, and expense/group UI now exposes budget selection and management.
- 2026-04-22 [CODE] Implemented real group edit/delete flows: added `/groups/:groupId/edit`, wired group options menu actions, and soft-delete cascades now cover group budgets, expenses, memberships, recurring expenses, settlements, and timeline entries.
- 2026-04-22 [CODE] Fixed stale expense edit/delete behavior by returning `groupId` from expense mutations and invalidating both `['expense', expenseId]` and `['group', groupId]` queries after updates/deletes.
- 2026-04-22 [TOOL] `npm run lint` passed in `app/` after the budget and CRUD feature pass.
- 2026-04-22 [TOOL] `npm run build` passed in `app/` after the budget and CRUD feature pass; Vite still warns that the main JS chunk exceeds 500 kB.
- 2026-04-22 [CODE] Earlier same-day baseline: `app/src` was refactored for AGENTS compliance, kept under 300 LOC per code file, and session hooks were updated to preload `.agents/AGENTS.md` plus `.agents/CONTINUITY.md`.
- 2026-04-21 [CODE] Earlier baseline: scaffolded the mobile-first React/Vite/TanStack Query app structure and MVP route set under `app/`.

## Decisions
- 2026-04-21 [CODE] D001 ACTIVE: keep one repository with separate `app/`, `api/`, and `landing/` projects instead of shared-package monorepo.
- 2026-04-21 [CODE] D002 ACTIVE: build `app/` offline-first with local persistence as source of truth; backend sync/auth later.
- 2026-04-21 [CODE] D003 ACTIVE: frontend stack direction is React + Vite + TypeScript + Tailwind + `shadcn/ui` + TanStack Query.
- 2026-04-21 [CODE] D004 ACTIVE: use mock repository/query layer now so UI routes are ready before real local database is selected.
- 2026-04-22 [CODE] D005 ACTIVE: rely on repo-local Codex `SessionStart` hooks to preload `.agents/AGENTS.md` and `.agents/CONTINUITY.md` for new sessions.

## Now
- 2026-04-23 [USER] User asked to re-check expense edit persistence because saving from expense details still appeared not to change the record.

## Next
- 2026-04-23 [USER] TODO: verify and repair group edit/delete behavior end-to-end.
- 2026-04-23 [ASSUMPTION] Next likely step is runtime hardening of destructive flows: add visible error surfacing for budget/group mutations and consider code-splitting to reduce the large JS bundle warning.

## Open Questions
- 2026-04-21 [UNCONFIRMED] Exact local database choice for offline-first app still not locked.
- 2026-04-21 [UNCONFIRMED] Exact sync strategy and backend API shape are deferred.

## Working Set
- `.agents/AGENTS.md`
- `.agents/CONTINUITY.md`
- `app/src/app/router/index.tsx`
- `app/src/components/budget/*`
- `app/src/features/quick-actions/components/quick-action-sheet*`
- `app/src/features/groups/*`
- `app/src/features/expenses/*`
- `app/src/lib/db/app-db.ts`
- `app/src/lib/queries/use-app-mutations.ts`
- `app/src/lib/repositories/mock-app-repository.ts`
