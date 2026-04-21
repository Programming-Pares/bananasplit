import { Copy, Mail, Share2, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAddGroupMemberMutation, useGroupQuery } from '@/lib/queries/use-app-queries'

type MemberDraftMode = 'manual' | 'invite'

function shouldShowMemberAvatar(index: number) {
  return index % 2 === 0
}

function MemberModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        'rounded-full border px-3 py-2 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-white/80 text-foreground hover:bg-white',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function QrInvitePreview() {
  const qrRows = [
    '111011001',
    '100010101',
    '101110111',
    '001001000',
    '111011101',
    '100000001',
    '101111101',
    '100010001',
    '111011111',
  ]

  return (
    <div className="grid grid-cols-9 gap-1 rounded-[28px] bg-white p-4 shadow-[0_16px_32px_rgba(63,52,25,0.12)]">
      {qrRows.flatMap((row, rowIndex) =>
        row.split('').map((cell, cellIndex) => (
          <span
            key={`${rowIndex}-${cellIndex}`}
            className={cn(
              'aspect-square rounded-[4px]',
              cell === '1' ? 'bg-foreground' : 'bg-[#fff6d6]',
            )}
          />
        )),
      )}
    </div>
  )
}

export function AddMemberPage() {
  const { groupId = '' } = useParams()
  const { data: group } = useGroupQuery(groupId)
  const addGroupMemberMutation = useAddGroupMemberMutation()
  const [memberMode, setMemberMode] = useState<MemberDraftMode>('manual')
  const [manualName, setManualName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  if (!group) {
    return null
  }

  const trimmedManualName = manualName.trim()
  const trimmedInviteEmail = inviteEmail.trim()
  const validInviteEmail =
    trimmedInviteEmail.length > 3 && trimmedInviteEmail.includes('@')
  const canAddManualMember = trimmedManualName.length > 0
  const canAddInvite = validInviteEmail

  return (
    <MobileShell>
      <ScreenHeader
        backHref={`/groups/${groupId}`}
        subtitle={group.name}
        title="Add member"
      />

      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Current members</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.members.map((member, index) => (
              <div
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-sm text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)]"
                key={member}
              >
                {shouldShowMemberAvatar(index) ? (
                  <Avatar className="size-6 border border-white/70">
                    <AvatarFallback className="bg-secondary text-[10px] font-semibold text-secondary-foreground">
                      {member.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                {member}
              </div>
            ))}
          </div>
        </section>

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
                className="block text-sm font-medium text-foreground"
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
              <div className="rounded-[24px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] px-4 py-4 text-sm leading-6 text-muted-foreground">
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
            <div className="space-y-5">
              <div className="space-y-3">
                <label
                  className="block text-sm font-medium text-foreground"
                  htmlFor="member-email"
                >
                  Invite by email
                </label>
                <div className="flex gap-3">
                  <Input
                    className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                    id="member-email"
                    placeholder="ana@example.com"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                  />
                  <Button
                    className="h-12 rounded-2xl px-4"
                    disabled={!canAddInvite || addGroupMemberMutation.isPending}
                    onClick={async () => {
                      await addGroupMemberMutation.mutateAsync({
                        email: trimmedInviteEmail,
                        groupId,
                        inviteStatus: 'pending',
                        name: trimmedInviteEmail,
                        source: 'invite',
                      })
                      setInviteEmail('')
                    }}
                    type="button"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">Invited</h3>
                </div>

                {group.invitedEmails.length > 0 ? (
                  <div className="space-y-2">
                    {group.invitedEmails.map((email) => (
                      <div
                        className="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 shadow-none"
                        key={email}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {email}
                          </p>
                        </div>
                        <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
                          Invited
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-border/80 bg-white/50 px-4 py-4 text-sm text-muted-foreground">
                    No email invites yet.
                  </div>
                )}
              </div>

              <div className="rounded-[30px] bg-[linear-gradient(160deg,#fff2bf,#fffef8)] p-5 shadow-[0_20px_40px_rgba(63,52,25,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Invite via QR</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Let people scan to join this group quickly.
                    </p>
                  </div>
                  <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[var(--color-banana-900)]">
                    Quick join
                  </Badge>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_12rem] md:items-center">
                  <div className="rounded-[24px] bg-white/70 px-4 py-4 text-sm leading-6 text-muted-foreground">
                    Share this invite code with friends who are not in the room. They
                    can join with link, QR, or forwarded invite.
                  </div>
                  <QrInvitePreview />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button className="h-11 rounded-2xl" type="button" variant="secondary">
                    <Share2 className="size-4" />
                    Share
                  </Button>
                  <Button className="h-11 rounded-2xl" type="button" variant="secondary">
                    <Copy className="size-4" />
                    Copy link
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </MobileShell>
  )
}
