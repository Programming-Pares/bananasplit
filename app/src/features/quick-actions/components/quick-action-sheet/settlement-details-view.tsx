import { Coins } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { formatAmountDisplay } from '@/features/quick-actions/components/calculator-amount'
import { shouldShowMemberAvatar } from '@/features/quick-actions/components/quick-action-sheet/member-avatar'
import { Pill } from '@/features/quick-actions/components/quick-action-sheet/shared'

type Member = {
  id: string
  name: string
}

type Group = {
  id: string
  name: string
}

type SettlementDetailsViewProps = {
  activeGroupName?: string
  amountInput: string
  effectiveGroupId: string
  isGroupLocked: boolean
  hasValidSettlement: boolean
  memberNameMap: Map<string, string>
  members: Member[]
  selectableGroups: Group[]
  settlementNote: string
  settlementPaidById: string
  settlementReceivedById: string
  onGroupChange: (groupId: string) => void
  onNoteChange: (value: string) => void
  onPaidByChange: (memberId: string) => void
  onReceivedByChange: (memberId: string) => void
}

export function SettlementDetailsView({
  activeGroupName,
  amountInput,
  effectiveGroupId,
  hasValidSettlement,
  isGroupLocked,
  memberNameMap,
  members,
  selectableGroups,
  settlementNote,
  settlementPaidById,
  settlementReceivedById,
  onGroupChange,
  onNoteChange,
  onPaidByChange,
  onReceivedByChange,
}: SettlementDetailsViewProps) {
  return (
    <div className="space-y-4 px-3.5 pb-2 sm:space-y-5 sm:px-4">
      <div className="grid gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-sm font-medium text-foreground sm:text-[15px]">Group</p>
          {isGroupLocked ? (
            <div className="rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none sm:text-[15px]">
              {activeGroupName}
            </div>
          ) : selectableGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectableGroups.map((group) => (
                <Pill
                  key={group.id}
                  active={effectiveGroupId === group.id}
                  onClick={() => onGroupChange(group.id)}
                >
                  {group.name}
                </Pill>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border/80 bg-white/50 px-4 py-3 text-sm text-muted-foreground sm:text-[15px]">
              No active groups available.
            </div>
          )}
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-sm font-medium text-foreground sm:text-[15px]">Paid by</p>
          <div className="flex flex-wrap gap-2">
            {members.map((member, index) => (
              <Pill
                key={member.id}
                active={settlementPaidById === member.id}
                onClick={() => onPaidByChange(member.id)}
                showAvatar={shouldShowMemberAvatar(index)}
              >
                {member.name}
              </Pill>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-sm font-medium text-foreground sm:text-[15px]">Received by</p>
          <div className="flex flex-wrap gap-2">
            {members.map((member, index) => (
              <Pill
                key={member.id}
                active={settlementReceivedById === member.id}
                onClick={() => onReceivedByChange(member.id)}
                showAvatar={shouldShowMemberAvatar(index)}
              >
                {member.name}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="settlement-note">
            Note
          </label>
          <Input
            className="mt-1 h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
            id="settlement-note"
            placeholder="Transfer after dinner"
            value={settlementNote}
            onChange={(event) => onNoteChange(event.target.value)}
          />
        </div>

        <div className="rounded-[26px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] p-3.5 sm:p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground sm:text-[15px]">
            <Coins className="size-4 text-[var(--color-banana-900)]" />
            Preview
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
            {memberNameMap.get(settlementPaidById) ?? settlementPaidById} pays{' '}
            {memberNameMap.get(settlementReceivedById) ?? settlementReceivedById}{' '}
            {formatAmountDisplay(amountInput)}.
          </p>
          {!hasValidSettlement ? (
            <p className="mt-2 text-sm text-destructive sm:text-[15px]">
              Paid by and received by must be different.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
