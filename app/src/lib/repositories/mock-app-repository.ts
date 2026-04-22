import { appDb, type AppSettingsRecord, type AuthProvider, type ExpenseRecord, type ExpenseShareRecord, type GroupMemberRecord, type GroupRecord, type InviteStatus, type MemberRecord, type MemberSource, type RecurringExpenseRecord, type RecurringFrequency, type SettlementRecord, type SyncOutboxRecord } from '@/lib/db/app-db'

function formatCurrencyFromCents(amountCents: number) {
  return `₱${new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)}`
}

function formatShortDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'short',
  }).format(timestamp)
}

function formatLongDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-PH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(timestamp)
}

function buildOutboxRecord({
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

function buildExpenseActivityMessage({
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

function buildSettlementActivityMessage({
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

function formatRecurringFrequency(frequency: RecurringFrequency) {
  return frequency === 'weekly' ? 'Weekly' : 'Monthly'
}

function buildSystemActivity({
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

async function getSettingsRecord() {
  return ensureAppInitialized()
}

async function ensureAppInitialized() {
  const existingSettings = await appDb.settings.get('settings')

  if (existingSettings) {
    return existingSettings
  }

  const now = Date.now()
  const currentUserMemberId = crypto.randomUUID()
  const localMember: MemberRecord = {
    createdAt: now,
    deletedAt: null,
    email: null,
    id: currentUserMemberId,
    name: 'You',
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
    userName: 'You',
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

async function getAcceptedGroupMembers(groupId: string) {
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

async function getPendingInviteMembers(groupId: string) {
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

async function getGroupMemberNameMap(groupId: string) {
  const acceptedMembers = await getAcceptedGroupMembers(groupId)
  return new Map(acceptedMembers.map(({ member }) => [member.id, member.name]))
}

async function getGroupBalances(groupId: string) {
  const memberNameMap = await getGroupMemberNameMap(groupId)
  const memberIds = [...memberNameMap.keys()]
  const expenses = await appDb.expenses
    .where('groupId')
    .equals(groupId)
    .filter((item) => item.deletedAt === null)
    .sortBy('createdAt')
  const settlements = await appDb.settlements
    .where('groupId')
    .equals(groupId)
    .filter((item) => item.deletedAt === null)
    .sortBy('createdAt')

  const shareByExpenseId = new Map<string, ExpenseShareRecord[]>()
  const expenseIds = expenses.map((expense) => expense.id)
  const allShares = await appDb.expenseShares
    .where('expenseId')
    .anyOf(expenseIds)
    .toArray()

  for (const share of allShares) {
    const list = shareByExpenseId.get(share.expenseId) ?? []
    list.push(share)
    shareByExpenseId.set(share.expenseId, list)
  }

  const matrix = new Map<string, Map<string, number>>()

  const addDebt = (fromId: string, toId: string, amountCents: number) => {
    if (fromId === toId || amountCents === 0) {
      return
    }

    const row = matrix.get(fromId) ?? new Map<string, number>()
    row.set(toId, (row.get(toId) ?? 0) + amountCents)
    matrix.set(fromId, row)
  }

  for (const expense of expenses) {
    const expenseShares = shareByExpenseId.get(expense.id) ?? []
    for (const share of expenseShares) {
      if (share.memberId === expense.paidByMemberId || share.shareCents <= 0) {
        continue
      }

      addDebt(share.memberId, expense.paidByMemberId, share.shareCents)
    }
  }

  for (const settlement of settlements) {
    addDebt(settlement.paidByMemberId, settlement.receivedByMemberId, -settlement.amountCents)
  }

  const currentUserMemberId = (await getSettingsRecord())?.currentUserMemberId ?? 'member-you'
  const balances: Array<{
    amountCents: number
    fromId: string
    fromName: string
    involvesYou: boolean
    toId: string
    toName: string
  }> = []

  for (let index = 0; index < memberIds.length; index += 1) {
    const leftId = memberIds[index]

    for (let innerIndex = index + 1; innerIndex < memberIds.length; innerIndex += 1) {
      const rightId = memberIds[innerIndex]
      const leftToRight = matrix.get(leftId)?.get(rightId) ?? 0
      const rightToLeft = matrix.get(rightId)?.get(leftId) ?? 0
      const net = leftToRight - rightToLeft

      if (net === 0) {
        continue
      }

      if (net > 0) {
        balances.push({
          amountCents: net,
          fromId: leftId,
          fromName: memberNameMap.get(leftId) ?? leftId,
          involvesYou: leftId === currentUserMemberId || rightId === currentUserMemberId,
          toId: rightId,
          toName: memberNameMap.get(rightId) ?? rightId,
        })
      } else {
        balances.push({
          amountCents: Math.abs(net),
          fromId: rightId,
          fromName: memberNameMap.get(rightId) ?? rightId,
          involvesYou: leftId === currentUserMemberId || rightId === currentUserMemberId,
          toId: leftId,
          toName: memberNameMap.get(leftId) ?? leftId,
        })
      }
    }
  }

  return balances.sort((left, right) => {
    if (left.involvesYou !== right.involvesYou) {
      return Number(right.involvesYou) - Number(left.involvesYou)
    }

    return right.amountCents - left.amountCents
  })
}

async function getGroupMemberBalanceSummary(groupId: string) {
  const balances = await getGroupBalances(groupId)
  const acceptedMembers = await getAcceptedGroupMembers(groupId)

  return acceptedMembers.map(({ member }) => {
    const owesCents = balances
      .filter((item) => item.fromId === member.id)
      .reduce((sum, item) => sum + item.amountCents, 0)
    const owedCents = balances
      .filter((item) => item.toId === member.id)
      .reduce((sum, item) => sum + item.amountCents, 0)
    const directLines = balances
      .filter((item) => item.fromId === member.id || item.toId === member.id)
      .map((item) =>
        item.fromId === member.id
          ? `Owes ${item.toName} ${formatCurrencyFromCents(item.amountCents)}`
          : `Is owed ${formatCurrencyFromCents(item.amountCents)} by ${item.fromName}`,
      )

    return {
      directLines,
      id: member.id,
      name: member.name,
      netLabel: getUserNetLabel({ owedCents, owesCents }),
      owed: formatCurrencyFromCents(owedCents),
      owes: formatCurrencyFromCents(owesCents),
    }
  })
}

async function getAllActiveGroups() {
  return appDb.groups
    .filter((group) => group.deletedAt === null && group.isDone === false)
    .toArray()
}

async function getSelectableGroups() {
  return appDb.groups
    .filter((group) => group.deletedAt === null && group.isActive === true && group.isDone === false)
    .toArray()
}

async function getAllGroups() {
  return appDb.groups.filter((group) => group.deletedAt === null).toArray()
}

async function updateGroupRecord(groupId: string, updater: (group: GroupRecord) => GroupRecord) {
  const group = await appDb.groups.get(groupId)

  if (!group || group.deletedAt !== null) {
    throw new Error('Group not found.')
  }

  const nextGroup = updater(group)

  await appDb.transaction('rw', [appDb.groups, appDb.syncOutbox], async () => {
    await appDb.groups.put(nextGroup)
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: nextGroup.id,
        entityType: 'group',
        operation: 'update',
        payload: JSON.stringify(nextGroup),
      }),
    )
  })

  return nextGroup
}

function getUserNetLabel({
  owedCents,
  owesCents,
}: {
  owedCents: number
  owesCents: number
}) {
  if (owedCents === 0 && owesCents === 0) {
    return 'All settled'
  }

  if (owedCents >= owesCents) {
    return `You are owed ${formatCurrencyFromCents(owedCents - owesCents)}`
  }

  return `You owed ${formatCurrencyFromCents(owesCents - owedCents)}`
}

async function getGroupCardData(group: GroupRecord) {
  const balances = await getGroupBalances(group.id)
  const acceptedMembers = await getAcceptedGroupMembers(group.id)
  const currentUserMemberId = (await getSettingsRecord())?.currentUserMemberId ?? 'member-you'
  const owedCents = balances
    .filter((item) => item.toId === currentUserMemberId)
    .reduce((sum, item) => sum + item.amountCents, 0)
  const owesCents = balances
    .filter((item) => item.fromId === currentUserMemberId)
    .reduce((sum, item) => sum + item.amountCents, 0)
  const topBalance = balances[0]

  return {
    id: group.id,
    isActive: group.isActive,
    isDone: group.isDone,
    memberCount: acceptedMembers.length,
    name: group.name,
    netLabel: getUserNetLabel({ owedCents, owesCents }),
    openBalanceCount: balances.length,
    topBalance: topBalance
      ? `${topBalance.fromName} owed ${formatCurrencyFromCents(topBalance.amountCents)} to ${topBalance.toName}`
      : 'No open balances',
    trend: owedCents >= owesCents ? ('positive' as const) : ('negative' as const),
  }
}

async function getActivityWithGroupNames({
  includeSystem = false,
  limit,
}: {
  includeSystem?: boolean
  limit?: number
} = {}) {
  const activity = await appDb.activity.orderBy('createdAt').reverse().toArray()
  const filteredActivity = includeSystem
    ? activity
    : activity.filter((item) => item.type === 'expense' || item.type === 'settlement')
  const groups = await getAllGroups()
  const groupMap = new Map(groups.map((group) => [group.id, group.name]))
  const items = filteredActivity.map((item) => ({
    amount: item.amountCents === null ? 'No amount' : formatCurrencyFromCents(item.amountCents),
    groupId: item.groupId,
    groupName: groupMap.get(item.groupId) ?? 'Unknown group',
    id: item.id,
    isRead: item.readAt !== null,
    text: item.message,
    type: item.type,
    when: formatShortDate(item.createdAt),
  }))

  return typeof limit === 'number' ? items.slice(0, limit) : items
}

async function getUnreadNotificationCount() {
  return appDb.activity
    .filter((item) => item.readAt === null && (item.type === 'expense' || item.type === 'settlement'))
    .count()
}

function computeShares({
  adjustmentEntries,
  amountCents,
  memberIds,
}: {
  adjustmentEntries: Array<{ amountCents: number; memberId: string }>
  amountCents: number
  memberIds: string[]
}) {
  const uniqueMemberIds = [...new Set(memberIds)]
  const adjustmentMap = new Map<string, number>()

  for (const adjustment of adjustmentEntries) {
    if (!uniqueMemberIds.includes(adjustment.memberId) || adjustment.amountCents <= 0) {
      continue
    }

    adjustmentMap.set(
      adjustment.memberId,
      (adjustmentMap.get(adjustment.memberId) ?? 0) + adjustment.amountCents,
    )
  }

  const adjustmentTotal = [...adjustmentMap.values()].reduce((sum, value) => sum + value, 0)
  const distributableAmount = Math.max(amountCents - adjustmentTotal, 0)
  const baseShare = Math.floor(distributableAmount / uniqueMemberIds.length)
  const remainder = distributableAmount % uniqueMemberIds.length

  return uniqueMemberIds.map((memberId, index) => ({
    adjustmentCents: adjustmentMap.get(memberId) ?? 0,
    memberId,
    shareCents:
      baseShare + (index < remainder ? 1 : 0) + (adjustmentMap.get(memberId) ?? 0),
  }))
}

async function createExpenseActivity({
  amountCents,
  groupId,
  paidByName,
  participantCount,
  title,
}: {
  amountCents: number
  groupId: string
  paidByName: string
  participantCount: number
  title: string
}) {
  const expenseId = crypto.randomUUID()
  const createdAt = Date.now()

  return {
    activity: {
      amountCents,
      createdAt,
      groupId,
      id: crypto.randomUUID(),
      message: buildExpenseActivityMessage({
        paidByName,
        participantCount,
        title,
      }),
      readAt: null,
      relatedId: expenseId,
      type: 'expense' as const,
    },
    createdAt,
    expenseId,
  }
}

async function createSettlementActivity({
  amountCents,
  groupId,
  paidByName,
  receivedByName,
}: {
  amountCents: number
  groupId: string
  paidByName: string
  receivedByName: string
}) {
  const settlementId = crypto.randomUUID()
  const createdAt = Date.now()

  return {
    activity: {
      amountCents,
      createdAt,
      groupId,
      id: crypto.randomUUID(),
      message: buildSettlementActivityMessage({
        amountCents,
        paidByName,
        receivedByName,
      }),
      readAt: null,
      relatedId: settlementId,
      type: 'settlement' as const,
    },
    createdAt,
    settlementId,
  }
}

export async function getDashboardData() {
  const [settings, groups, recentActivity, unreadNotificationCount] = await Promise.all([
    getSettingsRecord(),
    getAllActiveGroups(),
    getActivityWithGroupNames({ limit: 2 }),
    getUnreadNotificationCount(),
  ])
  const groupCards = await Promise.all(groups.map((group) => getGroupCardData(group)))
  const groupsNeedingAttention = groupCards.filter((group) => group.openBalanceCount > 0).length
  const currentUserMemberId = settings?.currentUserMemberId ?? 'member-you'

  const balancesPerGroup = await Promise.all(groups.map((group) => getGroupBalances(group.id)))
  const allBalances = balancesPerGroup.flat()
  const owedCents = allBalances
    .filter((item) => item.toId === currentUserMemberId)
    .reduce((sum, item) => sum + item.amountCents, 0)
  const owesCents = allBalances
    .filter((item) => item.fromId === currentUserMemberId)
    .reduce((sum, item) => sum + item.amountCents, 0)

  return {
    groups: groupCards.sort((left, right) => right.openBalanceCount - left.openBalanceCount),
    unreadNotificationCount,
    recentActivity,
    summary: {
      attention: `${groupsNeedingAttention} group${groupsNeedingAttention === 1 ? '' : 's'} need attention`,
      net: getUserNetLabel({ owedCents, owesCents }),
      openBalances: `${allBalances.length} open balance${allBalances.length === 1 ? '' : 's'}`,
      owed: formatCurrencyFromCents(owedCents),
      owes: formatCurrencyFromCents(owesCents),
    },
    userName: settings?.userName ?? 'Sebas',
  }
}

export async function getActivityData() {
  return getActivityWithGroupNames({ includeSystem: true })
}

export async function getNotificationsData() {
  return getActivityWithGroupNames()
}

export async function getGroupsData() {
  const groups = await getAllActiveGroups()
  return Promise.all(groups.map((group) => getGroupCardData(group)))
}

export async function getAllGroupsData() {
  const groups = await getAllGroups()
  const groupCards = await Promise.all(groups.map((group) => getGroupCardData(group)))

  return groupCards.sort((left, right) => Number(left.isDone) - Number(right.isDone))
}

export async function getSelectableGroupsData() {
  const groups = await getSelectableGroups()

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
  }))
}

export async function searchApp(query: string) {
  const term = query.trim().toLowerCase()

  if (!term) {
    return {
      activities: [],
      expenses: [],
      groups: [],
      members: [],
    }
  }

  const [groups, expenses, members, activities] = await Promise.all([
    getAllGroups(),
    appDb.expenses.filter((item) => item.deletedAt === null).toArray(),
    appDb.members.filter((item) => item.deletedAt === null).toArray(),
    getActivityWithGroupNames({ includeSystem: true }),
  ])

  const groupMatches = groups
    .filter(
      (group) =>
        group.name.toLowerCase().includes(term) || group.description.toLowerCase().includes(term),
    )
    .map((group) => ({
      id: group.id,
      subtitle: group.description || `${group.isDone ? 'Done' : 'Open'} group`,
      title: group.name,
      type: 'group' as const,
    }))

  const expenseMatches = expenses
    .filter((expense) => expense.title.toLowerCase().includes(term))
    .map((expense) => ({
      id: expense.id,
      subtitle: formatCurrencyFromCents(expense.amountCents),
      title: expense.title,
      type: 'expense' as const,
    }))

  const memberMatches = members
    .filter(
      (member) =>
        member.name.toLowerCase().includes(term) ||
        (member.email ?? '').toLowerCase().includes(term),
    )
    .map((member) => ({
      id: member.id,
      subtitle: member.email ?? 'Local member',
      title: member.name,
      type: 'member' as const,
    }))

  const activityMatches = activities
    .filter((activity) => activity.text.toLowerCase().includes(term))
    .map((activity) => ({
      id: activity.id,
      subtitle: activity.groupName,
      title: activity.text,
      type: 'activity' as const,
    }))

  return {
    activities: activityMatches,
    expenses: expenseMatches,
    groups: groupMatches,
    members: memberMatches,
  }
}

export async function getGroupById(groupId: string) {
  const group = await appDb.groups.get(groupId)

  if (!group || group.deletedAt !== null) {
    return null
  }

  const [acceptedMembers, pendingMembers, balances, memberBalances, timeline, recurringExpenses, expenses] = await Promise.all([
    getAcceptedGroupMembers(groupId),
    getPendingInviteMembers(groupId),
    getGroupBalances(groupId),
    getGroupMemberBalanceSummary(groupId),
    getActivityWithGroupNames({ includeSystem: true }).then((items) =>
      items.filter((item) => item.groupId === group.id),
    ),
    appDb.recurringExpenses
      .where('groupId')
      .equals(groupId)
      .filter((item) => item.deletedAt === null)
      .reverse()
      .sortBy('updatedAt'),
    appDb.expenses
      .where('groupId')
      .equals(groupId)
      .filter((item) => item.deletedAt === null)
      .reverse()
      .sortBy('createdAt'),
  ])

  const memberNameMap = new Map(acceptedMembers.map(({ member }) => [member.id, member.name]))
  const allSharesForExpenses = await appDb.expenseShares
    .where('expenseId')
    .anyOf(expenses.map((e) => e.id))
    .toArray()
  const sharesByExpenseId = new Map<string, ExpenseShareRecord[]>()
  for (const share of allSharesForExpenses) {
    const list = sharesByExpenseId.get(share.expenseId) ?? []
    list.push(share)
    sharesByExpenseId.set(share.expenseId, list)
  }

  const expenseItems = expenses
    .sort((left, right) => right.createdAt - left.createdAt)
    .map((expense) => {
      const shares = sharesByExpenseId.get(expense.id) ?? []

      return {
        amount: formatCurrencyFromCents(expense.amountCents),
        dateLabel: formatShortDate(expense.createdAt),
        expenseId: expense.id,
        paidBy: `Paid by ${memberNameMap.get(expense.paidByMemberId) ?? 'Unknown'}`,
        splitLabel: `Split with ${shares.length} people`,
        title: expense.title,
      }
    })

  return {
    balanceItems: balances.map(
      (item) =>
        `${item.fromName} owed ${formatCurrencyFromCents(item.amountCents)} to ${item.toName}`,
    ),
    description: group.description,
    expenses: expenseItems,
    id: group.id,
    isActive: group.isActive,
    isDone: group.isDone,
    invitedEmails: pendingMembers
      .map(({ member }) => member.email)
      .filter((email): email is string => Boolean(email)),
    invitedEntries: pendingMembers.map(({ member }) => ({
      email: member.email ?? member.name,
      id: member.id,
      name: member.name,
    })),
    memberEntries: acceptedMembers.map(({ member }) => ({
      id: member.id,
      name: member.name,
    })),
    memberBalances,
    memberCount: acceptedMembers.length,
    members: acceptedMembers.map(({ member }) => member.name),
    name: group.name,
    recurringExpenses: recurringExpenses.map((item) => ({
      amount: formatCurrencyFromCents(item.amountCents),
      frequencyLabel: formatRecurringFrequency(item.frequency),
      id: item.id,
      isPaused: item.isPaused,
      participantCount: JSON.parse(item.participantMemberIdsJson).length,
      paidByMemberId: item.paidByMemberId,
      title: item.title,
    })),
    settlementSuggestions: balances.map((item) => ({
      amount: formatCurrencyFromCents(item.amountCents),
      fromId: item.fromId,
      suggestion: `${item.fromName} should pay ${item.toName} ${formatCurrencyFromCents(item.amountCents)}`,
      toId: item.toId,
    })),
    timeline,
  }
}

export async function getExpenseById(expenseId: string) {
  const expense = await appDb.expenses.get(expenseId)

  if (!expense || expense.deletedAt !== null) {
    return null
  }

  const [group, shares] = await Promise.all([
    appDb.groups.get(expense.groupId),
    appDb.expenseShares.where('expenseId').equals(expense.id).toArray(),
  ])

  if (!group || group.deletedAt !== null) {
    return null
  }

  const memberIds = [...new Set([expense.paidByMemberId, ...shares.map((share) => share.memberId)])]
  const members = await appDb.members.bulkGet(memberIds)
  const presentMembers = members.filter((member): member is MemberRecord => Boolean(member))
  const memberMap = new Map(presentMembers.map((member) => [member.id, member.name]))

  return {
    amount: formatCurrencyFromCents(expense.amountCents),
    breakdown: shares.map((share) => ({
      adjustmentCents: share.adjustmentCents,
      amount: formatCurrencyFromCents(share.shareCents),
      member: memberMap.get(share.memberId) ?? 'Unknown',
      memberId: share.memberId,
    })),
    date: formatLongDate(expense.createdAt),
    expenseId: expense.id,
    groupId: group.id,
    groupMembers: presentMembers.map((member) => ({
      id: member.id,
      name: member.name,
    })),
    participantIds: shares.map((share) => share.memberId),
    paidBy: `${memberMap.get(expense.paidByMemberId) ?? 'Unknown'} paid full amount`,
    paidByMemberId: expense.paidByMemberId,
    participants: shares.map((share) => memberMap.get(share.memberId) ?? 'Unknown'),
    result: shares
      .filter((share) => share.memberId !== expense.paidByMemberId && share.shareCents > 0)
      .map((share) => ({
        id: `${expense.id}-${share.memberId}`,
        text: `${memberMap.get(share.memberId) ?? 'Unknown'} owes ${memberMap.get(expense.paidByMemberId) ?? 'Unknown'} ${formatCurrencyFromCents(share.shareCents)}`,
      })),
    title: expense.title,
  }
}

export async function getSettingsData() {
  const settings = await getSettingsRecord()

  if (!settings) {
    return null
  }

  return settings
}

export async function createGroup({
  description,
  name,
}: {
  description: string
  name: string
}) {
  const settings = await getSettingsRecord()

  if (!settings) {
    throw new Error('Settings not initialized.')
  }

  const now = Date.now()
  const groupId = crypto.randomUUID()
  const group: GroupRecord = {
    createdAt: now,
    deletedAt: null,
    description,
    id: groupId,
    isActive: true,
    isDone: false,
    name,
    syncStatus: 'local',
    updatedAt: now,
  }
  const groupMember: GroupMemberRecord = {
    createdAt: now,
    deletedAt: null,
    groupId,
    id: crypto.randomUUID(),
    inviteStatus: 'accepted',
    joinedAt: now,
    memberId: settings.currentUserMemberId,
    syncStatus: 'local',
    updatedAt: now,
  }
  const activity = buildSystemActivity({
    groupId,
    message: `Group created: ${name}.`,
    relatedId: groupId,
  })

  await appDb.transaction(
    'rw',
    [appDb.activity, appDb.groups, appDb.groupMembers, appDb.syncOutbox],
    async () => {
      await appDb.groups.add(group)
      await appDb.groupMembers.add(groupMember)
      await appDb.activity.add(activity)
      await appDb.syncOutbox.bulkAdd([
        buildOutboxRecord({
          entityId: group.id,
          entityType: 'group',
          operation: 'create',
          payload: JSON.stringify(group),
        }),
        buildOutboxRecord({
          entityId: groupMember.id,
          entityType: 'groupMember',
          operation: 'create',
          payload: JSON.stringify(groupMember),
        }),
      ])
    },
  )

  return groupId
}

export async function addGroupMember({
  email,
  groupId,
  inviteStatus,
  name,
  source,
}: {
  email: string | null
  groupId: string
  inviteStatus: InviteStatus
  name: string
  source: MemberSource
}) {
  const now = Date.now()
  const normalizedEmail = email?.trim().toLowerCase() ?? null
  const existingMember =
    normalizedEmail === null ? null : await appDb.members.where('email').equals(normalizedEmail).first()
  const member: MemberRecord =
    existingMember ?? {
      createdAt: now,
      deletedAt: null,
      email: normalizedEmail,
      id: crypto.randomUUID(),
      name,
      source,
      syncStatus: 'local',
      updatedAt: now,
    }
  const groupMember: GroupMemberRecord = {
    createdAt: now,
    deletedAt: null,
    groupId,
    id: crypto.randomUUID(),
    inviteStatus,
    joinedAt: now,
    memberId: member.id,
    syncStatus: 'local',
    updatedAt: now,
  }
  const activity = buildSystemActivity({
    groupId,
    message:
      inviteStatus === 'pending'
        ? `Invite sent to ${normalizedEmail ?? name}.`
        : `Member added: ${name}.`,
    relatedId: groupMember.id,
  })

  await appDb.transaction(
    'rw',
    [appDb.activity, appDb.members, appDb.groupMembers, appDb.syncOutbox],
    async () => {
      if (!existingMember) {
        await appDb.members.add(member)
        await appDb.syncOutbox.add(
          buildOutboxRecord({
            entityId: member.id,
            entityType: 'member',
            operation: 'create',
            payload: JSON.stringify(member),
          }),
        )
      }

      await appDb.groupMembers.add(groupMember)
      await appDb.activity.add(activity)
      await appDb.syncOutbox.add(
        buildOutboxRecord({
          entityId: groupMember.id,
          entityType: 'groupMember',
          operation: 'create',
          payload: JSON.stringify(groupMember),
        }),
      )
    },
  )
}

export async function createExpense({
  adjustmentEntries,
  amountCents,
  groupId,
  note,
  paidByMemberId,
  participantMemberIds,
  title,
}: {
  adjustmentEntries: Array<{ amountCents: number; memberId: string }>
  amountCents: number
  groupId: string
  note: string | null
  paidByMemberId: string
  participantMemberIds: string[]
  title: string
}) {
  const group = await appDb.groups.get(groupId)

  if (!group || group.deletedAt !== null) {
    throw new Error('Group not found.')
  }

  const memberNameMap = await getGroupMemberNameMap(groupId)
  const shares = computeShares({
    adjustmentEntries,
    amountCents,
    memberIds: participantMemberIds,
  })
  const { activity, createdAt, expenseId } = await createExpenseActivity({
    amountCents,
    groupId: group.id,
    paidByName: memberNameMap.get(paidByMemberId) ?? 'Unknown',
    participantCount: shares.length,
    title,
  })

  const expense: ExpenseRecord = {
    amountCents,
    createdAt,
    deletedAt: null,
    groupId,
    id: expenseId,
    note,
    paidByMemberId,
    syncStatus: 'local',
    title,
    updatedAt: createdAt,
  }

  const shareRecords: ExpenseShareRecord[] = shares.map((share) => ({
    adjustmentCents: share.adjustmentCents,
    createdAt,
    expenseId,
    id: crypto.randomUUID(),
    memberId: share.memberId,
    shareCents: share.shareCents,
    updatedAt: createdAt,
  }))

  await appDb.transaction(
    'rw',
    [appDb.expenses, appDb.expenseShares, appDb.activity, appDb.syncOutbox],
    async () => {
      await appDb.expenses.add(expense)
      await appDb.expenseShares.bulkAdd(shareRecords)
      await appDb.activity.add(activity)
      await appDb.syncOutbox.add(
        buildOutboxRecord({
          entityId: expense.id,
          entityType: 'expense',
          operation: 'create',
          payload: JSON.stringify({
            expense,
            shares: shareRecords,
          }),
        }),
      )
    },
  )

  return expenseId
}

export async function updateExpense({
  amountCents,
  expenseId,
  paidByMemberId,
  participantMemberIds,
  title,
}: {
  amountCents: number
  expenseId: string
  paidByMemberId: string
  participantMemberIds: string[]
  title: string
}) {
  const expense = await appDb.expenses.get(expenseId)

  if (!expense || expense.deletedAt !== null) {
    throw new Error('Expense not found.')
  }

  const group = await appDb.groups.get(expense.groupId)

  if (!group || group.deletedAt !== null) {
    throw new Error('Group not found.')
  }

  const existingShares = await appDb.expenseShares.where('expenseId').equals(expense.id).toArray()
  const preservedAdjustments = existingShares
    .filter(
      (share) => share.adjustmentCents > 0 && participantMemberIds.includes(share.memberId),
    )
    .map((share) => ({
      amountCents: share.adjustmentCents,
      memberId: share.memberId,
    }))
  const shares = computeShares({
    adjustmentEntries: preservedAdjustments,
    amountCents,
    memberIds: participantMemberIds,
  })
  const now = Date.now()
  const nextExpense: ExpenseRecord = {
    ...expense,
    amountCents,
    paidByMemberId,
    title: title.trim() || 'Expense',
    updatedAt: now,
  }
  const nextShareRecords: ExpenseShareRecord[] = shares.map((share) => ({
    adjustmentCents: share.adjustmentCents,
    createdAt: now,
    expenseId: expense.id,
    id: crypto.randomUUID(),
    memberId: share.memberId,
    shareCents: share.shareCents,
    updatedAt: now,
  }))
  const memberNameMap = await getGroupMemberNameMap(expense.groupId)
  const expenseActivity = await appDb.activity.where('relatedId').equals(expense.id).first()

  await appDb.transaction(
    'rw',
    [appDb.expenses, appDb.expenseShares, appDb.activity, appDb.syncOutbox],
    async () => {
      await appDb.expenses.put(nextExpense)
      await appDb.expenseShares.where('expenseId').equals(expense.id).delete()
      await appDb.expenseShares.bulkAdd(nextShareRecords)

      if (expenseActivity) {
        await appDb.activity.put({
          ...expenseActivity,
          amountCents,
          message: buildExpenseActivityMessage({
            paidByName: memberNameMap.get(paidByMemberId) ?? 'Unknown',
            participantCount: nextShareRecords.length,
            title: nextExpense.title,
          }),
        })
      }

      await appDb.syncOutbox.add(
        buildOutboxRecord({
          entityId: nextExpense.id,
          entityType: 'expense',
          operation: 'update',
          payload: JSON.stringify({
            expense: nextExpense,
            shares: nextShareRecords,
          }),
        }),
      )
    },
  )

  return expense.id
}

export async function deleteExpense({
  expenseId,
}: {
  expenseId: string
}) {
  const expense = await appDb.expenses.get(expenseId)

  if (!expense || expense.deletedAt !== null) {
    throw new Error('Expense not found.')
  }

  const now = Date.now()

  await appDb.transaction(
    'rw',
    [appDb.expenses, appDb.activity, appDb.syncOutbox],
    async () => {
      await appDb.expenses.put({
        ...expense,
        deletedAt: now,
        updatedAt: now,
      })
      await appDb.activity.where('relatedId').equals(expense.id).delete()
      await appDb.syncOutbox.add(
        buildOutboxRecord({
          entityId: expense.id,
          entityType: 'expense',
          operation: 'delete',
          payload: JSON.stringify({
            deletedAt: now,
            expenseId: expense.id,
          }),
        }),
      )
    },
  )
}

export async function renameGroupMember({
  groupId,
  memberId,
  name,
}: {
  groupId: string
  memberId: string
  name: string
}) {
  const member = await appDb.members.get(memberId)

  if (!member || member.deletedAt !== null) {
    throw new Error('Member not found.')
  }

  const nextName = name.trim()

  if (nextName.length === 0) {
    throw new Error('Name is required.')
  }

  const nextMember = {
    ...member,
    name: nextName,
    updatedAt: Date.now(),
  }

  await appDb.transaction('rw', [appDb.members, appDb.syncOutbox, appDb.activity], async () => {
    await appDb.members.put(nextMember)
    await appDb.activity.add(
      buildSystemActivity({
        groupId,
        message: `Member renamed to ${nextName}.`,
        relatedId: memberId,
      }),
    )
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: nextMember.id,
        entityType: 'member',
        operation: 'update',
        payload: JSON.stringify(nextMember),
      }),
    )
  })
}

export async function removeGroupMember({
  groupId,
  memberId,
}: {
  groupId: string
  memberId: string
}) {
  const groupMember = await appDb.groupMembers
    .where('[groupId+memberId]')
    .equals([groupId, memberId] as [string, string])
    .filter((item) => item.deletedAt === null)
    .first()

  if (!groupMember) {
    throw new Error('Group member not found.')
  }

  const member = await appDb.members.get(memberId)
  const now = Date.now()

  await appDb.transaction('rw', [appDb.groupMembers, appDb.syncOutbox, appDb.activity], async () => {
    await appDb.groupMembers.put({
      ...groupMember,
      deletedAt: now,
      updatedAt: now,
    })
    await appDb.activity.add(
      buildSystemActivity({
        groupId,
        message: `Member removed: ${member?.name ?? 'Unknown'}.`,
        relatedId: groupMember.id,
      }),
    )
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: groupMember.id,
        entityType: 'groupMember',
        operation: 'delete',
        payload: JSON.stringify({
          deletedAt: now,
          groupMemberId: groupMember.id,
        }),
      }),
    )
  })
}

