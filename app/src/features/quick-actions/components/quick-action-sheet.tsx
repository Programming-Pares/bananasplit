import { useMemo, useState } from 'react'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { CalculatorAmountInput } from '@/features/quick-actions/components/calculator-amount-input'
import {
  formatAmountDisplay,
  parseAmountToCents,
} from '@/features/quick-actions/components/calculator-amount'
import { ExpenseDetailsView } from '@/features/quick-actions/components/quick-action-sheet/expense-details-view'
import { QuickActionSheetFooter } from '@/features/quick-actions/components/quick-action-sheet/sheet-footer'
import { SettlementDetailsView } from '@/features/quick-actions/components/quick-action-sheet/settlement-details-view'
import {
  ActionChooser,
  EmptyGroupState,
} from '@/features/quick-actions/components/quick-action-sheet/shared'
import {
  useCreateExpenseMutation,
  useCreateSettlementMutation,
  useGroupQuery,
  useSelectableGroupsQuery,
} from '@/lib/queries/use-app-queries'

type QuickActionSheetProps = {
  isOpen: boolean
  onClose: () => void
  onOpenChange: (open: boolean) => void
  onSelectExpense: (groupId?: string) => void
  onSelectSettlement: (groupId?: string) => void
  selectedGroupId?: string | null
  view: 'actions' | 'expense' | 'settlement'
}

type AdjustmentEntry = {
  amountCents: number
  id: string
  memberId: string
}

