import {
  appDb,
  type BudgetRecord,
  type ExpenseRecord,
  type GroupMemberRecord,
  type GroupRecord,
  type RecurringExpenseRecord,
  type SettlementRecord,
} from '@/lib/db/app-db'
import { buildOutboxRecord, buildSystemActivity } from '@/lib/repositories/mock-app-repository/core'

export async function updateGroup({
  description,
  groupId,
  name,
}: {
  description: string
  groupId: string
  name: string
}) {
  const group = await appDb.groups.get(groupId)
  if (!group || group.deletedAt !== null) {
    throw new Error('Group not found.')
  }

  const nextGroup: GroupRecord = {
    ...group,
    description: description.trim(),
    name: name.trim(),
    updatedAt: Date.now(),
  }

  await appDb.transaction('rw', [appDb.groups, appDb.activity, appDb.syncOutbox], async () => {
    await appDb.groups.put(nextGroup)
    await appDb.activity.add(
      buildSystemActivity({
        groupId,
        message: `Group updated: ${nextGroup.name}.`,
        relatedId: nextGroup.id,
      }),
    )
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: nextGroup.id,
        entityType: 'group',
        operation: 'update',
        payload: JSON.stringify(nextGroup),
      }),
    )
  })

  return nextGroup.id
}

function buildDeletedRecord<T extends { deletedAt: number | null; updatedAt: number }>(
  record: T,
  deletedAt: number,
) {
  return {
    ...record,
    deletedAt,
    updatedAt: deletedAt,
  }
}

export async function deleteGroup({ groupId }: { groupId: string }) {
  const group = await appDb.groups.get(groupId)
  if (!group || group.deletedAt !== null) {
    throw new Error('Group not found.')
  }

  const [budgets, expenses, groupMembers, recurringExpenses, settlements] = await Promise.all([
    appDb.budgets.where('groupId').equals(groupId).filter((record) => record.deletedAt === null).toArray(),
    appDb.expenses.where('groupId').equals(groupId).filter((record) => record.deletedAt === null).toArray(),
    appDb.groupMembers.where('groupId').equals(groupId).filter((record) => record.deletedAt === null).toArray(),
    appDb.recurringExpenses.where('groupId').equals(groupId).filter((record) => record.deletedAt === null).toArray(),
    appDb.settlements.where('groupId').equals(groupId).filter((record) => record.deletedAt === null).toArray(),
  ])
  const deletedAt = Date.now()
  const nextGroup = buildDeletedRecord(group, deletedAt)
  const nextBudgets = budgets.map((record) => buildDeletedRecord<BudgetRecord>(record, deletedAt))
  const nextExpenses = expenses.map((record) => buildDeletedRecord<ExpenseRecord>(record, deletedAt))
  const nextGroupMembers = groupMembers.map((record) =>
    buildDeletedRecord<GroupMemberRecord>(record, deletedAt),
  )
  const nextRecurringExpenses = recurringExpenses.map((record) =>
    buildDeletedRecord<RecurringExpenseRecord>(record, deletedAt),
  )
  const nextSettlements = settlements.map((record) =>
    buildDeletedRecord<SettlementRecord>(record, deletedAt),
  )

  await appDb.transaction(
    'rw',
    [
      appDb.activity,
      appDb.budgets,
      appDb.expenses,
      appDb.groupMembers,
      appDb.groups,
      appDb.recurringExpenses,
      appDb.settlements,
      appDb.syncOutbox,
    ],
    async () => {
      await appDb.groups.put(nextGroup)
      if (nextBudgets.length > 0) {
        await appDb.budgets.bulkPut(nextBudgets)
      }
      if (nextExpenses.length > 0) {
        await appDb.expenses.bulkPut(nextExpenses)
      }
      if (nextGroupMembers.length > 0) {
        await appDb.groupMembers.bulkPut(nextGroupMembers)
      }
      if (nextRecurringExpenses.length > 0) {
        await appDb.recurringExpenses.bulkPut(nextRecurringExpenses)
      }
      if (nextSettlements.length > 0) {
        await appDb.settlements.bulkPut(nextSettlements)
      }
      await appDb.activity.where('groupId').equals(groupId).delete()

      const outboxItems = [
        buildOutboxRecord({
          entityId: nextGroup.id,
          entityType: 'group',
          operation: 'delete',
          payload: JSON.stringify({ deletedAt, groupId: nextGroup.id }),
        }),
        ...nextBudgets.map((record) =>
          buildOutboxRecord({
            entityId: record.id,
            entityType: 'budget',
            operation: 'delete',
            payload: JSON.stringify({ budgetId: record.id, deletedAt }),
          }),
        ),
        ...nextExpenses.map((record) =>
          buildOutboxRecord({
            entityId: record.id,
            entityType: 'expense',
            operation: 'delete',
            payload: JSON.stringify({ deletedAt, expenseId: record.id }),
          }),
        ),
        ...nextGroupMembers.map((record) =>
          buildOutboxRecord({
            entityId: record.id,
            entityType: 'groupMember',
            operation: 'delete',
            payload: JSON.stringify({ deletedAt, groupMemberId: record.id }),
          }),
        ),
        ...nextRecurringExpenses.map((record) =>
          buildOutboxRecord({
            entityId: record.id,
            entityType: 'expense',
            operation: 'delete',
            payload: JSON.stringify({ deletedAt, recurringExpenseId: record.id }),
          }),
        ),
        ...nextSettlements.map((record) =>
          buildOutboxRecord({
            entityId: record.id,
            entityType: 'settlement',
            operation: 'delete',
            payload: JSON.stringify({ deletedAt, settlementId: record.id }),
          }),
        ),
      ]
      await appDb.syncOutbox.bulkAdd(outboxItems)
    },
  )
}
