import { createBrowserRouter } from 'react-router-dom'

import { ActivityPage } from '@/features/activity/pages/activity-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { ExpenseDetailsPage } from '@/features/expenses/pages/expense-details-page'
import { AddMemberPage } from '@/features/groups/pages/add-member-page'
import { CreateGroupPage } from '@/features/groups/pages/create-group-page'
import { GroupDetailsPage } from '@/features/groups/pages/group-details-page'
import { GroupsPage } from '@/features/groups-list/pages/groups-page'
import { NotificationsPage } from '@/features/notifications/pages/notifications-page'
import { OnboardingPage } from '@/features/onboarding/pages/onboarding-page'
import { SearchPage } from '@/features/search/pages/search-page'
import { ProfilePage } from '@/features/settings/pages/profile-page'
import { SettingsPage } from '@/features/settings/pages/settings-page'
import { NotFoundPage } from '@/pages/not-found-page'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    path: '/groups',
    element: <GroupsPage />,
  },
  {
    path: '/groups/new',
    element: <CreateGroupPage />,
  },
  {
    path: '/groups/:groupId/members/new',
    element: <AddMemberPage />,
  },
  {
    path: '/groups/:groupId',
    element: <GroupDetailsPage />,
  },
  {
    path: '/activity',
    element: <ActivityPage />,
  },
  {
    path: '/expenses/:expenseId',
    element: <ExpenseDetailsPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/search',
    element: <SearchPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
