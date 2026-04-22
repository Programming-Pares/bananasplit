import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrentMembersSection } from '@/features/groups/pages/add-member-page/current-members-section'
import { InviteMemberSection } from '@/features/groups/pages/add-member-page/invite-member-section'
import { ManageMemberDrawer } from '@/features/groups/pages/add-member-page/manage-member-drawer'
import { MemberModeButton } from '@/features/groups/pages/add-member-page/member-mode-button'
import {
  useAddGroupMemberMutation,
  useGroupQuery,
  useRemoveGroupMemberMutation,
  useRenameGroupMemberMutation,
  useUpdateInviteStatusMutation,
} from '@/lib/queries/use-app-queries'

type MemberDraftMode = 'manual' | 'invite'

export function AddMemberPage() {
  const { groupId = '' } = useParams()
  const { data: group } = useGroupQuery(groupId)

  if (!group) {
    return null
  }

  return <AddMemberPageContent key={group.id} group={group} groupId={groupId} />
}

function AddMemberPageContent({
  group,
  groupId,
}: {
  group: NonNullable<ReturnType<typeof useGroupQuery>['data']>
  groupId: string
}) {
  const addGroupMemberMutation = useAddGroupMemberMutation()
  const renameGroupMemberMutation = useRenameGroupMemberMutation()
  const removeGroupMemberMutation = useRemoveGroupMemberMutation()
  const updateInviteStatusMutation = useUpdateInviteStatusMutation()
  const [memberMode, setMemberMode] = useState<MemberDraftMode>('manual')
  const [manualName, setManualName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [selectedMemberName, setSelectedMemberName] = useState('')
  const [isManageMemberOpen, setIsManageMemberOpen] = useState(false)

  const trimmedManualName = manualName.trim()
  const trimmedInviteEmail = inviteEmail.trim()
  const canAddManualMember = trimmedManualName.length > 0
  const canAddInvite = trimmedInviteEmail.length > 3 && trimmedInviteEmail.includes('@')
  const selectedMember = group.memberEntries.find((member) => member.id === selectedMemberId)

  return (
    <MobileShell>
      <ScreenHeader
        backHref={`/groups/${groupId}`}
        subtitle={group.name}
        title="Add member"
      />

      <div className="space-y-6">
        <CurrentMembersSection
          members={group.memberEntries.map((member) => ({ id: member.id, name: member.name }))}
          onSelectMember={(memberId, memberName) => {
            setSelectedMemberId(memberId)
            setSelectedMemberName(memberName)
            setIsManageMemberOpen(true)
          }}
        />

        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <MemberModeButton
              active={memberMode === 'manual'}
              onClick={() => setMemberMode('manual')}
            >
              Manual
            </MemberModeButton>
            <MemberModeButton
              active={memberMode === 'invite'}
              onClick={() => setMemberMode('invite')}
            >
              Invite
            </MemberModeButton>
          </div>

          {memberMode === 'manual' ? (
            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-foreground sm:text-[15px]"
                htmlFor="member-name"
              >
                Add member
              </label>
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                id="member-name"
                placeholder="Ana"
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
              />
              <div className="rounded-[24px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                Manual members use a name only for now. Picture upload can come later.
              </div>
              <Button
                className="h-12 w-full rounded-2xl"
                disabled={!canAddManualMember || addGroupMemberMutation.isPending}
                onClick={async () => {
                  await addGroupMemberMutation.mutateAsync({
                    email: null,
                    groupId,
                    inviteStatus: 'accepted',
                    name: trimmedManualName,
                    source: 'manual',
                  })
                  setManualName('')
                }}
                type="button"
              >
                <UserPlus className="size-4" />
                Add member
              </Button>
            </div>
          ) : (
            <InviteMemberSection
              canAddInvite={canAddInvite}
              groupId={groupId}
              inviteEmail={inviteEmail}
              invitedEntries={group.invitedEntries}
              isAddPending={addGroupMemberMutation.isPending}
              isRemovePending={removeGroupMemberMutation.isPending}
              isUpdatePending={updateInviteStatusMutation.isPending}
              onAddInvite={async () => {
                await addGroupMemberMutation.mutateAsync({
                  email: trimmedInviteEmail,
                  groupId,
                  inviteStatus: 'pending',
                  name: trimmedInviteEmail,
                  source: 'invite',
                })
                setInviteEmail('')
              }}
              onCancelInvite={(memberId) =>
                removeGroupMemberMutation.mutate({
                  groupId,
                  memberId,
                })
              }
              onInviteEmailChange={setInviteEmail}
              onMarkAccepted={(memberId) =>
                updateInviteStatusMutation.mutate({
                  groupId,
                  inviteStatus: 'accepted',
                  memberId,
                })
              }
              onResendInvite={(memberId) =>
                updateInviteStatusMutation.mutate({
                  groupId,
                  inviteStatus: 'pending',
                  memberId,
                })
              }
            />
          )}
        </section>
      </div>

      <ManageMemberDrawer
        isRemovePending={removeGroupMemberMutation.isPending}
        isRenamePending={renameGroupMemberMutation.isPending}
        open={isManageMemberOpen}
        selectedMember={selectedMember}
        selectedMemberName={selectedMemberName}
        setSelectedMemberName={setSelectedMemberName}
        onClose={() => setIsManageMemberOpen(false)}
        onOpenChange={setIsManageMemberOpen}
        onRemove={async () => {
          if (!selectedMember) {
            return
          }

          await removeGroupMemberMutation.mutateAsync({
            groupId,
            memberId: selectedMember.id,
          })
          setIsManageMemberOpen(false)
        }}
        onSave={async () => {
          if (!selectedMember) {
            return
          }

          await renameGroupMemberMutation.mutateAsync({
            groupId,
            memberId: selectedMember.id,
            name: selectedMemberName,
          })
          setIsManageMemberOpen(false)
        }}
      />
    </MobileShell>
  )
}
