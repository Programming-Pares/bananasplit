# Offline-First Strategy

This document describes the current local-first architecture implemented in the Bananasplit MVP and the sync contract the future backend should follow.

Use this file as the reference when building:
- the sync API
- the server-side persistence model
- conflict handling
- migration rules

The current frontend implementation is local-first and uses:
- `IndexedDB`
- `Dexie`
- `React Query` for reads/mutations/invalidation

The app UI now writes to the local database first for these flows:
- create group
- add member
- rename member
- remove member
- accept/resend/cancel invite
- add expense
- update expense
- delete expense
- create settlement
- create recurring expense template
- pause/resume recurring expense template
- create expense from recurring template
- update local profile
- update currency
- sign in / logout state in settings
- mark notifications read/unread

## Principles

### 1. Local database is the UI source of truth
All pages read from local IndexedDB through repository/query functions.

The UI does not depend on network availability to:
- show groups
- show balances
- show expenses
- show activity
- create new records

### 2. Server sync is replication, not primary interaction
When sync is added, the server should replicate and distribute local changes across devices.

The expected behavior is:
- write locally first
- enqueue change into outbox
- sync engine pushes local changes later
- sync engine pulls remote changes later
- local DB is reconciled

### 3. Sync should be operation-based
Do not sync whole application blobs.

Prefer record-level operations such as:
- group created
- member added
- expense created
- settlement created
- settings updated

This is simpler for:
- retries
- audit/history
- incremental pull
- conflict handling

## Current Local Database

Defined in:
- [app-db.ts](/C:/laragon/www/bananasplit/app/src/lib/db/app-db.ts)

Database name:
- `banana-split`

## Tables

### `settings`
Singleton application/session settings row.

Primary key:
- `id`

Current shape:
- `id: 'settings'`
- `userName: string`
- `currency: string`
- `currentUserMemberId: string`
- `deviceId: string`
- `authProvider: 'local' | 'google'`
- `accountEmail: string | null`
- `isSignedIn: boolean`
- `lastSyncCursor: string | null`
- `updatedAt: number`

Current usage:
- dashboard greeting
- current user POV for balances
- local profile page
- settings screen auth state
- future sync cursor/device identity

Initialization notes:
- the app no longer auto-seeds demo groups, expenses, settlements, or activity
- on first run, the client creates only the minimum bootstrap records needed to function:
  - one `settings` row
  - one local current-user `members` row

### `groups`
Logical group/workspace records.

Primary key:
- `id`

Indexes:
- `updatedAt`
- `deletedAt`

Current shape:
- `id: string`
- `name: string`
- `description: string`
- `isActive: boolean`
- `isDone: boolean`
- `createdAt: number`
- `updatedAt: number`
- `deletedAt: number | null`
- `syncStatus: 'local' | 'synced' | 'failed'`

Usage:
- `isActive` controls whether a group appears in global expense/settlement group selection
- `isDone` marks a group as completed and removes it from active dashboard-style flows

### `members`
Global member records. A member may exist in multiple groups.

Primary key:
- `id`

Indexes:
- `email`
- `updatedAt`
- `deletedAt`

Current shape:
- `id: string`
- `name: string`
- `email: string | null`
- `source: 'manual' | 'invite' | 'system'`
- `createdAt: number`
- `updatedAt: number`
- `deletedAt: number | null`
- `syncStatus: 'local' | 'synced' | 'failed'`

Notes:
- the current user is represented as a member record
- invited emails are also materialized as member records

### `groupMembers`
Membership join table between groups and members.

Primary key:
- `id`

Indexes:
- `groupId`
- `memberId`
- `inviteStatus`
- `[groupId+memberId]`
- `deletedAt`

Current shape:
- `id: string`
- `groupId: string`
- `memberId: string`
- `inviteStatus: 'accepted' | 'pending'`
- `joinedAt: number`
- `createdAt: number`
- `updatedAt: number`
- `deletedAt: number | null`
- `syncStatus: 'local' | 'synced' | 'failed'`

Usage:
- accepted rows drive visible group members
- pending rows drive invited email lists

### `expenses`
Top-level expense records.

Primary key:
- `id`

Indexes:
- `groupId`
- `createdAt`
- `updatedAt`
- `deletedAt`

Current shape:
- `id: string`
- `groupId: string`
- `title: string`
- `amountCents: number`
- `paidByMemberId: string`
- `note: string | null`
- `createdAt: number`
- `updatedAt: number`
- `deletedAt: number | null`
- `syncStatus: 'local' | 'synced' | 'failed'`

