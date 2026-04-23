import { appDb, type BudgetRecord } from '@/lib/db/app-db'
import { buildOutboxRecord, formatCurrencyFromCents } from '@/lib/repositories/mock-app-repository/core'

function getBudgetScopeError() {
  return new Error('Budget not found.')
}

export async function getActiveBudgetsByGroup(groupId: string) {
  const group = await appDb.groups.get(groupId)
  if (!group || group.deletedAt !== null) {
    throw new Error('Group not found.')
  }

  return appDb.budgets
    .where('groupId')
    .equals(groupId)
    .filter((budget) => budget.deletedAt === null)
    .reverse()
    .sortBy('updatedAt')
}

export async function getBudgetSummariesByGroup(groupId: string) {
  const [budgets, expenses] = await Promise.all([
    getActiveBudgetsByGroup(groupId),
    appDb.expenses
      .where('groupId')
      .equals(groupId)
      .filter((expense) => expense.deletedAt === null)
      .toArray(),
  ])

  return budgets.map((budget) => {
    const spentCents = expenses
      .filter((expense) => expense.budgetId === budget.id)
      .reduce((sum, expense) => sum + expense.amountCents, 0)
    const remainingCents = budget.amountCents - spentCents

    return {
      amount: formatCurrencyFromCents(budget.amountCents),
      amountCents: budget.amountCents,
      id: budget.id,
      name: budget.name,
      overBudget: formatCurrencyFromCents(Math.abs(remainingCents)),
      overBudgetCents: remainingCents < 0 ? Math.abs(remainingCents) : 0,
      remaining: formatCurrencyFromCents(Math.max(remainingCents, 0)),
      remainingCents,
      spent: formatCurrencyFromCents(spentCents),
      spentCents,
    }
  })
}

export async function createBudget({
  amountCents,
  groupId,
  name,
}: {
  amountCents: number
  groupId: string
  name: string
}) {
  const group = await appDb.groups.get(groupId)
  if (!group || group.deletedAt !== null) {
    throw new Error('Group not found.')
  }

  const now = Date.now()
  const budget: BudgetRecord = {
    amountCents,
    createdAt: now,
    deletedAt: null,
    groupId,
    id: crypto.randomUUID(),
    name: name.trim(),
    syncStatus: 'local',
    updatedAt: now,
  }

  await appDb.transaction('rw', [appDb.budgets, appDb.syncOutbox], async () => {
    await appDb.budgets.add(budget)
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: budget.id,
        entityType: 'budget',
        operation: 'create',
        payload: JSON.stringify(budget),
      }),
    )
  })

  return budget.id
}

export async function updateBudget({
  amountCents,
  budgetId,
  name,
}: {
  amountCents: number
  budgetId: string
  name: string
}) {
  const budget = await appDb.budgets.get(budgetId)
  if (!budget || budget.deletedAt !== null) {
    throw getBudgetScopeError()
  }

  const nextBudget: BudgetRecord = {
    ...budget,
    amountCents,
    name: name.trim(),
    updatedAt: Date.now(),
  }

  await appDb.transaction('rw', [appDb.budgets, appDb.syncOutbox], async () => {
    await appDb.budgets.put(nextBudget)
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: nextBudget.id,
        entityType: 'budget',
        operation: 'update',
        payload: JSON.stringify(nextBudget),
      }),
    )
  })

  return nextBudget.id
}

export async function deleteBudget({ budgetId }: { budgetId: string }) {
  const budget = await appDb.budgets.get(budgetId)
  if (!budget || budget.deletedAt !== null) {
    throw getBudgetScopeError()
  }

  const linkedExpenseCount = await appDb.expenses
    .where('budgetId')
    .equals(budgetId)
    .filter((expense) => expense.deletedAt === null)
    .count()
  if (linkedExpenseCount > 0) {
    throw new Error('Cannot delete a budget with linked expenses.')
  }

  const now = Date.now()
  await appDb.transaction('rw', [appDb.budgets, appDb.syncOutbox], async () => {
    await appDb.budgets.put({
      ...budget,
      deletedAt: now,
      updatedAt: now,
    })
    await appDb.syncOutbox.add(
      buildOutboxRecord({
        entityId: budget.id,
        entityType: 'budget',
        operation: 'delete',
        payload: JSON.stringify({ budgetId: budget.id, deletedAt: now }),
      }),
    )
  })
}
