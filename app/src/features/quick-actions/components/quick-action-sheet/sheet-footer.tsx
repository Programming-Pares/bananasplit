import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type QuickActionSheetFooterProps = {
  actionView: 'expense' | 'settlement'
  activeMutationPending: boolean
  expenseStep: 'amount' | 'details'
  hasValidAmount: boolean
  hasValidExpense: boolean
  hasValidSettlement: boolean
  view: 'actions' | 'expense' | 'settlement'
  onClose: () => void
  onConfirmExpense: () => Promise<void>
  onConfirmSettlement: () => Promise<void>
  onContinue: () => void
  onSelectExpense: () => void
}

export function QuickActionSheetFooter({
  actionView,
  activeMutationPending,
  expenseStep,
  hasValidAmount,
  hasValidExpense,
  hasValidSettlement,
  view,
  onClose,
  onConfirmExpense,
  onConfirmSettlement,
  onContinue,
  onSelectExpense,
}: QuickActionSheetFooterProps) {
  return (
    <>
      {view === 'actions' ? (
        <Button className="h-12 rounded-2xl" onClick={onSelectExpense} type="button">
          <Plus className="size-4" />
          Add expense
        </Button>
      ) : expenseStep === 'amount' ? (
        <Button
          className="h-12 rounded-2xl"
          disabled={!hasValidAmount}
          onClick={onContinue}
          type="button"
        >
          Continue
        </Button>
      ) : actionView === 'expense' ? (
        <Button
          className="h-12 rounded-2xl"
          disabled={!hasValidExpense || activeMutationPending}
          onClick={onConfirmExpense}
          type="button"
        >
          Confirm expense
        </Button>
      ) : (
        <Button
          className="h-12 rounded-2xl"
          disabled={!hasValidSettlement || activeMutationPending}
          onClick={onConfirmSettlement}
          type="button"
        >
          Confirm settlement
        </Button>
      )}
      <Button className="h-12 rounded-2xl" variant="secondary" onClick={onClose} type="button">
        Close
      </Button>
    </>
  )
}
