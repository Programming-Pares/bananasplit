# BananaSplit

![Screenshot](/assets/initial_ui.png)

BananaSplit is a local-first web app for splitting group expenses, tracking balances, and recording settlements.

## Why This Project

BananaSplit is designed for small groups (friends, roommates, trips) that need a fast way to:

- create groups and add members
- split expenses fairly
- track who owes whom
- record settlements
- review recent activity and notifications

## Features

- Dashboard overview with net balance and group summaries
- Group lifecycle: create groups, add members, mark groups active/done
- Expense details and split breakdowns
- Settlements between members
- Activity feed and notification read state
- Search across app data
- Profile and settings (currency, account state)
- Recurring expenses support
- Local persistence using IndexedDB (Dexie)

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
├── README.md                 # repository-level documentation (this file)
├── assets/                   # shared repo assets (screenshots, diagrams, branding)
└── app/                      # React application
	├── src/
	│   ├── app/              # providers + router
	│   ├── components/       # shared UI components
	│   ├── features/         # feature modules and pages
	│   └── lib/              # db, queries, repository, mock data
	└── package.json
```

## Getting Started

### 1) Install dependencies

```bash
cd app
npm install
```

### 2) Run development server

```bash
npm run dev
```

### 3) Build for production

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - type-check and build production bundle
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Data and Persistence

- App data is stored in IndexedDB via Dexie (`banana-split` database)
- The project includes mock repository logic in [app/src/lib/repositories/mock-app-repository.ts](app/src/lib/repositories/mock-app-repository.ts)
- Schema and tables are defined in [app/src/lib/db/app-db.ts](app/src/lib/db/app-db.ts)
