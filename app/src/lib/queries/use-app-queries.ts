import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addGroupMember,
  createExpense,
  createGroup,
  createSettlement,
  getActivityData,
  getDashboardData,
  getExpenseById,
  getGroupById,
  getGroupsData,
  getSettingsData,
  getSelectableGroupsData,
  setGroupActiveState,
  setGroupDoneState,
  updateProfile,
  updateAuthState,
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
      queryClient.invalidateQueries({ queryKey: ['selectable-groups'] }),
      queryClient.invalidateQueries({ queryKey: ['activity'] }),
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

export function useUpdateProfileMutation() {
  const invalidate = useInvalidateAppData()

  return useMutation({
    mutationFn: updateProfile,
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
