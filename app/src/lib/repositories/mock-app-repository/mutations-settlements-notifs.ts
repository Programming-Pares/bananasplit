import { appDb, type SettlementRecord } from '@/lib/db/app-db'
import { buildOutboxRecord, getDisplayMemberNameMap, getRequiredName } from '@/lib/repositories/mock-app-repository/core'
import { createSettlementActivity } from '@/lib/repositories/mock-app-repository/expense-helpers'

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

  const memberNameMap = await getDisplayMemberNameMap(groupId)
  const { activity, createdAt, settlementId } = await createSettlementActivity({
    amountCents,
    groupId: group.id,
    paidByName: getRequiredName(memberNameMap, paidByMemberId, 'Settlement payer'),
    receivedByName: getRequiredName(memberNameMap, receivedByMemberId, 'Settlement receiver'),
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

  await appDb.transaction('rw', [appDb.settlements, appDb.activity, appDb.syncOutbox], async () => {
    await appDb.settlements.add(settlement)
    await appDb.activity.add(activity)
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: settlement.id, entityType: 'settlement', operation: 'create', payload: JSON.stringify(settlement) }))
  })
}

export async function markNotificationRead({ activityId, isRead }: { activityId: string; isRead: boolean }) {
  const activity = await appDb.activity.get(activityId)
  if (!activity) {
    throw new Error('Notification not found.')
  }

  await appDb.activity.put({ ...activity, readAt: isRead ? Date.now() : null })
}

export async function markAllNotificationsRead() {
  const now = Date.now()
  await appDb.activity.toCollection().modify((activity) => {
    activity.readAt = now
  })
}
