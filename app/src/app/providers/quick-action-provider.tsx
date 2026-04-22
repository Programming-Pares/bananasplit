import { type PropsWithChildren, useMemo, useState } from 'react'

import {
  QuickActionContext,
  type QuickActionContextValue,
  type SheetView,
} from '@/app/providers/quick-action-context'
import { QuickActionSheet } from '@/features/quick-actions/components/quick-action-sheet'

export function QuickActionProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<SheetView>('actions')
  const [groupId, setGroupId] = useState<string | null>(null)
  const [sheetInstance, setSheetInstance] = useState(0)

  const value = useMemo<QuickActionContextValue>(
    () => ({
      closeSheet: () => {
        setIsOpen(false)
        setGroupId(null)
        setView('actions')
      },
      openActionSheet: () => {
        setGroupId(null)
        setView('actions')
        setSheetInstance((current) => current + 1)
        setIsOpen(true)
      },
      openExpenseSheet: (nextGroupId) => {
        setGroupId(nextGroupId ?? null)
        setView('expense')
        setSheetInstance((current) => current + 1)
        setIsOpen(true)
      },
      openSettlementSheet: (nextGroupId) => {
        setGroupId(nextGroupId ?? null)
        setView('settlement')
        setSheetInstance((current) => current + 1)
        setIsOpen(true)
      },
    }),
    [],
  )

  return (
    <QuickActionContext.Provider value={value}>
      {children}
      <QuickActionSheet
        key={`${sheetInstance}-${view}-${groupId ?? 'none'}`}
        isOpen={isOpen}
        onClose={value.closeSheet}
        onOpenChange={setIsOpen}
        onSelectExpense={value.openExpenseSheet}
        onSelectSettlement={value.openSettlementSheet}
        selectedGroupId={groupId}
        view={view}
      />
    </QuickActionContext.Provider>
  )
}