export async function updateInviteStatus({
  groupId,
  inviteStatus,
  memberId,
}: {
  groupId: string
  inviteStatus: InviteStatus
  memberId: string
}) {
  const groupMember = await appDb.groupMembers
    .where('[groupId+memberId]')
    .equals([groupId, memberId] as [string, string])
    .filter((item) => item.deletedAt === null)
    .first()

  if (!groupMember) {
    throw new Error('Invite not found.')
  }

  const member = await appDb.members.get(memberId)
  const nextGroupMember = {
    ...groupMember,
    inviteStatus,
    updatedAt: Date.now(),
  }

  await appDb.transaction('rw', [appDb.groupMembers, appDb.syncOutbox, appDb.activity], async () => {
    await appDb.groupMembers.put(nextGroupMember)
    await appDb.activity.add(
      buildSystemActivity({
        groupId,
        message:
          inviteStatus === 'accepted'
            ? `Invite accepted: ${member?.name ?? member?.email ?? 'Unknown'}.`
            : `Invite resent to ${member?.email ?? member?.name ?? 'Unknown'}.`,
        relatedId: nextGroupMember.id,
      }),
    )
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: nextGroupMember.id,
        entityType: 'groupMember',
        operation: 'update',
        payload: JSON.stringify(nextGroupMember),
      }),
    )
  })
}