export function QuickActionSheet({
  isOpen,
  onClose,
  onOpenChange,
  onSelectExpense,
  onSelectSettlement,
  selectedGroupId,
  view,
}: QuickActionSheetProps) {
  const selectableGroupsQuery = useSelectableGroupsQuery()
  const createExpenseMutation = useCreateExpenseMutation()
  const createSettlementMutation = useCreateSettlementMutation()
  const [expenseStep, setExpenseStep] = useState<'amount' | 'details'>('amount')
  const [currentGroupId, setCurrentGroupId] = useState(selectedGroupId ?? '')
  const [amountInput, setAmountInput] = useState('')
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expensePaidById, setExpensePaidById] = useState('')
  const [expenseParticipantIds, setExpenseParticipantIds] = useState<string[]>([])
  const [expenseAdjustments, setExpenseAdjustments] = useState<AdjustmentEntry[]>([])
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)
  const [adjustmentMemberId, setAdjustmentMemberId] = useState('')
  const [adjustmentAmountInput, setAdjustmentAmountInput] = useState('')
  const [settlementPaidById, setSettlementPaidById] = useState('')
  const [settlementReceivedById, setSettlementReceivedById] = useState('')
  const [settlementNote, setSettlementNote] = useState('')

  const actionView = view === 'settlement' ? 'settlement' : 'expense'
  const actionTitle = actionView === 'expense' ? 'Add expense' : 'Settle up'
  const amountPrompt =
    actionView === 'expense' ? 'Enter expense amount' : 'Enter payment amount'
  const amountCents = parseAmountToCents(amountInput)
  const hasValidAmount = amountCents > 0
  const isGroupLocked = Boolean(selectedGroupId)
  const effectiveGroupId = isGroupLocked ? (selectedGroupId ?? '') : currentGroupId
  const activeGroup = useGroupQuery(effectiveGroupId).data
  const selectableGroups = selectableGroupsQuery.data ?? []
  const members = activeGroup?.memberEntries
  const memberEntries = useMemo(() => members ?? [], [members])
  const memberNameMap = useMemo(
    () => new Map(memberEntries.map((member) => [member.id, member.name])),
    [memberEntries],
  )
  const allSelected = memberEntries.length > 0 && expenseParticipantIds.length === memberEntries.length
  const totalAdjustments = expenseAdjustments.reduce(
    (sum, item) => sum + item.amountCents,
    0,
  )
  const hasValidExpense =
    Boolean(activeGroup) &&
    expenseTitle.trim().length > 0 &&
    expensePaidById.length > 0 &&
    expenseParticipantIds.length > 0 &&
    totalAdjustments <= amountCents
  const hasValidSettlement =
    Boolean(activeGroup) &&
    settlementPaidById.length > 0 &&
    settlementReceivedById.length > 0 &&
    settlementPaidById !== settlementReceivedById
  const activeMutationPending =
    createExpenseMutation.isPending || createSettlementMutation.isPending

  const resetAdjustment = () => {
    setIsAdjustmentOpen(false)
    setAdjustmentMemberId('')
    setAdjustmentAmountInput('')
  }

  const handleGroupChange = (nextGroupId: string) => {
    setCurrentGroupId(nextGroupId)
    setExpensePaidById('')
    setExpenseParticipantIds([])
    setExpenseAdjustments([])
    setSettlementPaidById('')
    setSettlementReceivedById('')
  }

  return (
    <Drawer
      direction="bottom"
      modal
      open={isOpen}
      shouldScaleBackground
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          onClose()
        }
      }}
    >
      <DrawerContent className="mx-auto h-[100svh] max-h-[100svh] max-w-3xl border-none bg-[#fffdf6] data-[vaul-drawer-direction=bottom]:top-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-none sm:data-[vaul-drawer-direction=bottom]:rounded-t-[32px]">
        <DrawerHeader className="space-y-1 px-3.5 pb-2 pt-4 text-left sm:px-4 sm:pt-5">
          <DrawerTitle className="text-xl font-semibold">
            {view === 'actions' ? 'Quick actions' : actionTitle}
          </DrawerTitle>
          <DrawerDescription>
            {view === 'actions'
              ? 'Choose what you want to do next.'
              : expenseStep === 'amount'
                ? amountPrompt
                : formatAmountDisplay(amountInput)}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {view === 'actions' ? (
            <ActionChooser
              onSelectExpense={() => onSelectExpense()}
              onSelectGroup={() => {
                onClose()
                window.location.assign('/groups/new')
              }}
              onSelectSettlement={() => onSelectSettlement()}
            />
          ) : expenseStep === 'amount' ? (
            <div className="px-3.5 pb-2 sm:px-4">
              <CalculatorAmountInput
                amountInput={amountInput}
                title={amountPrompt}
                onChange={setAmountInput}
              />
            </div>
          ) : !activeGroup ? (
            <EmptyGroupState />
          ) : actionView === 'expense' ? (
            <ExpenseDetailsView
              activeGroupName={activeGroup.name}
              adjustmentAmountInput={adjustmentAmountInput}
              adjustmentMemberId={adjustmentMemberId}
              amountCents={amountCents}
              amountInput={amountInput}
              allSelected={allSelected}
              effectiveGroupId={effectiveGroupId}
              expenseAdjustments={expenseAdjustments}
              expensePaidById={expensePaidById}
              expenseParticipantIds={expenseParticipantIds}
              expenseTitle={expenseTitle}
              isAdjustmentOpen={isAdjustmentOpen}
              isGroupLocked={isGroupLocked}
              memberNameMap={memberNameMap}
              members={memberEntries}
              selectableGroups={selectableGroups}
              totalAdjustments={totalAdjustments}
              onAdjustmentAmountChange={setAdjustmentAmountInput}
              onAdjustmentMemberChange={setAdjustmentMemberId}
              onCloseAdjustment={resetAdjustment}
              onConfirmAdjustment={() => {
                setExpenseAdjustments((current) => [
                  ...current,
                  {
                    amountCents: parseAmountToCents(adjustmentAmountInput),
                    id: crypto.randomUUID(),
                    memberId: adjustmentMemberId,
                  },
                ])
                resetAdjustment()
              }}
              onGroupChange={handleGroupChange}
              onOpenAdjustment={() => setIsAdjustmentOpen(true)}
              onPaidByChange={setExpensePaidById}
              onParticipantChange={(next) =>
                setExpenseParticipantIds((current) =>
                  typeof next === 'function' ? next(current) : next,
                )
              }
              onTitleChange={setExpenseTitle}
            />
          ) : (
            <SettlementDetailsView
              activeGroupName={activeGroup.name}
              amountInput={amountInput}
              effectiveGroupId={effectiveGroupId}
              hasValidSettlement={hasValidSettlement}
              isGroupLocked={isGroupLocked}
              memberNameMap={memberNameMap}
              members={memberEntries}
              selectableGroups={selectableGroups}
              settlementNote={settlementNote}
              settlementPaidById={settlementPaidById}
              settlementReceivedById={settlementReceivedById}
              onGroupChange={handleGroupChange}
              onNoteChange={setSettlementNote}
              onPaidByChange={setSettlementPaidById}
              onReceivedByChange={setSettlementReceivedById}
            />
          )}
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-3.5 pb-5 pt-3.5 sm:px-4 sm:pb-6 sm:pt-4">
          <QuickActionSheetFooter
            actionView={actionView}
            activeMutationPending={activeMutationPending}
            expenseStep={expenseStep}
            hasValidAmount={hasValidAmount}
            hasValidExpense={hasValidExpense}
            hasValidSettlement={hasValidSettlement}
            view={view}
            onClose={onClose}
            onConfirmExpense={async () => {
              if (!activeGroup) {
                return
              }

              await createExpenseMutation.mutateAsync({
                adjustmentEntries: expenseAdjustments.map((item) => ({
                  amountCents: item.amountCents,
                  memberId: item.memberId,
                })),
                amountCents,
                groupId: activeGroup.id,
                note: null,
                paidByMemberId: expensePaidById,
                participantMemberIds: expenseParticipantIds,
                title: expenseTitle.trim(),
              })
              onClose()
            }}
            onConfirmSettlement={async () => {
              if (!activeGroup) {
                return
              }

              await createSettlementMutation.mutateAsync({
                amountCents,
                groupId: activeGroup.id,
                note: settlementNote.trim().length > 0 ? settlementNote.trim() : null,
                paidByMemberId: settlementPaidById,
                receivedByMemberId: settlementReceivedById,
              })
              onClose()
            }}
            onContinue={() => setExpenseStep('details')}
            onSelectExpense={() => onSelectExpense()}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