### `expenseShares`
Per-member share rows for an expense.

Primary key:
- `id`

Indexes:
- `expenseId`
- `memberId`
- `[expenseId+memberId]`
- `createdAt`

Current shape:
- `id: string`
- `expenseId: string`
- `memberId: string`
- `shareCents: number`
- `adjustmentCents: number`
- `createdAt: number`
- `updatedAt: number`

Usage:
- expense breakdown UI
- expense result UI
- group balance calculation

Current share logic:
- adjustments are treated as explicit additional share amounts
- remaining amount is split equally across selected members
- total shares sum to total expense amount when adjustments do not exceed amount

### `settlements`
Peer-to-peer payment records used mainly for logs and balance reduction.

Primary key:
- `id`

Indexes:
- `groupId`
- `createdAt`
- `updatedAt`
- `deletedAt`

Current shape:
- `id: string`
- `groupId: string`
- `paidByMemberId: string`
- `receivedByMemberId: string`
- `amountCents: number`
- `note: string | null`
- `createdAt: number`
- `updatedAt: number`
- `deletedAt: number | null`
- `syncStatus: 'local' | 'synced' | 'failed'`

### `activity`
Feed records shown in activity and notifications.

Primary key:
- `id`

Indexes:
- `groupId`
- `createdAt`
- `type`

Current shape:
- `id: string`
- `groupId: string`
- `relatedId: string`
- `type: 'expense' | 'settlement' | 'system'`
- `amountCents: number | null`
- `message: string`
- `readAt: number | null`
- `createdAt: number`

Notes:
- this is append-only in the current MVP
- create group and add member do not currently write feed entries
- read state is local-device state for notifications UI
- `system` activity now powers group-level audit timeline entries such as:
  - group created
  - member added/renamed/removed
  - invite sent/accepted/resent
  - group active/done status changes
  - recurring expense template changes

### `recurringExpenses`
Reusable local templates for repeated group costs.

Primary key:
- `id`

Indexes:
- `groupId`
- `frequency`
- `isPaused`
- `deletedAt`
- `updatedAt`

Current shape:
- `id: string`
- `groupId: string`
- `title: string`
- `amountCents: number`
- `frequency: 'weekly' | 'monthly'`
- `paidByMemberId: string`
- `participantMemberIdsJson: string`
- `isPaused: boolean`
- `createdAt: number`
- `updatedAt: number`
- `deletedAt: number | null`

### `syncOutbox`
Queue of pending sync operations to send to the server later.

Primary key:
- `id`

Indexes:
- `status`
- `createdAt`
- `entityType`
- `entityId`

Current shape:
- `id: string`
- `entityType: 'group' | 'member' | 'groupMember' | 'expense' | 'settlement' | 'settings'`
- `entityId: string`
- `operation: 'create' | 'update' | 'delete'`
- `payload: string`
- `status: 'pending' | 'failed' | 'sent'`
- `retryCount: number`
- `createdAt: number`

Current status:
- records are enqueued on local writes
- no sync worker exists yet
- no retries or background processing exist yet

## Current Derived Reads

Implemented in:
- [mock-app-repository.ts](/C:/laragon/www/bananasplit/app/src/lib/repositories/mock-app-repository.ts)

Even though the filename still says `mock-app-repository`, it is now the local IndexedDB repository.

### Dashboard
Derived from:
- groups
- balances computed from expenses + settlements
- activity
- settings

Current dashboard outputs:
- net personal position
- total open balances
- attention count
- derived group cards
- recent activity

### Group details
Derived from:
- group
- accepted members
- pending invited emails
- expenses for the group
- computed balance lines

### Expense details
Derived from:
- expense
- expense shares
- members
- group

### Notifications / Activity
Derived from:
- activity
- group names

## Balance Computation

Current group balance computation is pairwise and local.

Algorithm:
1. For each expense:
   - every participant except the payer creates debt toward the payer equal to `shareCents`
2. For each settlement:
   - reduce debt by applying a reverse value between payer and receiver
3. Simplify pairwise:
   - for every unordered member pair, compute net amount
   - if net is zero, omit
   - if positive, one side owes the other
4. Hide zero balances in the UI

This is what powers:
- group balance summary
- group card debt summaries
- dashboard overall owed/owes numbers