export async function createRecurringExpense({
  amountCents,
  frequency,
  groupId,
  paidByMemberId,
  participantMemberIds,
  title,
}: {
  amountCents: number
  frequency: RecurringFrequency
  groupId: string
  paidByMemberId: string
  participantMemberIds: string[]
  title: string
}) {
  const now = Date.now()
  const recurringExpense: RecurringExpenseRecord = {
    amountCents,
    createdAt: now,
    deletedAt: null,
    frequency,
    groupId,
    id: crypto.randomUUID(),
    isPaused: false,
    paidByMemberId,
    participantMemberIdsJson: JSON.stringify(participantMemberIds),
    title: title.trim() || 'Recurring expense',
    updatedAt: now,
  }

  await appDb.transaction(
    'rw',
    [appDb.recurringExpenses, appDb.activity, appDb.syncOutbox],
    async () => {
      await appDb.recurringExpenses.add(recurringExpense)
      await appDb.activity.add(
        buildSystemActivity({
          groupId,
          message: `Recurring expense created: ${recurringExpense.title} (${formatRecurringFrequency(frequency)}).`,
          relatedId: recurringExpense.id,
        }),
      )
      await appDb.syncOutbox.add(
        buildOutboxRecord({
          entityId: recurringExpense.id,
          entityType: 'expense',
          operation: 'create',
          payload: JSON.stringify({
            recurringExpense,
          }),
        }),
      )
    },
  )
}

