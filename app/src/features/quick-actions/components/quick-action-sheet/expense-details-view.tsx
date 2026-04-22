import { Input } from '@/components/ui/input'
import { shouldShowMemberAvatar } from '@/features/quick-actions/components/quick-action-sheet/member-avatar'
import { AdjustmentDrawer } from '@/features/quick-actions/components/quick-action-sheet/adjustment-drawer'
import { ExpenseAdjustmentsPanel } from '@/features/quick-actions/components/quick-action-sheet/expense-adjustments-panel'
import { Pill } from '@/features/quick-actions/components/quick-action-sheet/shared'
import { cn } from '@/lib/utils'

type Member = {
  id: string
  name: string
}

type Group = {
  id: string
  name: string
}

type Adjustment = {
  amountCents: number
  id: string
  memberId: string
}

type ExpenseDetailsViewProps = {
  activeGroupName?: string
  adjustmentAmountInput: string
  adjustmentMemberId: string
  amountInput: string
  allSelected: boolean
  expenseAdjustments: Adjustment[]
  expensePaidById: string
  expenseParticipantIds: string[]
  expenseTitle: string
  isAdjustmentOpen: boolean
  isGroupLocked: boolean
  members: Member[]
  selectableGroups: Group[]
  totalAdjustments: number
  amountCents: number
  effectiveGroupId: string
  memberNameMap: Map<string, string>
  onAdjustmentAmountChange: (value: string) => void
  onAdjustmentMemberChange: (memberId: string) => void
  onCloseAdjustment: () => void
  onConfirmAdjustment: () => void
  onGroupChange: (groupId: string) => void
  onOpenAdjustment: () => void
  onPaidByChange: (memberId: string) => void
  onParticipantChange: (updater: string[] | ((current: string[]) => string[])) => void
  onTitleChange: (value: string) => void
}

export function ExpenseDetailsView({
  activeGroupName,
  adjustmentAmountInput,
  adjustmentMemberId,
  amountCents,
  amountInput,
  allSelected,
  effectiveGroupId,
  expenseAdjustments,
  expensePaidById,
  expenseParticipantIds,
  expenseTitle,
  isAdjustmentOpen,
  isGroupLocked,
  memberNameMap,
  members,
  selectableGroups,
  totalAdjustments,
  onAdjustmentAmountChange,
  onAdjustmentMemberChange,
  onCloseAdjustment,
  onConfirmAdjustment,
  onGroupChange,
  onOpenAdjustment,
  onPaidByChange,
  onParticipantChange,
  onTitleChange,
}: ExpenseDetailsViewProps) {
  return (
    <>
      <div className="space-y-4 px-3.5 pb-2 sm:space-y-5 sm:px-4">
        <div className="grid gap-4">
          <div>
            <label className="mb-3 block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="expense-title">
              Title
            </label>
            <Input
              className="mt-1 h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
              id="expense-title"
              placeholder="Dinner"
              value={expenseTitle}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground sm:text-[15px]">Paid by</p>
            <div className="flex flex-wrap gap-2">
              {members.map((member, index) => (
                <Pill
                  key={member.id}
                  active={expensePaidById === member.id}
                  onClick={() => onPaidByChange(member.id)}
                  showAvatar={shouldShowMemberAvatar(index)}
                >
                  {member.name}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[minmax(0,9fr)_minmax(3.5rem,1fr)] gap-2">
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-sm font-medium text-foreground sm:text-[15px]">Split with</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-border bg-white/80 px-3 py-2 text-sm text-foreground transition-colors hover:bg-white sm:text-[15px]"
                    onClick={() => onParticipantChange(members.map((member) => member.id))}
                    type="button"
                  >
                    All members
                  </button>
                  <button
                    className="rounded-full border border-border bg-white/80 px-3 py-2 text-sm text-foreground transition-colors hover:bg-white sm:text-[15px]"
                    onClick={() => onParticipantChange(expensePaidById ? [expensePaidById] : [])}
                    type="button"
                  >
                    Only payer
                  </button>
                  <button
                    className="rounded-full border border-border bg-white/80 px-3 py-2 text-sm text-foreground transition-colors hover:bg-white sm:text-[15px]"
                    onClick={() =>
                      onParticipantChange(
                        members
                          .filter((member) => member.id !== expensePaidById)
                          .map((member) => member.id),
                      )
                    }
                    type="button"
                  >
                    Exclude payer
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {members.map((member, index) => {
                    const active = expenseParticipantIds.includes(member.id)

                    return (
                      <Pill
                        key={member.id}
                        active={active}
                        showAvatar={shouldShowMemberAvatar(index)}
                        onClick={() => {
                          if (allSelected) {
                            onParticipantChange(
                              members
                                .filter((item) => item.id !== member.id)
                                .map((item) => item.id),
                            )
                            return
                          }

                          if (active) {
                            if (expenseParticipantIds.length === 1) {
                              return
                            }

                            onParticipantChange((current) =>
                              current.filter((item) => item !== member.id),
                            )
                            return
                          }

                          onParticipantChange((current) => [...current, member.id])
                        }}
                      >
                        {member.name}
                      </Pill>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-start justify-end pt-6 sm:pt-7">
                <button
                  className={cn(
                    'h-10 w-full rounded-full border text-sm font-medium transition-colors sm:text-[15px]',
                    allSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-white/80 text-foreground hover:bg-white',
                  )}
                  onClick={() => onParticipantChange(members.map((member) => member.id))}
                  type="button"
                >
                  All
                </button>
              </div>
            </div>
          </div>

          <ExpenseAdjustmentsPanel
            amountCents={amountCents}
            amountInput={amountInput}
            expenseAdjustments={expenseAdjustments}
            expenseParticipantIds={expenseParticipantIds}
            memberNameMap={memberNameMap}
            totalAdjustments={totalAdjustments}
            onOpenAdjustment={onOpenAdjustment}
          />
        </div>
      </div>

      <AdjustmentDrawer
        adjustmentAmountInput={adjustmentAmountInput}
        adjustmentMemberId={adjustmentMemberId}
        members={members}
        open={isAdjustmentOpen}
        onAmountChange={onAdjustmentAmountChange}
        onConfirm={onConfirmAdjustment}
        onMemberChange={onAdjustmentMemberChange}
        onOpenChange={() => undefined}
        onReset={onCloseAdjustment}
      />
    </>
  )
}
