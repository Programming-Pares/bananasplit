import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  addGroupMember,
  createBudget,
  createExpenseFromRecurring,
  createExpense,
  createGroup,
  createRecurringExpense,
  createSettlement,
  deleteBudget,
  deleteExpense,
  deleteGroup,
  markAllNotificationsRead,
  markNotificationRead,
  removeGroupMember,
  renameGroupMember,
  resetLocalData,
  setGroupActiveState,
  setGroupDoneState,
  toggleRecurringExpensePaused,
  updateAuthState,
  updateCurrency,
  updateExpense,
  updateGroup,
  updateInviteStatus,
  updateBudget,
  updateProfile,
} from '@/lib/repositories/mock-app-repository'

function useInvalidateAppData() {
  const queryClient = useQueryClient()

  return async (groupId?: string, expenseId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['groups'] }),
      queryClient.invalidateQueries({ queryKey: ['all-groups'] }),
      queryClient.invalidateQueries({ queryKey: ['selectable-groups'] }),
      queryClient.invalidateQueries({ queryKey: ['search'] }),
      queryClient.invalidateQueries({ queryKey: ['activity'] }),
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      queryClient.invalidateQueries({ queryKey: ['settings'] }),
      groupId
        ? queryClient.invalidateQueries({ queryKey: ['group', groupId] })
        : Promise.resolve(),
      expenseId
        ? queryClient.invalidateQueries({ queryKey: ['expense', expenseId] })
        : Promise.resolve(),
    ])
  }
}

export function useCreateGroupMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: createGroup,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useUpdateGroupMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: updateGroup,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useDeleteGroupMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useAddGroupMemberMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: addGroupMember,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useCreateBudgetMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: createBudget,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useUpdateBudgetMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: updateBudget,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useDeleteBudgetMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: deleteBudget,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useCreateExpenseMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: async (expenseId, variables) => {
      await invalidate(variables.groupId, expenseId)
    },
  })
}

export function useCreateSettlementMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: createSettlement,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useUpdateAuthStateMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: updateAuthState,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useRenameGroupMemberMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: renameGroupMember,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useRemoveGroupMemberMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: removeGroupMember,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useUpdateInviteStatusMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: updateInviteStatus,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useUpdateExpenseMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: async (data) => {
      await invalidate(data.groupId, data.expenseId)
    },
  })
}

export function useDeleteExpenseMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: async (data) => {
      await invalidate(data.groupId, data.expenseId)
    },
  })
}

export function useCreateRecurringExpenseMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: createRecurringExpense,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useToggleRecurringExpensePausedMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: toggleRecurringExpensePaused,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useCreateExpenseFromRecurringMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: createExpenseFromRecurring,
    onSuccess: async (expenseId) => {
      await invalidate()
      await invalidate(undefined, expenseId)
    },
  })
}

export function useUpdateCurrencyMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: updateCurrency,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useUpdateProfileMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useResetLocalDataMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: resetLocalData,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useSetGroupActiveStateMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: setGroupActiveState,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useSetGroupDoneStateMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: setGroupDoneState,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
    },
  })
}

export function useMarkNotificationReadMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await invalidate()
    },
  })
}

export function useMarkAllNotificationsReadMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await invalidate()
    },
  })
}