export async function toggleRecurringExpensePaused({
  isPaused,
  recurringExpenseId,
}: {
  isPaused: boolean
  recurringExpenseId: string
}) {
  const recurringExpense = await appDb.recurringExpenses.get(recurringExpenseId)

  if (!recurringExpense || recurringExpense.deletedAt !== null) {
    throw new Error('Recurring expense not found.')
  }

  const nextRecurringExpense = {
    ...recurringExpense,
    isPaused,
    updatedAt: Date.now(),
  }

  await appDb.transaction(
    'rw',
    [appDb.recurringExpenses, appDb.activity, appDb.syncOutbox],
    async () => {
      await appDb.recurringExpenses.put(nextRecurringExpense)
      await appDb.activity.add(
        buildSystemActivity({
          groupId: recurringExpense.groupId,
          message: isPaused
            ? `Recurring expense paused: ${recurringExpense.title}.`
            : `Recurring expense resumed: ${recurringExpense.title}.`,
          relatedId: recurringExpense.id,
        }),
      )
      await appDb.syncOutbox.add(
        buildOutboxRecord({
          entityId: recurringExpense.id,
          entityType: 'expense',
          operation: 'update',
          payload: JSON.stringify({
            recurringExpense: nextRecurringExpense,
          }),
        }),
      )
    },
  )
}

