import { Copy, Mail, Share2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QrInvitePreview } from '@/features/groups/pages/add-member-page/qr-invite-preview'

type InviteEntry = {
  email: string
  id: string
}

type InviteMemberSectionProps = {
  canAddInvite: boolean
  groupId: string
  inviteEmail: string
  invitedEntries: InviteEntry[]
  isAddPending: boolean
  isRemovePending: boolean
  isUpdatePending: boolean
  onAddInvite: () => Promise<void>
  onCancelInvite: (memberId: string) => void
  onInviteEmailChange: (value: string) => void
  onMarkAccepted: (memberId: string) => void
  onResendInvite: (memberId: string) => void
}

export function InviteMemberSection({
  canAddInvite,
  inviteEmail,
  invitedEntries,
  isAddPending,
  isRemovePending,
  isUpdatePending,
  onAddInvite,
  onCancelInvite,
  onInviteEmailChange,
  onMarkAccepted,
  onResendInvite,
}: InviteMemberSectionProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label
          className="block text-sm font-medium text-foreground sm:text-[15px]"
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
            onChange={(event) => onInviteEmailChange(event.target.value)}
          />
          <Button
            className="h-12 rounded-2xl px-4"
            disabled={!canAddInvite || isAddPending}
            onClick={onAddInvite}
            type="button"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground sm:text-[15px]">Invited</h3>
        </div>

        {invitedEntries.length > 0 ? (
          <div className="space-y-2">
            {invitedEntries.map((entry) => (
              <div
                className="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 shadow-none"
                key={entry.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground sm:text-[15px]">
                    {entry.email}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
                    Invited
                  </Badge>
                  <Button
                    className="h-8 rounded-full px-3"
                    disabled={isUpdatePending}
                    onClick={() => onMarkAccepted(entry.id)}
                    type="button"
                    variant="secondary"
                  >
                    Accept
                  </Button>
                  <Button
                    className="h-8 rounded-full px-3"
                    disabled={isUpdatePending}
                    onClick={() => onResendInvite(entry.id)}
                    type="button"
                    variant="secondary"
                  >
                    Resend
                  </Button>
                  <Button
                    className="h-8 rounded-full px-3 text-destructive hover:text-destructive"
                    disabled={isRemovePending}
                    onClick={() => onCancelInvite(entry.id)}
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border/80 bg-white/50 px-4 py-4 text-sm text-muted-foreground sm:text-[15px]">
            No email invites yet.
          </div>
        )}
      </div>

      <div className="rounded-[30px] bg-[linear-gradient(160deg,#fff2bf,#fffef8)] p-5 shadow-[0_20px_40px_rgba(63,52,25,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground sm:text-[15px]">Invite via QR</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Let people scan to join this group quickly.
            </p>
          </div>
          <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[var(--color-banana-900)]">
            Quick join
          </Badge>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_12rem] md:items-center">
          <div className="rounded-[24px] bg-white/70 px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
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
  )
}
