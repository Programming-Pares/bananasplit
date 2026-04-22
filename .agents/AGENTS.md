## TODO: Force agent to use this AGENTS.md

## Repo Context

- Repository shape: `app/`, `api/`, `landing/`
- Current primary target: `app/`
- Product direction: offline-first expense-sharing app
- Backend is deferred for later auth and sync support

## Important rules

- Build modular first. No code files longer than 300 lines of code! Documentation, plans etc. can be as long as needed, but code files must be modular.
- Think ahead! Do not write code that you know will need to be changed later without planning for that change now. So keep entrypoints stable and isolate logic into smaller modules from the start!
- Do not limit yourself due to the LOC limit! If a task requires more code, split it into multiple files/modules/functions.
- When splitting a large UI/module into multiple related components, do not leave too many sibling files in one flat directory. If the split produces several related files, group them into a dedicated folder named after the feature/template/component family and keep a clear entry file so the structure stays easy to scan.
- Do not add default fallbacks during development phase. If something fails, let it fail so it can be fixed properly.
- Do not leave empty `try/catch` blocks anywhere.
- Do not reinvent the wheel! Use open source, self-hosted libraries when needed. Ask the user, and help them qualify their selection.
- Design UI for the end-user, not for the schema!

## Responsive UI rules

- BananaSplit is mobile-first. Optimize for smartphones first, especially smaller and larger phones, not desktop-first responsive layouts.
- Treat typography, spacing, and line-height as one system. Do not change font size alone without checking wrap, vertical rhythm, and surrounding spacing.
- Use available width well on phones. Do not force narrow text columns unless the composition explicitly needs a stacked headline.
- For wrapped headings, fix the composition with line-height first. Avoid:
  - overly airy multi-line headings
  - unnaturally crushed poster-style stacking
- Prefer mobile-first text sizing with modest `sm:` increases only where larger phones genuinely benefit.
- Body text, helper text, and card copy should remain compact and readable on small phones. Prefer controlled line-height over loose vertical spacing.
- Reduce padding and inter-section gaps on smaller phones when the screen starts feeling tall or wasteful.
- Shared surfaces must be responsive by default:
  - page headers
  - cards
  - drawers
  - forms
  - chips / pills / segmented filters
  - keypad / calculator-style inputs
- If chip rows or filters become cramped on small devices, use a mobile-specific alternative like a drawer picker instead of letting controls clip or hide.
- Dense task screens should feel efficient. Promo and empty states can breathe more, but they still must respect first-screen space on phones.
- Always check responsive polish in terms of:
  - heading wrap behavior
  - line-height on broken lines
  - first-screen content density
  - card padding
  - drawer height pressure
  - chip/button readability
  - visual balance between sections
- When a UI issue is systemic, fix shared components first instead of patching each page separately.

## Continuity Ledger (compaction-safe)

Maintain a single continuity file for this workspace: `.agents/CONTINUITY.md`.
`.agents/CONTINUITY.md` is the canonical briefing designed to survive compaction; do not rely on earlier chat/tool output unless it's reflected there.

### Operating rule

- At the start of each assistant turn: read `.agents/CONTINUITY.md` before acting.
- Update `.agents/CONTINUITY.md` only when there is a meaningful delta in: Goal/success criteria, Invariants/constraints, Decisions, State (Done/Now/Next), Open questions, Working set, or important tool outcomes.

### Keep it bounded (anti-bloat)

- Keep `.agents/CONTINUITY.md` short and high-signal:
  - `Snapshot`: <= 25 lines.
  - `Done (recent)`: <= 7 bullets.
  - `Working set`: <= 12 paths.
  - `Receipts`: keep last 10-20 entries.
- If sections exceed caps, compress older items into milestone bullets with pointers (commit/PR/log path/doc path). Do not paste raw logs.

### Anti-drift rules

- Facts only, no transcripts.
- Every entry must include:
  - a date or ISO timestamp (e.g., `2026-01-13` or `2026-01-13T09:42Z`)
  - a provenance tag: `[USER]`, `[CODE]`, `[TOOL]`, `[ASSUMPTION]`
- If unknown, write `UNCONFIRMED` (never guess). If something changes, supersede it explicitly (don't silently rewrite history).

### Decisions and incidents

- Record durable choices in `Decisions` as ADR-lite entries (e.g., `D001 ACTIVE: ...`).
- For recurring weirdness, create a small, stable incident capsule (Symptoms / Evidence pointers / Mitigation / Status).

### Plan tool vs ledger

- Use `update_plan` for short-term execution scaffolding (3-7 steps).
- Use `.agents/CONTINUITY.md` for long-running continuity ("what/why/current state"), not micro task lists.
- Keep them consistent at the intent/progress level.

### In replies

- Keep continuity awareness in replies, but do not force a ledger dump for simple conversational turns.
- Print the full ledger only when it materially changed or the user requests it.

## Continuity Index

- `.agents/continuity/architecture.md`
- `.agents/continuity/invariants.md`
- `.agents/continuity/pitfalls.md`
- `.agents/continuity/decisions.md`
- `.agents/continuity/workflow.md`