export async function createExpenseFromRecurring({
  recurringExpenseId,
}: {
  recurringExpenseId: string
}) {
  const recurringExpense = await appDb.recurringExpenses.get(recurringExpenseId)

  if (!recurringExpense || recurringExpense.deletedAt !== null) {
    throw new Error('Recurring expense not found.')
  }

  return createExpense({
    adjustmentEntries: [],
    amountCents: recurringExpense.amountCents,
    groupId: recurringExpense.groupId,
    note: `Created from ${formatRecurringFrequency(recurringExpense.frequency).toLowerCase()} recurring template.`,
    paidByMemberId: recurringExpense.paidByMemberId,
    participantMemberIds: JSON.parse(recurringExpense.participantMemberIdsJson) as string[],
    title: recurringExpense.title,
  })
}

export async function createSettlement({
  amountCents,
  groupId,
  note,
  paidByMemberId,
  receivedByMemberId,
}: {
  amountCents: number
  groupId: string
  note: string | null
  paidByMemberId: string
  receivedByMemberId: string
}) {
  const group = await appDb.groups.get(groupId)

  if (!group || group.deletedAt !== null) {
    throw new Error('Group not found.')
  }

  const memberNameMap = await getGroupMemberNameMap(groupId)
  const { activity, createdAt, settlementId } = await createSettlementActivity({
    amountCents,
    groupId: group.id,
    paidByName: memberNameMap.get(paidByMemberId) ?? 'Unknown',
    receivedByName: memberNameMap.get(receivedByMemberId) ?? 'Unknown',
  })

  const settlement: SettlementRecord = {
    amountCents,
    createdAt,
    deletedAt: null,
    groupId,
    id: settlementId,
    note,
    paidByMemberId,
    receivedByMemberId,
    syncStatus: 'local',
    updatedAt: createdAt,
  }

  await appDb.transaction(
    'rw',
    [appDb.settlements, appDb.activity, appDb.syncOutbox],
    async () => {
      await appDb.settlements.add(settlement)
      await appDb.activity.add(activity)
      await appDb.syncOutbox.add(
        buildOutboxRecord({
          entityId: settlement.id,
          entityType: 'settlement',
          operation: 'create',
          payload: JSON.stringify(settlement),
        }),
      )
    },
  )
}

