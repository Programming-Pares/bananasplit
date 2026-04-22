import { appDb } from '@/lib/db/app-db'
import {
  buildDashboardSummary,
  getActivityWithGroupNames,
  getAllActiveGroups,
  getAllGroups,
  getGroupBalances,
  getGroupCardData,
  getSelectableGroups,
  getUnreadNotificationCount,
} from '@/lib/repositories/mock-app-repository/balances'
import {
  formatCurrencyFromCents,
  getAcceptedGroupMembers,
  getCurrentUserContext,
  getSettingsRecord,
} from '@/lib/repositories/mock-app-repository/core'

export async function getDashboardData() {
  const [settings, groups, recentActivity, unreadNotificationCount] = await Promise.all([
    getSettingsRecord(),
    getAllActiveGroups(),
    getActivityWithGroupNames({ limit: 2 }),
    getUnreadNotificationCount(),
  ])
  const groupCards = await Promise.all(groups.map((group) => getGroupCardData(group)))
  const groupsNeedingAttention = groupCards.filter((group) => group.openBalanceCount > 0).length
  const { currentUserMemberId } = await getCurrentUserContext()
  const balancesPerGroup = await Promise.all(groups.map((group) => getGroupBalances(group.id)))
  const groupMemberCounts = await Promise.all(
    groups.map((group) => getAcceptedGroupMembers(group.id).then((members) => members.length)),
  )
  const expensesPerGroup = await Promise.all(
    groups.map((group) =>
      appDb.expenses
        .where('groupId')
        .equals(group.id)
        .filter((item) => item.deletedAt === null)
        .toArray(),
    ),
  )
  const allBalances = balancesPerGroup.flat()
  const allExpenses = expensesPerGroup.flat()
  const summaryByGroup = Object.fromEntries(
    groups.map((group, index) => {
      const balances = balancesPerGroup[index]
      const topBalance = balances[0]
      const expenses = expensesPerGroup[index]

      return [
        group.id,
        buildDashboardSummary({
          attention: topBalance
            ? `${topBalance.fromName} owed ${formatCurrencyFromCents(topBalance.amountCents)} to ${topBalance.toName}`
            : 'No open balances',
          balances,
          currentUserMemberId,
          expenseCount: expenses.length,
          scopeCount: groupMemberCounts[index],
          scopeLabel: 'member',
          totalExpenseAmountCents: expenses.reduce((sum, item) => sum + item.amountCents, 0),
        }),
      ]
    }),
  )

  return {
    groups: groupCards.sort((left, right) => right.openBalanceCount - left.openBalanceCount),
    unreadNotificationCount,
    recentActivity,
    summary: buildDashboardSummary({
      attention: `${groupsNeedingAttention} group${groupsNeedingAttention === 1 ? '' : 's'} need attention`,
      balances: allBalances,
      currentUserMemberId,
      expenseCount: allExpenses.length,
      scopeCount: groups.length,
      scopeLabel: 'active group',
      totalExpenseAmountCents: allExpenses.reduce((sum, item) => sum + item.amountCents, 0),
    }),
    summaryByGroup,
    userName: settings.userName,
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

  return {
    activities: activities
      .filter((activity) => activity.text.toLowerCase().includes(term))
      .map((activity) => ({ id: activity.id, subtitle: activity.groupName, title: activity.text, type: 'activity' as const })),
    expenses: expenses
      .filter((expense) => expense.title.toLowerCase().includes(term))
      .map((expense) => ({ id: expense.id, subtitle: formatCurrencyFromCents(expense.amountCents), title: expense.title, type: 'expense' as const })),
    groups: groups
      .filter((group) => group.name.toLowerCase().includes(term) || group.description.toLowerCase().includes(term))
      .map((group) => ({ id: group.id, subtitle: group.description.length > 0 ? group.description : `${group.isDone ? 'Done' : 'Open'} group`, title: group.name, type: 'group' as const })),
    members: members
      .filter((member) => member.name.toLowerCase().includes(term) || (member.email ?? '').toLowerCase().includes(term))
      .map((member) => ({ id: member.id, subtitle: member.email ?? member.name, title: member.name, type: 'member' as const })),
  }
}
