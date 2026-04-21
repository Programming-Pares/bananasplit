import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addGroupMember,
  createExpenseFromRecurring,
  createExpense,
  createGroup,
  createRecurringExpense,
  createSettlement,
  deleteExpense,
  getActivityData,
  getAllGroupsData,
  getDashboardData,
  getExpenseById,
  getGroupById,
  getGroupsData,
  getNotificationsData,
  getSettingsData,
  getSelectableGroupsData,
  markAllNotificationsRead,
  markNotificationRead,
  renameGroupMember,
  resetLocalData,
  searchApp,
  setGroupActiveState,
  setGroupDoneState,
  toggleRecurringExpensePaused,
  updateInviteStatus,
  updateExpense,
  updateCurrency,
  updateProfile,
  updateAuthState,
  removeGroupMember,
} from '@/lib/repositories/mock-app-repository'

export function useActivityQuery() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: getActivityData,
  })
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  })
}

export function useGroupsQuery() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: getGroupsData,
  })
}

export function useSelectableGroupsQuery() {
  return useQuery({
    queryKey: ['selectable-groups'],
    queryFn: getSelectableGroupsData,
  })
}

export function useGroupQuery(groupId: string) {
  return useQuery({
    enabled: groupId.length > 0,
    queryKey: ['group', groupId],
    queryFn: () => getGroupById(groupId),
  })
}

export function useExpenseQuery(expenseId: string) {
  return useQuery({
    enabled: expenseId.length > 0,
    queryKey: ['expense', expenseId],
    queryFn: () => getExpenseById(expenseId),
  })
}

export function useAllGroupsQuery() {
  return useQuery({
    queryKey: ['all-groups'],
    queryFn: getAllGroupsData,
  })
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsData,
  })
}

export function useSearchQuery(query: string) {
  return useQuery({
    enabled: query.trim().length > 0,
    queryKey: ['search', query],
    queryFn: () => searchApp(query),
  })
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettingsData,
  })
}

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

export function useAddGroupMemberMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: addGroupMember,
    onSuccess: async (_data, variables) => {
      await invalidate(variables.groupId)
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
    onSuccess: async (expenseId) => {
      await invalidate()
      await invalidate(undefined, expenseId)
    },
  })
}

export function useDeleteExpenseMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: async () => {
      await invalidate()
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