export async function markNotificationRead({
  activityId,
  isRead,
}: {
  activityId: string
  isRead: boolean
}) {
  const activity = await appDb.activity.get(activityId)

  if (!activity) {
    throw new Error('Notification not found.')
  }

  await appDb.activity.put({
    ...activity,
    readAt: isRead ? Date.now() : null,
  })
}

export async function markAllNotificationsRead() {
  const now = Date.now()

  await appDb.activity.toCollection().modify((activity) => {
    activity.readAt = now
  })
}

export async function updateAuthState({
  accountEmail,
  authProvider,
  isSignedIn,
}: {
  accountEmail: string | null
  authProvider: AuthProvider
  isSignedIn: boolean
}) {
  const settings = await getSettingsRecord()

  if (!settings) {
    throw new Error('Settings not initialized.')
  }

  const nextSettings = {
    ...settings,
    accountEmail,
    authProvider,
    isSignedIn,
    updatedAt: Date.now(),
  }

  await appDb.transaction('rw', [appDb.settings, appDb.syncOutbox], async () => {
    await appDb.settings.put(nextSettings)
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: nextSettings.id,
        entityType: 'settings',
        operation: 'update',
        payload: JSON.stringify(nextSettings),
      }),
    )
  })
}

export async function updateCurrency({
  currency,
}: {
  currency: string
}) {
  const settings = await getSettingsRecord()

  if (!settings) {
    throw new Error('Settings not initialized.')
  }

  const nextCurrency = currency.trim().toUpperCase()

  if (nextCurrency.length === 0) {
    throw new Error('Currency is required.')
  }

  const nextSettings = {
    ...settings,
    currency: nextCurrency,
    updatedAt: Date.now(),
  }

  await appDb.transaction('rw', [appDb.settings, appDb.syncOutbox], async () => {
    await appDb.settings.put(nextSettings)
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: nextSettings.id,
        entityType: 'settings',
        operation: 'update',
        payload: JSON.stringify(nextSettings),
      }),
    )
  })
}

