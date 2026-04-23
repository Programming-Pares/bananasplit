import { appDb } from '@/lib/db/app-db'
import {
  getActivityWithGroupNames,
  getGroupBalances,
  getGroupMemberBalanceSummary,
} from '@/lib/repositories/mock-app-repository/balances'
import { getBudgetSummariesByGroup } from '@/lib/repositories/mock-app-repository/budgets'
import {
  formatCurrencyFromCents,
  formatLongDate,
  formatRecurringFrequency,
  formatShortDate,
  getAcceptedGroupMembers,
  getCurrentUserContext,
  getDisplayMemberNameMap,
  getPendingInviteMembers,
  getRequiredName,
  getSettingsRecord,
} from '@/lib/repositories/mock-app-repository/core'

export async function getGroupById(groupId: string) {
  const group = await appDb.groups.get(groupId)
  if (!group || group.deletedAt !== null) {
    return null
  }

  const [acceptedMembers, pendingMembers, balances, memberBalances, timeline, recurringExpenses, expenses, budgets] = await Promise.all([
    getAcceptedGroupMembers(groupId),
    getPendingInviteMembers(groupId),
    getGroupBalances(groupId),
    getGroupMemberBalanceSummary(groupId),
    getActivityWithGroupNames({ includeSystem: true }).then((items) => items.filter((item) => item.groupId === group.id)),
    appDb.recurringExpenses.where('groupId').equals(groupId).filter((item) => item.deletedAt === null).reverse().sortBy('updatedAt'),
    appDb.expenses.where('groupId').equals(groupId).filter((item) => item.deletedAt === null).reverse().sortBy('createdAt'),
    getBudgetSummariesByGroup(groupId),
  ])
  const budgetMap = new Map(budgets.map((budget) => [budget.id, budget]))
  const memberNameMap = await getDisplayMemberNameMap(groupId)
  const expenseItems = await Promise.all(
    expenses.sort((left, right) => right.createdAt - left.createdAt).map(async (expense) => {
      const shares = await appDb.expenseShares.where('expenseId').equals(expense.id).toArray()
      const budget = expense.budgetId ? budgetMap.get(expense.budgetId) : null

      return {
        amount: formatCurrencyFromCents(expense.amountCents),
        budgetLabel: budget ? `${budget.name} · ${budget.remaining} left` : null,
        dateLabel: formatShortDate(expense.createdAt),
        expenseId: expense.id,
        paidBy: `Paid by ${getRequiredName(memberNameMap, expense.paidByMemberId, 'Expense payer')}`,
        splitLabel: `Split with ${shares.length} people`,
        title: expense.title,
      }
    }),
  )

  return {
    balanceItems: balances.map((item) => `${item.fromName} owed ${formatCurrencyFromCents(item.amountCents)} to ${item.toName}`),
    description: group.description,
    expenses: expenseItems,
    id: group.id,
    isActive: group.isActive,
    isDone: group.isDone,
    invitedEmails: pendingMembers.map(({ member }) => member.email).filter((email): email is string => Boolean(email)),
    invitedEntries: pendingMembers.map(({ member }) => ({ email: member.email ?? member.name, id: member.id, name: member.name })),
    memberEntries: acceptedMembers.map(({ member }) => ({ id: member.id, name: member.name })),
    memberBalances,
    memberCount: acceptedMembers.length,
    members: acceptedMembers.map(({ member }) => member.name),
    name: group.name,
    budgets,
    recurringExpenses: recurringExpenses.map((item) => ({ amount: formatCurrencyFromCents(item.amountCents), frequencyLabel: formatRecurringFrequency(item.frequency), id: item.id, isPaused: item.isPaused, participantCount: JSON.parse(item.participantMemberIdsJson).length, paidByMemberId: item.paidByMemberId, title: item.title })),
    settlementSuggestions: balances.map((item) => ({ amount: formatCurrencyFromCents(item.amountCents), fromId: item.fromId, suggestion: `${item.fromName} should pay ${item.toName} ${formatCurrencyFromCents(item.amountCents)}`, toId: item.toId })),
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

  const acceptedMembers = await getAcceptedGroupMembers(group.id)
  const presentMembers = acceptedMembers.map(({ member }) => member)
  const { currentUserMemberId } = await getCurrentUserContext()
  const budgets = await getBudgetSummariesByGroup(group.id)
  const memberMap = new Map(
    presentMembers.map((member) => [member.id, member.id === currentUserMemberId ? 'You' : member.name]),
  )
  const selectedBudget = expense.budgetId
    ? budgets.find((budget) => budget.id === expense.budgetId) ?? null
    : null

  return {
    amount: formatCurrencyFromCents(expense.amountCents),
    budgetId: expense.budgetId,
    budgetName: selectedBudget?.name ?? null,
    breakdown: shares.map((share) => ({ adjustmentCents: share.adjustmentCents, amount: formatCurrencyFromCents(share.shareCents), member: getRequiredName(memberMap, share.memberId, 'Expense participant'), memberId: share.memberId })),
    budgets,
    date: formatLongDate(expense.createdAt),
    expenseId: expense.id,
    groupId: group.id,
    groupMembers: presentMembers.map((member) => ({ id: member.id, name: member.name })),
    participantIds: shares.map((share) => share.memberId),
    paidBy: `${getRequiredName(memberMap, expense.paidByMemberId, 'Expense payer')} paid full amount`,
    paidByMemberId: expense.paidByMemberId,
    participants: shares.map((share) => getRequiredName(memberMap, share.memberId, 'Expense participant')),
    result: shares
      .filter((share) => share.memberId !== expense.paidByMemberId && share.shareCents > 0)
      .map((share) => ({ id: `${expense.id}-${share.memberId}`, text: `${getRequiredName(memberMap, share.memberId, 'Expense debtor')} owes ${getRequiredName(memberMap, expense.paidByMemberId, 'Expense payer')} ${formatCurrencyFromCents(share.shareCents)}` })),
    title: expense.title,
  }
}

export async function getSettingsData() {
  return getSettingsRecord()
}
