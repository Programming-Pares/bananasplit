import { appDb } from '@/lib/db/app-db'
import { buildOutboxRecord, buildSystemActivity } from '@/lib/repositories/mock-app-repository/core'

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

  const nextMember = { ...member, name: nextName, updatedAt: Date.now() }
  await appDb.transaction('rw', [appDb.members, appDb.syncOutbox, appDb.activity], async () => {
    await appDb.members.put(nextMember)
    await appDb.activity.add(buildSystemActivity({ groupId, message: `Member renamed to ${nextName}.`, relatedId: memberId }))
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: nextMember.id, entityType: 'member', operation: 'update', payload: JSON.stringify(nextMember) }))
  })
}

export async function removeGroupMember({ groupId, memberId }: { groupId: string; memberId: string }) {
  const groupMember = await appDb.groupMembers.where('[groupId+memberId]').equals([groupId, memberId] as [string, string]).filter((item) => item.deletedAt === null).first()
  if (!groupMember) {
    throw new Error('Group member not found.')
  }

  const member = await appDb.members.get(memberId)
  if (!member) {
    throw new Error('Member not found.')
  }

  const now = Date.now()
  await appDb.transaction('rw', [appDb.groupMembers, appDb.syncOutbox, appDb.activity], async () => {
    await appDb.groupMembers.put({ ...groupMember, deletedAt: now, updatedAt: now })
    await appDb.activity.add(buildSystemActivity({ groupId, message: `Member removed: ${member.name}.`, relatedId: groupMember.id }))
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: groupMember.id, entityType: 'groupMember', operation: 'delete', payload: JSON.stringify({ deletedAt: now, groupMemberId: groupMember.id }) }))
  })
}

export async function updateInviteStatus({
  groupId,
  inviteStatus,
  memberId,
}: {
  groupId: string
  inviteStatus: 'accepted' | 'pending'
  memberId: string
}) {
  const groupMember = await appDb.groupMembers.where('[groupId+memberId]').equals([groupId, memberId] as [string, string]).filter((item) => item.deletedAt === null).first()
  if (!groupMember) {
    throw new Error('Invite not found.')
  }

  const member = await appDb.members.get(memberId)
  if (!member) {
    throw new Error('Member not found.')
  }

  const nextGroupMember = { ...groupMember, inviteStatus, updatedAt: Date.now() }
  await appDb.transaction('rw', [appDb.groupMembers, appDb.syncOutbox, appDb.activity], async () => {
    await appDb.groupMembers.put(nextGroupMember)
    await appDb.activity.add(buildSystemActivity({ groupId, message: inviteStatus === 'accepted' ? `Invite accepted: ${member.name}.` : `Invite resent to ${member.email ?? member.name}.`, relatedId: nextGroupMember.id }))
    await appDb.syncOutbox.add(buildOutboxRecord({ entityId: nextGroupMember.id, entityType: 'groupMember', operation: 'update', payload: JSON.stringify(nextGroupMember) }))
  })
}
