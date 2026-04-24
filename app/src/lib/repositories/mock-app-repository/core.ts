import {
  appDb,
  type AppSettingsRecord,
  type GroupMemberRecord,
  type MemberRecord,
  type RecurringFrequency,
  type SyncOutboxRecord,
} from '@/lib/db/app-db'

export function formatCurrencyFromCents(amountCents: number) {
  return `₱${new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)}`
}

export function formatShortDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'short',
  }).format(timestamp)
}

export function formatLongDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(timestamp)
}

export function buildOutboxRecord({
  entityId,
  entityType,
  operation,
  payload,
}: Omit<SyncOutboxRecord, 'createdAt' | 'id' | 'retryCount' | 'status'>): SyncOutboxRecord {
  return {
    createdAt: Date.now(),
    entityId,
    entityType,
    id: crypto.randomUUID(),
    operation,
    payload,
    retryCount: 0,
    status: 'pending',
  }
}

export function buildExpenseActivityMessage({
  paidByName,
  participantCount,
  title,
}: {
  paidByName: string
  participantCount: number
  title: string
}) {
  return `${title} added. ${paidByName} paid for ${participantCount} people.`
}

export function buildSettlementActivityMessage({
  amountCents,
  paidByName,
  receivedByName,
}: {
  amountCents: number
  paidByName: string
  receivedByName: string
}) {
  return `${paidByName} paid ${receivedByName} ${formatCurrencyFromCents(amountCents)}.`
}

export function formatRecurringFrequency(frequency: RecurringFrequency) {
  return frequency === 'weekly' ? 'Weekly' : 'Monthly'
}

export function buildSystemActivity({
  groupId,
  message,
  relatedId,
}: {
  groupId: string
  message: string
  relatedId: string
}) {
  return {
    amountCents: null,
    createdAt: Date.now(),
    groupId,
    id: crypto.randomUUID(),
    message,
    readAt: null,
    relatedId,
    type: 'system' as const,
  }
}

async function normalizeLegacyUserName(existingSettings: AppSettingsRecord) {
  const currentUser = await appDb.members.get(existingSettings.currentUserMemberId)
  const nextUpdatedAt = Date.now()

  await appDb.transaction('rw', [appDb.members, appDb.settings], async () => {
    await appDb.settings.put({
      ...existingSettings,
      updatedAt: nextUpdatedAt,
      userName: 'Guest',
    })

    if (currentUser && currentUser.name === 'You') {
      await appDb.members.put({
        ...currentUser,
        name: 'Guest',
        updatedAt: nextUpdatedAt,
      })
    }
  })

  return {
    ...existingSettings,
    updatedAt: nextUpdatedAt,
    userName: 'Guest',
  }
}

export async function ensureAppInitialized() {
  const existingSettings = await appDb.settings.get('settings')

  if (existingSettings) {
    if (existingSettings.userName === 'You') {
      return normalizeLegacyUserName(existingSettings)
    }

    return existingSettings
  }

  const now = Date.now()
  const currentUserMemberId = crypto.randomUUID()
  const localMember: MemberRecord = {
    createdAt: now,
    deletedAt: null,
    email: null,
    id: currentUserMemberId,
    name: 'Guest',
    source: 'system',
    syncStatus: 'local',
    updatedAt: now,
  }
  const settings: AppSettingsRecord = {
    accountEmail: null,
    authProvider: 'local',
    currency: 'PHP',
    currentUserMemberId,
    deviceId: crypto.randomUUID(),
    id: 'settings',
    isSignedIn: false,
    lastSyncCursor: null,
    updatedAt: now,
    userName: 'Guest',
  }

  await appDb.transaction('rw', [appDb.members, appDb.settings], async () => {
    const member = await appDb.members.get(currentUserMemberId)

    if (!member) {
      await appDb.members.add(localMember)
    }

    await appDb.settings.put(settings)
  })

  return settings
}

export async function getSettingsRecord() {
  return ensureAppInitialized()
}

export async function getCurrentUserContext() {
  const settings = await getSettingsRecord()

  return {
    currentUserMemberId: settings.currentUserMemberId,
    currentUserName: settings.userName,
  }
}

export async function getAcceptedGroupMembers(groupId: string) {
  const groupMembers = await appDb.groupMembers
    .where('groupId')
    .equals(groupId)
    .filter((item) => item.deletedAt === null && item.inviteStatus === 'accepted')
    .sortBy('joinedAt')
  const members = await appDb.members.bulkGet(groupMembers.map((item) => item.memberId))
  const presentMembers = members.filter((member): member is MemberRecord => Boolean(member))
  const memberMap = new Map(presentMembers.map((member) => [member.id, member]))

  return groupMembers
    .map((groupMember) => ({
      groupMember,
      member: memberMap.get(groupMember.memberId),
    }))
    .filter(
      (
        item,
      ): item is {
        groupMember: GroupMemberRecord
        member: MemberRecord
      } => Boolean(item.member),
    )
}

export async function getPendingInviteMembers(groupId: string) {
  const groupMembers = await appDb.groupMembers
    .where('groupId')
    .equals(groupId)
    .filter((item) => item.deletedAt === null && item.inviteStatus === 'pending')
    .sortBy('joinedAt')
  const members = await appDb.members.bulkGet(groupMembers.map((item) => item.memberId))
  const presentMembers = members.filter((member): member is MemberRecord => Boolean(member))
  const memberMap = new Map(presentMembers.map((member) => [member.id, member]))

  return groupMembers
    .map((groupMember) => ({
      groupMember,
      member: memberMap.get(groupMember.memberId),
    }))
    .filter(
      (
        item,
      ): item is {
        groupMember: GroupMemberRecord
        member: MemberRecord
      } => Boolean(item.member),
    )
}

export function getRequiredName(map: Map<string, string>, memberId: string, label: string) {
  const name = map.get(memberId)
  if (!name) {
    throw new Error(`${label} not found for member ${memberId}.`)
  }

  return name
}

export async function getDisplayMemberNameMap(groupId: string) {
  const [acceptedMembers, { currentUserMemberId }] = await Promise.all([
    getAcceptedGroupMembers(groupId),
    getCurrentUserContext(),
  ])

  return new Map(
    acceptedMembers.map(({ member }) => [
      member.id,
      member.id === currentUserMemberId ? 'You' : member.name,
    ]),
  )
}

export async function getGroupMemberNameMap(groupId: string) {
  const acceptedMembers = await getAcceptedGroupMembers(groupId)
  return new Map(acceptedMembers.map(({ member }) => [member.id, member.name]))
}
