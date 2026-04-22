import { createContext, useContext } from 'react'

export type SheetView = 'actions' | 'expense' | 'settlement'

export type QuickActionContextValue = {
  closeSheet: () => void
  openActionSheet: () => void
  openExpenseSheet: (groupId?: string) => void
  openSettlementSheet: (groupId?: string) => void
}

export const QuickActionContext = createContext<QuickActionContextValue | null>(null)

export function useQuickActions() {
  const context = useContext(QuickActionContext)

  if (!context) {
    throw new Error('useQuickActions must be used within QuickActionProvider')
  }

  return context
}
