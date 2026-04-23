import { appDb, type ExpenseRecord, type ExpenseShareRecord } from '@/lib/db/app-db'
import {
  buildExpenseActivityMessage,
  buildOutboxRecord,
  getAcceptedGroupMembers,
  getDisplayMemberNameMap,
  getGroupMemberNameMap,
  getRequiredName,
} from '@/lib/repositories/mock-app-repository/core'
import { computeShares, createExpenseActivity } from '@/lib/repositories/mock-app-repository/expense-helpers'

export async function createExpense({
  adjustmentEntries,
  amountCents,
  budgetId,
  groupId,
  note,
  paidByMemberId,
  participantMemberIds,
  title,
}: {
  adjustmentEntries: Array<{ amountCents: number; memberId: string }>
  amountCents: number
  budgetId: string | null
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
  if (budgetId) {
    const budget = await appDb.budgets.get(budgetId)
    if (!budget || budget.deletedAt !== null || budget.groupId !== groupId) {
      throw new Error('Budget not found.')
    }
  }

  const memberNameMap = await getDisplayMemberNameMap(groupId)
  const shares = computeShares({ adjustmentEntries, amountCents, memberIds: participantMemberIds })
  const { activity, createdAt, expenseId } = await createExpenseActivity({
    amountCents,
    groupId: group.id,
    paidByName: getRequiredName(memberNameMap, paidByMemberId, 'Expense payer'),
    participantCount: shares.length,
    title,
  })
  const expense: ExpenseRecord = {
    amountCents,
    budgetId,
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

  await appDb.transaction('rw', [appDb.expenses, appDb.expenseShares, appDb.activity, appDb.syncOutbox], async () => {
    await appDb.expenses.add(expense)
    await appDb.expenseShares.bulkAdd(shareRecords)
    await appDb.activity.add(activity)
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: expense.id,
        entityType: 'expense',
        operation: 'create',
        payload: JSON.stringify({ expense, shares: shareRecords }),
      }),
    )
  })

  return expenseId
}

export async function updateExpense({
  amountCents,
  budgetId,
  expenseId,
  paidByMemberId,
  participantMemberIds,
  title,
}: {
  amountCents: number
  budgetId: string | null
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

  const acceptedMembers = await getAcceptedGroupMembers(expense.groupId)
  const acceptedMemberIds = new Set(acceptedMembers.map(({ member }) => member.id))
  if (!acceptedMemberIds.has(paidByMemberId)) {
    throw new Error('Expense payer not found.')
  }

  const uniqueParticipantMemberIds = [...new Set(participantMemberIds)]
  if (uniqueParticipantMemberIds.length === 0) {
    throw new Error('Select at least one participant.')
  }
  if (!uniqueParticipantMemberIds.every((memberId) => acceptedMemberIds.has(memberId))) {
    throw new Error('One or more participants are no longer in this group.')
  }

  if (budgetId) {
    const budget = await appDb.budgets.get(budgetId)
    if (!budget || budget.deletedAt !== null || budget.groupId !== expense.groupId) {
      throw new Error('Budget not found.')
    }
  }

  const existingShares = await appDb.expenseShares.where('expenseId').equals(expense.id).toArray()
  const preservedAdjustments = existingShares
    .filter((share) => share.adjustmentCents > 0 && uniqueParticipantMemberIds.includes(share.memberId))
    .map((share) => ({ amountCents: share.adjustmentCents, memberId: share.memberId }))
  const shares = computeShares({
    adjustmentEntries: preservedAdjustments,
    amountCents,
    memberIds: uniqueParticipantMemberIds,
  })
  const now = Date.now()
  const nextExpense: ExpenseRecord = {
    ...expense,
    amountCents,
    budgetId,
    paidByMemberId,
    title: title.trim(),
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

  await appDb.transaction('rw', [appDb.expenses, appDb.expenseShares, appDb.activity, appDb.syncOutbox], async () => {
    await appDb.expenses.put(nextExpense)
    await appDb.expenseShares.where('expenseId').equals(expense.id).delete()
    await appDb.expenseShares.bulkAdd(nextShareRecords)

    if (expenseActivity) {
      const paidByName = getRequiredName(memberNameMap, paidByMemberId, 'Expense payer')
      await appDb.activity.put({
        ...expenseActivity,
        amountCents,
        message: buildExpenseActivityMessage({
          paidByName,
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
        payload: JSON.stringify({ expense: nextExpense, shares: nextShareRecords }),
      }),
    )
  })

  return {
    expenseId: expense.id,
    groupId: expense.groupId,
  }
}

export async function deleteExpense({ expenseId }: { expenseId: string }) {
  const expense = await appDb.expenses.get(expenseId)
  if (!expense || expense.deletedAt !== null) {
    throw new Error('Expense not found.')
  }

  const now = Date.now()
  await appDb.transaction('rw', [appDb.expenses, appDb.activity, appDb.syncOutbox], async () => {
    await appDb.expenses.put({ ...expense, deletedAt: now, updatedAt: now })
    await appDb.activity.where('relatedId').equals(expense.id).delete()
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: expense.id,
        entityType: 'expense',
        operation: 'delete',
        payload: JSON.stringify({ deletedAt: now, expenseId: expense.id }),
      }),
    )
  })

  return {
    expenseId: expense.id,
    groupId: expense.groupId,
  }
}
