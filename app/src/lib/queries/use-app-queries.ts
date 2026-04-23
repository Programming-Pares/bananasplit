import { useQuery } from '@tanstack/react-query'

import {
  getActivityData,
  getAllGroupsData,
  getDashboardData,
  getExpenseById,
  getGroupById,
  getGroupsData,
  getNotificationsData,
  getSelectableGroupsData,
  getSettingsData,
  searchApp,
} from '@/lib/repositories/mock-app-repository'

export { useAddGroupMemberMutation } from '@/lib/queries/use-app-mutations'
export { useCreateBudgetMutation } from '@/lib/queries/use-app-mutations'
export { useCreateExpenseFromRecurringMutation } from '@/lib/queries/use-app-mutations'
export { useCreateExpenseMutation } from '@/lib/queries/use-app-mutations'
export { useCreateGroupMutation } from '@/lib/queries/use-app-mutations'
export { useCreateRecurringExpenseMutation } from '@/lib/queries/use-app-mutations'
export { useCreateSettlementMutation } from '@/lib/queries/use-app-mutations'
export { useDeleteBudgetMutation } from '@/lib/queries/use-app-mutations'
export { useDeleteExpenseMutation } from '@/lib/queries/use-app-mutations'
export { useDeleteGroupMutation } from '@/lib/queries/use-app-mutations'
export { useMarkAllNotificationsReadMutation } from '@/lib/queries/use-app-mutations'
export { useMarkNotificationReadMutation } from '@/lib/queries/use-app-mutations'
export { useRemoveGroupMemberMutation } from '@/lib/queries/use-app-mutations'
export { useRenameGroupMemberMutation } from '@/lib/queries/use-app-mutations'
export { useResetLocalDataMutation } from '@/lib/queries/use-app-mutations'
export { useSetGroupActiveStateMutation } from '@/lib/queries/use-app-mutations'
export { useSetGroupDoneStateMutation } from '@/lib/queries/use-app-mutations'
export { useToggleRecurringExpensePausedMutation } from '@/lib/queries/use-app-mutations'
export { useUpdateAuthStateMutation } from '@/lib/queries/use-app-mutations'
export { useUpdateBudgetMutation } from '@/lib/queries/use-app-mutations'
export { useUpdateCurrencyMutation } from '@/lib/queries/use-app-mutations'
export { useUpdateExpenseMutation } from '@/lib/queries/use-app-mutations'
export { useUpdateGroupMutation } from '@/lib/queries/use-app-mutations'
export { useUpdateInviteStatusMutation } from '@/lib/queries/use-app-mutations'
export { useUpdateProfileMutation } from '@/lib/queries/use-app-mutations'

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
