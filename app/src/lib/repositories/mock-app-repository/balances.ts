import { appDb, type ExpenseShareRecord, type GroupRecord } from '@/lib/db/app-db'
import {
  buildOutboxRecord,
  formatCurrencyFromCents,
  formatShortDate,
  getAcceptedGroupMembers,
  getCurrentUserContext,
  getDisplayMemberNameMap,
  getRequiredName,
} from '@/lib/repositories/mock-app-repository/core'

export async function getGroupBalances(groupId: string) {
  const memberNameMap = await getDisplayMemberNameMap(groupId)
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

  for (const expense of expenses) {
    const expenseShares = await appDb.expenseShares
      .where('expenseId')
      .equals(expense.id)
      .sortBy('createdAt')
    shareByExpenseId.set(expense.id, expenseShares)
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

  const { currentUserMemberId } = await getCurrentUserContext()
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
          fromName: getRequiredName(memberNameMap, leftId, 'Balance source'),
          involvesYou: leftId === currentUserMemberId || rightId === currentUserMemberId,
          toId: rightId,
          toName: getRequiredName(memberNameMap, rightId, 'Balance target'),
        })
      } else {
        balances.push({
          amountCents: Math.abs(net),
          fromId: rightId,
          fromName: getRequiredName(memberNameMap, rightId, 'Balance source'),
          involvesYou: leftId === currentUserMemberId || rightId === currentUserMemberId,
          toId: leftId,
          toName: getRequiredName(memberNameMap, leftId, 'Balance target'),
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

export function getUserNetLabel({
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

export async function getGroupMemberBalanceSummary(groupId: string) {
  const balances = await getGroupBalances(groupId)
  const acceptedMembers = await getAcceptedGroupMembers(groupId)

  return acceptedMembers.map(({ member }) => {
    const owesCents = balances
      .filter((item) => item.fromId === member.id)
      .reduce((sum, item) => sum + item.amountCents, 0)
    const owedCents = balances
      .filter((item) => item.toId === member.id)
      .reduce((sum, item) => sum + item.amountCents, 0)

    return {
      directLines: balances
        .filter((item) => item.fromId === member.id || item.toId === member.id)
        .map((item) =>
          item.fromId === member.id
            ? `Owes ${item.toName} ${formatCurrencyFromCents(item.amountCents)}`
            : `Is owed ${formatCurrencyFromCents(item.amountCents)} by ${item.fromName}`,
        ),
      id: member.id,
      name: member.name,
      netLabel: getUserNetLabel({ owedCents, owesCents }),
      owed: formatCurrencyFromCents(owedCents),
      owes: formatCurrencyFromCents(owesCents),
    }
  })
}

export function buildDashboardSummary({
  attention,
  balances,
  currentUserMemberId,
  expenseCount,
  totalExpenseAmountCents,
  scopeCount,
  scopeLabel,
}: {
  attention: string
  balances: Array<{ amountCents: number; fromId: string; toId: string }>
  currentUserMemberId: string
  expenseCount: number
  totalExpenseAmountCents: number
  scopeCount: number
  scopeLabel: string
}) {
  const owedCents = balances
    .filter((item) => item.toId === currentUserMemberId)
    .reduce((sum, item) => sum + item.amountCents, 0)
  const owesCents = balances
    .filter((item) => item.fromId === currentUserMemberId)
    .reduce((sum, item) => sum + item.amountCents, 0)

  return {
    attention,
    net: getUserNetLabel({ owedCents, owesCents }),
    openBalances: `${balances.length} open balance${balances.length === 1 ? '' : 's'}`,
    owed: formatCurrencyFromCents(owedCents),
    owes: formatCurrencyFromCents(owesCents),
    scopeCountLabel: `${scopeCount} ${scopeLabel}${scopeCount === 1 ? '' : 's'}`,
    scopeLabel,
    totalExpenseCountLabel: `${expenseCount} expense${expenseCount === 1 ? '' : 's'} recorded`,
    totalSpent: formatCurrencyFromCents(totalExpenseAmountCents),
  }
}

export async function getAllActiveGroups() {
  return appDb.groups
    .filter((group) => group.deletedAt === null && group.isDone === false)
    .toArray()
}

export async function getSelectableGroups() {
  return appDb.groups
    .filter((group) => group.deletedAt === null && group.isActive === true && group.isDone === false)
    .toArray()
}

export async function getAllGroups() {
  return appDb.groups.filter((group) => group.deletedAt === null).toArray()
}

export async function updateGroupRecord(groupId: string, updater: (group: GroupRecord) => GroupRecord) {
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

export async function getGroupCardData(group: GroupRecord) {
  const balances = await getGroupBalances(group.id)
  const acceptedMembers = await getAcceptedGroupMembers(group.id)
  const { currentUserMemberId } = await getCurrentUserContext()
  const owedCents = balances.filter((item) => item.toId === currentUserMemberId).reduce((sum, item) => sum + item.amountCents, 0)
  const owesCents = balances.filter((item) => item.fromId === currentUserMemberId).reduce((sum, item) => sum + item.amountCents, 0)
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

export async function getActivityWithGroupNames({
  includeSystem = false,
  limit,
}: {
  includeSystem?: boolean
  limit?: number
} = {}) {
  const activity = await appDb.activity.orderBy('createdAt').reverse().toArray()
  const groups = await getAllGroups()
  const groupMap = new Map(groups.map((group) => [group.id, group.name]))
  const items = (includeSystem
    ? activity
    : activity.filter((item) => item.type === 'expense' || item.type === 'settlement'))
    .map((item) => ({
      amount: item.amountCents === null ? 'No amount' : formatCurrencyFromCents(item.amountCents),
      groupId: item.groupId,
      groupName: groupMap.get(item.groupId) ?? item.groupId,
      id: item.id,
      isRead: item.readAt !== null,
      text: item.message,
      type: item.type,
      when: formatShortDate(item.createdAt),
    }))

  return typeof limit === 'number' ? items.slice(0, limit) : items
}

export async function getUnreadNotificationCount() {
  return appDb.activity
    .filter((item) => item.readAt === null && (item.type === 'expense' || item.type === 'settlement'))
    .count()
}