## Current Functional Flows

### Create group
Screen:
- [create-group-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups/pages/create-group-page.tsx)

Behavior:
- creates a `groups` row
- initializes `isActive: true`
- initializes `isDone: false`
- auto-adds current user into `groupMembers` as accepted
- appends outbox entries for group and membership
- navigates to the new group page

### Group active state
Screen:
- [group-details-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups/pages/group-details-page.tsx)

Behavior:
- toggles `groups.isActive`
- appends outbox update for the `group`
- active groups are selectable in global expense/settlement forms

### Group done state
Screen:
- [group-details-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups/pages/group-details-page.tsx)

Behavior:
- updates `groups.isDone`
- marking done also forces `groups.isActive = false`
- appends outbox update for the `group`
- done groups are excluded from the active dashboard flow and global money-action selection

### Add member
Screen:
- [add-member-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups/pages/add-member-page.tsx)

Manual member:
- creates `members` row if needed
- creates accepted `groupMembers` row
- appends outbox entries

Invite by email:
- creates/reuses `members` row with email
- creates pending `groupMembers` row
- appends outbox entries

Member management:
- current members can be renamed or removed from the group
- pending invites can be accepted, resent, or canceled
- these actions also append `system` activity rows for group timeline

### Add expense
UI:
- [quick-action-sheet.tsx](/C:/laragon/www/bananasplit/app/src/features/quick-actions/components/quick-action-sheet.tsx)

Behavior:
- amount-first flow
- persists `expenses`
- persists `expenseShares`
- appends activity row
- appends outbox row

### Update expense
Screen:
- [expense-details-page.tsx](/C:/laragon/www/bananasplit/app/src/features/expenses/pages/expense-details-page.tsx)

Behavior:
- updates `expenses`
- replaces related `expenseShares`
- updates the related `activity` message/amount row
- appends outbox update for `expense`

### Delete expense
Screen:
- [expense-details-page.tsx](/C:/laragon/www/bananasplit/app/src/features/expenses/pages/expense-details-page.tsx)

Behavior:
- soft-deletes the `expenses` row via `deletedAt`
- removes related `activity` rows from local feed/notifications
- appends outbox delete for `expense`

### Settle up
UI:
- [quick-action-sheet.tsx](/C:/laragon/www/bananasplit/app/src/features/quick-actions/components/quick-action-sheet.tsx)

Behavior:
- amount-first flow
- persists `settlements`
- appends activity row
- appends outbox row

### Recurring expenses
Screen:
- [group-details-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups/pages/group-details-page.tsx)

Behavior:
- creates `recurringExpenses` templates per group
- stores frequency, payer, participants, and amount locally
- supports pause/resume state
- supports `Create now`, which materializes a normal `expenses` row from the template
- appends `system` activity rows for recurring template changes

### Notifications read state
Screen:
- [notifications-page.tsx](/C:/laragon/www/bananasplit/app/src/features/notifications/pages/notifications-page.tsx)

Behavior:
- toggles `activity.readAt` per notification
- supports mark-all-read by setting `readAt` on all activity rows
- read/unread state is currently local to the device and not added to sync outbox

### Search / filters / completed groups
Screens:
- [search-page.tsx](/C:/laragon/www/bananasplit/app/src/features/search/pages/search-page.tsx)
- [groups-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups-list/pages/groups-page.tsx)
- [activity-page.tsx](/C:/laragon/www/bananasplit/app/src/features/activity/pages/activity-page.tsx)
- [notifications-page.tsx](/C:/laragon/www/bananasplit/app/src/features/notifications/pages/notifications-page.tsx)

Behavior:
- global search is fully local and queries groups, expenses, members, and activity
- completed/done groups are still stored locally and shown in filtered group views
- filters/sort are UI-level derivations over local query results

### Group details derived sections
Screen:
- [group-details-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups/pages/group-details-page.tsx)

Derived local sections now include:
- member balance summary cards
- settle-up suggestions derived from current pairwise balances
- group timeline from `activity`
- recurring expense templates from `recurringExpenses`

### Settings auth state
Screen:
- [settings-page.tsx](/C:/laragon/www/bananasplit/app/src/features/settings/pages/settings-page.tsx)

Behavior:
- updates `settings`
- enqueues outbox update

Current auth is local UI/auth-state only, not real OAuth.

### Settings currency
Screen:
- [settings-page.tsx](/C:/laragon/www/bananasplit/app/src/features/settings/pages/settings-page.tsx)

