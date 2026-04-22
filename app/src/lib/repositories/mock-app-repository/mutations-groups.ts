import {
  appDb,
  type GroupMemberRecord,
  type GroupRecord,
  type InviteStatus,
  type MemberRecord,
  type MemberSource,
} from '@/lib/db/app-db'
import {
  buildOutboxRecord,
  buildSystemActivity,
  getSettingsRecord,
} from '@/lib/repositories/mock-app-repository/core'

export async function createGroup({
  description,
  name,
}: {
  description: string
  name: string
}) {
  const settings = await getSettingsRecord()
  const now = Date.now()
  const groupId = crypto.randomUUID()
  const group: GroupRecord = {
    createdAt: now,
    deletedAt: null,
    description,
    id: groupId,
    isActive: true,
    isDone: false,
    name,
    syncStatus: 'local',
    updatedAt: now,
  }
  const groupMember: GroupMemberRecord = {
    createdAt: now,
    deletedAt: null,
    groupId,
    id: crypto.randomUUID(),
    inviteStatus: 'accepted',
    joinedAt: now,
    memberId: settings.currentUserMemberId,
    syncStatus: 'local',
    updatedAt: now,
  }

  await appDb.transaction('rw', [appDb.activity, appDb.groups, appDb.groupMembers, appDb.syncOutbox], async () => {
    await appDb.groups.add(group)
    await appDb.groupMembers.add(groupMember)
    await appDb.activity.add(
      buildSystemActivity({
        groupId,
        message: `Group created: ${name}.`,
        relatedId: groupId,
      }),
    )
    await appDb.syncOutbox.bulkAdd([
      buildOutboxRecord({ entityId: group.id, entityType: 'group', operation: 'create', payload: JSON.stringify(group) }),
      buildOutboxRecord({ entityId: groupMember.id, entityType: 'groupMember', operation: 'create', payload: JSON.stringify(groupMember) }),
    ])
  })

  return groupId
}

export async function addGroupMember({
  email,
  groupId,
  inviteStatus,
  name,
  source,
}: {
  email: string | null
  groupId: string
  inviteStatus: InviteStatus
  name: string
  source: MemberSource
}) {
  const now = Date.now()
  const normalizedEmail = email?.trim().toLowerCase() ?? null
  const existingMember =
    normalizedEmail === null ? null : await appDb.members.where('email').equals(normalizedEmail).first()
  const member: MemberRecord =
    existingMember ?? {
      createdAt: now,
      deletedAt: null,
      email: normalizedEmail,
      id: crypto.randomUUID(),
      name,
      source,
      syncStatus: 'local',
      updatedAt: now,
    }
  const groupMember: GroupMemberRecord = {
    createdAt: now,
    deletedAt: null,
    groupId,
    id: crypto.randomUUID(),
    inviteStatus,
    joinedAt: now,
    memberId: member.id,
    syncStatus: 'local',
    updatedAt: now,
  }

  await appDb.transaction('rw', [appDb.activity, appDb.members, appDb.groupMembers, appDb.syncOutbox], async () => {
    if (!existingMember) {
      await appDb.members.add(member)
      await appDb.syncOutbox.add(
        buildOutboxRecord({ entityId: member.id, entityType: 'member', operation: 'create', payload: JSON.stringify(member) }),
      )
    }

    await appDb.groupMembers.add(groupMember)
    await appDb.activity.add(
      buildSystemActivity({
        groupId,
        message: inviteStatus === 'pending' ? `Invite sent to ${normalizedEmail ?? name}.` : `Member added: ${name}.`,
        relatedId: groupMember.id,
      }),
    )
    await appDb.syncOutbox.add(
      buildOutboxRecord({ entityId: groupMember.id, entityType: 'groupMember', operation: 'create', payload: JSON.stringify(groupMember) }),
    )
  })
}