export async function setGroupActiveState({
  groupId,
  isActive,
}: {
  groupId: string
  isActive: boolean
}) {
  const nextGroup = await updateGroupRecord(groupId, (group) => ({
    ...group,
    isActive,
    updatedAt: Date.now(),
  }))

  await appDb.activity.add(
    buildSystemActivity({
      groupId,
      message: isActive ? `Group marked active.` : `Group marked inactive.`,
      relatedId: nextGroup.id,
    }),
  )

  return nextGroup
}

export async function setGroupDoneState({
  groupId,
  isDone,
}: {
  groupId: string
  isDone: boolean
}) {
  const nextGroup = await updateGroupRecord(groupId, (group) => ({
    ...group,
    isActive: isDone ? false : group.isActive,
    isDone,
    updatedAt: Date.now(),
  }))

  await appDb.activity.add(
    buildSystemActivity({
      groupId,
      message: isDone ? `Group marked done.` : `Group reopened.`,
      relatedId: nextGroup.id,
    }),
  )

  return nextGroup
}

export async function updateProfile({
  accountEmail,
  userName,
}: {
  accountEmail: string | null
  userName: string
}) {
  const settings = await getSettingsRecord()

  if (!settings) {
    throw new Error('Settings not initialized.')
  }

  const nextUserName = userName.trim()

  if (nextUserName.length === 0) {
    throw new Error('User name is required.')
  }

  const nextSettings = {
    ...settings,
    accountEmail:
      settings.authProvider === 'google'
        ? settings.accountEmail
        : (accountEmail?.trim() || null),
    updatedAt: Date.now(),
    userName: nextUserName,
  }

  await appDb.transaction(
    'rw',
    [appDb.members, appDb.settings, appDb.syncOutbox],
    async () => {
      const currentUser = await appDb.members.get(settings.currentUserMemberId)

      if (currentUser) {
        await appDb.members.put({
          ...currentUser,
          email:
            settings.authProvider === 'google'
              ? currentUser.email
              : (accountEmail?.trim().toLowerCase() || null),
          name: nextUserName,
          updatedAt: nextSettings.updatedAt,
        })
      }

      await appDb.settings.put(nextSettings)
      await appDb.syncOutbox.add(
        buildOutboxRecord({
          entityId: nextSettings.id,
          entityType: 'settings',
          operation: 'update',
          payload: JSON.stringify(nextSettings),
        }),
      )
    },
  )
}

export async function resetLocalData() {
  await appDb.transaction(
    'rw',
    [
      appDb.activity,
      appDb.expenseShares,
      appDb.expenses,
      appDb.groupMembers,
      appDb.groups,
      appDb.members,
      appDb.settings,
      appDb.settlements,
      appDb.syncOutbox,
    ],
    async () => {
      await Promise.all([
        appDb.activity.clear(),
        appDb.expenseShares.clear(),
        appDb.expenses.clear(),
        appDb.groupMembers.clear(),
        appDb.groups.clear(),
        appDb.members.clear(),
        appDb.settings.clear(),
        appDb.settlements.clear(),
        appDb.syncOutbox.clear(),
      ])
    },
  )

  await ensureAppInitialized()
}
