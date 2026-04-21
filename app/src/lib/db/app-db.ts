import Dexie, { type Table } from 'dexie'

export type SyncStatus = 'local' | 'synced' | 'failed'
export type ActivityType = 'expense' | 'settlement' | 'system'
export type MemberSource = 'manual' | 'invite' | 'system'
export type InviteStatus = 'accepted' | 'pending'
export type AuthProvider = 'local' | 'google'
export type RecurringFrequency = 'weekly' | 'monthly'

export type GroupRecord = {
  createdAt: number
  deletedAt: number | null
  description: string
  id: string
  isActive: boolean
  isDone: boolean
  name: string
  syncStatus: SyncStatus
  updatedAt: number
}

export type MemberRecord = {
  createdAt: number
  deletedAt: number | null
  email: string | null
  id: string
  name: string
  source: MemberSource
  syncStatus: SyncStatus
  updatedAt: number
}

export type GroupMemberRecord = {
  createdAt: number
  deletedAt: number | null
  groupId: string
  id: string
  inviteStatus: InviteStatus
  joinedAt: number
  memberId: string
  syncStatus: SyncStatus
  updatedAt: number
}

export type ExpenseRecord = {
  amountCents: number
  createdAt: number
  deletedAt: number | null
  groupId: string
  id: string
  note: string | null
  paidByMemberId: string
  syncStatus: SyncStatus
  title: string
  updatedAt: number
}

export type ExpenseShareRecord = {
  adjustmentCents: number
  createdAt: number
  expenseId: string
  id: string
  memberId: string
  shareCents: number
  updatedAt: number
}

export type SettlementRecord = {
  amountCents: number
  createdAt: number
  deletedAt: number | null
  groupId: string
  id: string
  note: string | null
  paidByMemberId: string
  receivedByMemberId: string
  syncStatus: SyncStatus
  updatedAt: number
}

export type ActivityRecord = {
  amountCents: number | null
  createdAt: number
  groupId: string
  id: string
  message: string
  readAt: number | null
  relatedId: string
  type: ActivityType
}

export type RecurringExpenseRecord = {
  amountCents: number
  createdAt: number
  deletedAt: number | null
  frequency: RecurringFrequency
  groupId: string
  id: string
  isPaused: boolean
  paidByMemberId: string
  participantMemberIdsJson: string
  title: string
  updatedAt: number
}

export type AppSettingsRecord = {
  accountEmail: string | null
  authProvider: AuthProvider
  currency: string
  currentUserMemberId: string
  deviceId: string
  id: 'settings'
  isSignedIn: boolean
  lastSyncCursor: string | null
  updatedAt: number
  userName: string
}

export type SyncOutboxRecord = {
  createdAt: number
  entityId: string
  entityType:
    | 'group'
    | 'member'
    | 'groupMember'
    | 'expense'
    | 'settlement'
    | 'settings'
  id: string
  operation: 'create' | 'update' | 'delete'
  payload: string
  retryCount: number
  status: 'pending' | 'failed' | 'sent'
}

export class BananaSplitDatabase extends Dexie {
  activity!: Table<ActivityRecord, string>
  expenseShares!: Table<ExpenseShareRecord, string>
  expenses!: Table<ExpenseRecord, string>
  groupMembers!: Table<GroupMemberRecord, string>
  groups!: Table<GroupRecord, string>
  members!: Table<MemberRecord, string>
  recurringExpenses!: Table<RecurringExpenseRecord, string>
  settings!: Table<AppSettingsRecord, 'settings'>
  settlements!: Table<SettlementRecord, string>
  syncOutbox!: Table<SyncOutboxRecord, string>

  constructor() {
    super('banana-split')

    this.version(1).stores({
      activity: 'id, groupId, createdAt, type',
      expenseShares: 'id, expenseId, memberId, [expenseId+memberId], createdAt',
      expenses: 'id, groupId, createdAt, updatedAt, deletedAt',
      groupMembers: 'id, groupId, memberId, inviteStatus, [groupId+memberId], deletedAt',
      groups: 'id, updatedAt, deletedAt',
      members: 'id, email, updatedAt, deletedAt',
      settings: 'id',
      settlements: 'id, groupId, createdAt, updatedAt, deletedAt',
      syncOutbox: 'id, status, createdAt, entityType, entityId',
    })

    this.version(2)
      .stores({
        activity: 'id, groupId, createdAt, type',
        expenseShares: 'id, expenseId, memberId, [expenseId+memberId], createdAt',
        expenses: 'id, groupId, createdAt, updatedAt, deletedAt',
        groupMembers: 'id, groupId, memberId, inviteStatus, [groupId+memberId], deletedAt',
        groups: 'id, updatedAt, deletedAt, isActive, isDone',
        members: 'id, email, updatedAt, deletedAt',
        settings: 'id',
        settlements: 'id, groupId, createdAt, updatedAt, deletedAt',
        syncOutbox: 'id, status, createdAt, entityType, entityId',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<GroupRecord, string>('groups')
          .toCollection()
          .modify((group) => {
            group.isActive = group.isActive ?? true
            group.isDone = group.isDone ?? false
          })
      })

    this.version(3)
      .stores({
        activity: 'id, groupId, createdAt, type, readAt',
        expenseShares: 'id, expenseId, memberId, [expenseId+memberId], createdAt',
        expenses: 'id, groupId, createdAt, updatedAt, deletedAt',
        groupMembers: 'id, groupId, memberId, inviteStatus, [groupId+memberId], deletedAt',
        groups: 'id, updatedAt, deletedAt, isActive, isDone',
        members: 'id, email, updatedAt, deletedAt',
        recurringExpenses: 'id, groupId, frequency, isPaused, deletedAt, updatedAt',
        settings: 'id',
        settlements: 'id, groupId, createdAt, updatedAt, deletedAt',
        syncOutbox: 'id, status, createdAt, entityType, entityId',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table<ActivityRecord, string>('activity')
          .toCollection()
          .modify((activity) => {
            activity.readAt = activity.readAt ?? null
          })
      })

    this.version(4).stores({
      activity: 'id, groupId, createdAt, type, readAt',
      expenseShares: 'id, expenseId, memberId, [expenseId+memberId], createdAt',
      expenses: 'id, groupId, createdAt, updatedAt, deletedAt',
      groupMembers: 'id, groupId, memberId, inviteStatus, [groupId+memberId], deletedAt',
      groups: 'id, updatedAt, deletedAt, isActive, isDone',
      members: 'id, email, updatedAt, deletedAt',
      recurringExpenses: 'id, groupId, frequency, isPaused, deletedAt, updatedAt',
      settings: 'id',
      settlements: 'id, groupId, createdAt, updatedAt, deletedAt',
      syncOutbox: 'id, status, createdAt, entityType, entityId',
    })
  }
}

export const appDb = new BananaSplitDatabase()
