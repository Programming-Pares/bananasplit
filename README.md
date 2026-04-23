# BananaSplit

![Screenshot](/assets/initial_ui.png)

BananaSplit is an offline-first web app for splitting group expenses, managing shared budgets, tracking balances, and recording settlements.

## Why This Project

BananaSplit is designed for small groups such as friends, roommates, and trips that need a fast way to:

- create groups and add members
- set shared budgets per group
- split expenses fairly
- track who owes whom
- record settlements
- review recent activity and notifications

## Features

- Dashboard overview with net balance and group summaries
- Group lifecycle: create, edit, soft-delete, add members, mark active/done
- Group budgets: add, edit, delete, and assign expenses to a budget
- Expense details and split breakdowns with editable payer, participants, and budget
- Settlements between members
- Activity feed and notification read state
- Search across app data
- Profile and settings for currency and account state
- Recurring expenses support
- Local persistence using IndexedDB (Dexie)

## Current Scope

- `app/` is the current primary project
- The app is built offline-first, with local browser storage as the current source of truth
- Backend sync/auth is deferred for a later phase
- Repository shape is intentionally simple: `app/`, `api/`, `landing/`

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Dexie (IndexedDB)
- Tailwind CSS 4
- Radix UI primitives + Vaul

## Project Structure

```text
.
|-- README.md                 # repository-level documentation
|-- assets/                   # shared repo assets
`-- app/                      # React application
    |-- src/
    |   |-- app/              # providers + router
    |   |-- components/       # shared UI components, including budget UI
    |   |-- features/         # feature modules and pages
    |   `-- lib/              # db, queries, repository, mock data
    `-- package.json
```

## Getting Started

### 1. Install dependencies

```bash
cd app
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build the production bundle
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## Data and Persistence

- App data is stored in IndexedDB via Dexie using the `banana-split` database
- Budgets are stored in the local `budgets` table
- Expenses can optionally carry a `budgetId`
- The project currently uses a mock repository/query layer over the local database
- Schema and tables are defined in [app/src/lib/db/app-db.ts](app/src/lib/db/app-db.ts)
- Repository entrypoints are exposed from [app/src/lib/repositories/mock-app-repository.ts](app/src/lib/repositories/mock-app-repository.ts)

## Budget Support

- Budgets are created and managed per group from the group details page
- Expenses can be linked to a budget during creation and editing
- Budget summaries are returned in the repository read layer and rendered in the group UI
- Main budget-related files:
- [app/src/components/budget/budget-selector.tsx](app/src/components/budget/budget-selector.tsx)
- [app/src/features/groups/pages/group-details-page/budgets-card.tsx](app/src/features/groups/pages/group-details-page/budgets-card.tsx)
- [app/src/features/groups/pages/group-details-page/budget-form-drawer.tsx](app/src/features/groups/pages/group-details-page/budget-form-drawer.tsx)
- [app/src/lib/repositories/mock-app-repository/budgets.ts](app/src/lib/repositories/mock-app-repository/budgets.ts)
- [app/src/lib/db/app-db.ts](app/src/lib/db/app-db.ts)