Behavior:
- updates `settings.currency`
- enqueues outbox update for `settings`
- currently the only selectable currency in the MVP is `PHP`

### Local profile
Screen:
- [profile-page.tsx](/C:/laragon/www/bananasplit/app/src/features/settings/pages/profile-page.tsx)

Behavior:
- local profile mode updates `settings.userName`
- local profile mode may update `settings.accountEmail`
- local profile mode also updates the current user row in `members`
- Google-linked mode is shown as connected-account UI instead of the editable local form

### Reset local data
Screen:
- [settings-page.tsx](/C:/laragon/www/bananasplit/app/src/features/settings/pages/settings-page.tsx)

Behavior:
- clears all local application tables:
  - `activity`
  - `expenseShares`
  - `expenses`
  - `groupMembers`
  - `groups`
  - `members`
  - `settings`
  - `settlements`
  - `syncOutbox`
- immediately recreates only the minimum bootstrap records via local initialization
- does not enqueue a sync outbox event

## Sync Architecture Recommendation

### Local write path
For every mutating action:
1. validate input
2. write local records in a Dexie transaction
3. write matching outbox records in the same transaction
4. invalidate local queries
5. UI updates from local DB only

This is already how the current MVP writes data.

### Future push API
Recommended endpoint:
- `POST /sync/push`

Payload shape:
```json
{
  "deviceId": "string",
  "userId": "string",
  "operations": [
    {
      "id": "outbox-id",
      "entityType": "expense",
      "entityId": "expense-id",
      "operation": "create",
      "createdAt": 1710000000000,
      "payload": { "..." : "..." }
    }
  ]
}
```

Server behavior:
- accept operations idempotently
- persist canonical records
- append change log entries
- return accepted operation ids and next sync cursor

### Future pull API
Recommended endpoint:
- `GET /sync/pull?cursor=...`

Response shape:
```json
{
  "cursor": "next-cursor",
  "changes": [
    {
      "entityType": "expense",
      "entityId": "expense-id",
      "operation": "create",
      "updatedAt": 1710000000000,
      "payload": { "..." : "..." }
    }
  ]
}
```

Client behavior:
- read `settings.lastSyncCursor`
- pull incremental changes
- apply them into local tables
- update `lastSyncCursor`

## Conflict Strategy

For MVP and early sync rollout:
- prefer create-heavy flows
- avoid multi-device editing of the same record where possible
- treat expenses and settlements as append-first records

Recommended rules:
- `create` is idempotent by record id
- `delete` should be soft-delete
- `update` should include `updatedAt` and server-side last-write metadata

Best initial approach:
- last-write-wins for simple scalar updates
- append-only for activity
- immutable expense/share rows after creation until edit/delete flows are explicitly designed

## Recommended Backend Tables

The backend can mirror the client model closely:
- `users`
- `devices`
- `groups`
- `members`
- `group_members`
- `expenses`
- `expense_shares`
- `settlements`
- `activity`
- `sync_changes`

Suggested extra server-only tables:
- `group_invites`
- `sync_checkpoints`
- `failed_operations`

## Migration Guidance

When local schema changes:
1. update `app-db.ts`
2. update repository derivations
3. update this document
4. add Dexie version migration
5. define how old outbox payloads are interpreted

## Current Gaps

Not yet implemented:
- background sync worker
- server sync transport
- real auth
- export/import
- delete/edit flows for expenses and settlements
- conflict UI
- remote invite delivery

## Source Files

Primary implementation files:
- [app-db.ts](/C:/laragon/www/bananasplit/app/src/lib/db/app-db.ts)
- [mock-app-repository.ts](/C:/laragon/www/bananasplit/app/src/lib/repositories/mock-app-repository.ts)
- [use-app-queries.ts](/C:/laragon/www/bananasplit/app/src/lib/queries/use-app-queries.ts)

Primary UI entry points using local writes:
- [create-group-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups/pages/create-group-page.tsx)
- [add-member-page.tsx](/C:/laragon/www/bananasplit/app/src/features/groups/pages/add-member-page.tsx)
- [quick-action-sheet.tsx](/C:/laragon/www/bananasplit/app/src/features/quick-actions/components/quick-action-sheet.tsx)
- [settings-page.tsx](/C:/laragon/www/bananasplit/app/src/features/settings/pages/settings-page.tsx)
