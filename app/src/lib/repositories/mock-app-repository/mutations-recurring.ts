import { appDb, type RecurringExpenseRecord } from '@/lib/db/app-db'
import { buildOutboxRecord, buildSystemActivity, formatRecurringFrequency } from '@/lib/repositories/mock-app-repository/core'
import { createExpense } from '@/lib/repositories/mock-app-repository/mutations-expenses'

export async function createRecurringExpense({
  amountCents,
  frequency,
  groupId,
  paidByMemberId,
  participantMemberIds,
  title,
}: {
  amountCents: number
  frequency: 'weekly' | 'monthly'
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
    title: title.trim(),
    updatedAt: now,
  }

  await appDb.transaction('rw', [appDb.recurringExpenses, appDb.activity, appDb.syncOutbox], async () => {
    await appDb.recurringExpenses.add(recurringExpense)
    await appDb.activity.add(buildSystemActivity({ groupId, message: `Recurring expense created: ${recurringExpense.title} (${formatRecurringFrequency(frequency)}).`, relatedId: recurringExpense.id }))
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: recurringExpense.id, entityType: 'expense', operation: 'create', payload: JSON.stringify({ recurringExpense }) }))
  })
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

  const nextRecurringExpense = { ...recurringExpense, isPaused, updatedAt: Date.now() }
  await appDb.transaction('rw', [appDb.recurringExpenses, appDb.activity, appDb.syncOutbox], async () => {
    await appDb.recurringExpenses.put(nextRecurringExpense)
    await appDb.activity.add(buildSystemActivity({ groupId: recurringExpense.groupId, message: isPaused ? `Recurring expense paused: ${recurringExpense.title}.` : `Recurring expense resumed: ${recurringExpense.title}.`, relatedId: recurringExpense.id }))
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: recurringExpense.id, entityType: 'expense', operation: 'update', payload: JSON.stringify({ recurringExpense: nextRecurringExpense }) }))
  })
}

export async function createExpenseFromRecurring({ recurringExpenseId }: { recurringExpenseId: string }) {
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
