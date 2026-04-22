import {
  buildExpenseActivityMessage,
  buildSettlementActivityMessage,
} from '@/lib/repositories/mock-app-repository/core'

export function computeShares({
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

export async function createExpenseActivity({
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

export async function createSettlementActivity({
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
