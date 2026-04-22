import { useEffect, useMemo, useState } from 'react'
import { Bell, Check, ChevronDown, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useQuickActions } from '@/app/providers/quick-action-provider'
import activeBanner from '@/assets/dashboard-banner-active-state.png'
import emptyStateBanner from '@/assets/dashboard-banner-empty-state.png'
import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { RootPageHeader } from '@/components/common/root-page-header'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GroupCard } from '@/features/dashboard/components/group-card'
import { RecentActivityList } from '@/features/dashboard/components/recent-activity-list'
import { SummaryCard } from '@/features/dashboard/components/summary-card'
import { useDashboardQuery } from '@/lib/queries/use-app-queries'

export function DashboardPage() {
  const { data } = useDashboardQuery()
  const { openExpenseSheet } = useQuickActions()
  const [selectedGroupId, setSelectedGroupId] = useState(() => window.localStorage.getItem('dashboard:selected-group-id') ?? '')
  const dashboardGroups = data?.groups ?? []
  const activeGroups = useMemo(
    () => dashboardGroups.filter((group) => group.isActive),
    [dashboardGroups],
  )

  const hasGroups = dashboardGroups.length > 0
  const attentionGroups = dashboardGroups.filter((group) => group.openBalanceCount > 0)
  const bannerImage = hasGroups ? activeBanner : emptyStateBanner
  const bannerHeading = hasGroups
    ? 'Keep every shared expense clear'
    : 'Start your first shared money flow'
  const bannerText = hasGroups
    ? 'Track balances, add expenses, and settle up without the awkward math.'
    : 'Create a group, invite members, and log the first expense.'
  const groupFilterOptions = [{ id: '', name: 'All groups' }, ...activeGroups.map((group) => ({
    id: group.id,
    name: group.name,
  }))]
  const selectedGroupName =
    groupFilterOptions.find((group) => group.id === selectedGroupId)?.name ?? 'All groups'
  const selectedSummary = selectedGroupId
    ? data?.summaryByGroup?.[selectedGroupId] ?? data?.summary
    : data?.summary

  useEffect(() => {
    if (selectedGroupId.length > 0 && !activeGroups.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId('')
      return
    }

    window.localStorage.setItem('dashboard:selected-group-id', selectedGroupId)
  }, [activeGroups, selectedGroupId])

  if (!data || !selectedSummary) {
    return null
  }

  return (
    <MobileShell>
      <div className="space-y-5 sm:space-y-6">
        <div className="space-y-3.5 sm:space-y-4">
          <RootPageHeader
            actions={
              <>
                <Button asChild className="size-12 rounded-full" size="icon" variant="secondary">
                  <Link to="/search" aria-label="Search">
                    <Search className="size-5" />
                  </Link>
                </Button>
                <Button asChild className="relative size-12 rounded-full" size="icon" variant="secondary">
                  <Link to="/notifications" aria-label="Notifications">
                    <Bell className="size-5" />
                    {data.unreadNotificationCount > 0 ? (
                      <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--color-banana-900)]" />
                    ) : null}
                  </Link>
                </Button>
              </>
            }
            headingClassName="pt-3 sm:pt-5"
            subtitle={`Good day, ${data.userName}`}
            subtitleClassName="text-lg sm:text-xl"
            title="Your shared money, sorted."
            titleClassName="text-[3.1rem] leading-[0.96] sm:text-5xl sm:leading-[0.9]"
          />
          <div className="space-y-2.5 sm:space-y-3">
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  className="h-11 w-full justify-between rounded-2xl px-4 sm:hidden"
                  type="button"
                  variant="secondary"
                >
                  <span className="truncate">{selectedGroupName}</span>
                  <ChevronDown className="size-4 shrink-0" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="border-none bg-[#fffdf6]">
                <DrawerHeader className="px-4 pb-2 pt-5 text-left">
                  <DrawerTitle>Choose summary scope</DrawerTitle>
                  <DrawerDescription>
                    Switch between all active groups or a single group.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-2 px-4 pb-6">
                  {groupFilterOptions.map((group) => {
                    const isActive = selectedGroupId === group.id

                    return (
                      <DrawerClose key={`drawer-${group.id || 'all-groups'}`} asChild>
                        <Button
                          className="h-12 w-full justify-between rounded-2xl px-4"
                          onClick={() => setSelectedGroupId(group.id)}
                          type="button"
                          variant={isActive ? 'default' : 'secondary'}
                        >
                          <span className="truncate">{group.name}</span>
                          {isActive ? <Check className="size-4 shrink-0" /> : null}
                        </Button>
                      </DrawerClose>
                    )
                  })}
                </div>
              </DrawerContent>
            </Drawer>
            <div className="hidden gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex">
              {groupFilterOptions.map((group) => {
                const isActive = selectedGroupId === group.id

                return (
                  <Button
                    key={group.id || 'all-groups'}
                    className="shrink-0 rounded-full px-4"
                    onClick={() => setSelectedGroupId(group.id)}
                    type="button"
                    variant={isActive ? 'default' : 'secondary'}
                  >
                    {group.name}
                  </Button>
                )
              })}
            </div>
            <SummaryCard
              attention={selectedSummary.attention}
              net={selectedSummary.net}
              openBalances={selectedSummary.openBalances}
              owed={selectedSummary.owed}
              owes={selectedSummary.owes}
              scopeCountLabel={selectedSummary.scopeCountLabel}
              scopeLabel={selectedSummary.scopeLabel}
              totalExpenseCountLabel={selectedSummary.totalExpenseCountLabel}
              totalSpent={selectedSummary.totalSpent}
            />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[28px] border border-white/65 bg-[linear-gradient(160deg,#fff8de,#fffef8)] shadow-[0_18px_44px_rgba(86,66,17,0.14)]">
          <img
            alt="BananaSplit dashboard banner"
            className="block h-auto min-h-52 w-full object-cover object-center"
            loading="eager"
            src={bannerImage}
          />
          <div className="absolute inset-0 flex items-center justify-end bg-[linear-gradient(90deg,rgba(255,248,222,0)_24%,rgba(255,251,240,0.82)_48%,rgba(255,253,246,0.96)_72%,rgba(255,253,248,0.98)_100%)]">
            <div className="w-full max-w-72 px-4 py-4 text-right sm:max-w-80 sm:px-6 sm:py-5">
              <p className="text-balance text-xl font-semibold leading-tight text-[var(--color-banana-950)] sm:text-[1.7rem]">
                {bannerHeading}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(79,57,11,0.74)] sm:text-[15px]">
                {bannerText}
              </p>
              <div className="mt-4 flex justify-end">
                {hasGroups ? (
                  <Button
                    className="rounded-2xl px-5 shadow-[0_12px_28px_rgba(245,181,0,0.22)]"
                    onClick={() => openExpenseSheet()}
                    type="button"
                  >
                    Add expense
                  </Button>
                ) : (
                  <Button asChild className="rounded-2xl px-5 shadow-[0_12px_28px_rgba(245,181,0,0.22)]">
                    <Link to="/groups/new">Create group</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {!hasGroups ? (
          <div className="rounded-[28px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] px-5 py-5 shadow-[0_16px_32px_rgba(245,181,0,0.14)]">
            <p className="text-base font-medium text-foreground sm:text-[1.05rem]">Start your first shared money flow</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Create a group, add members, then log the first expense to see balances and notifications come to life.
            </p>
            <div className="mt-3.5 flex flex-wrap gap-2.5 sm:mt-4 sm:gap-3">
              <Button asChild className="rounded-2xl">
                <Link to="/groups/new">Create group</Link>
              </Button>
              <Button asChild className="rounded-2xl" variant="secondary">
                <Link to="/groups">View groups</Link>
              </Button>
            </div>
          </div>
        ) : null}

        <section className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Needs attention</h2>
            <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
              {data.summary.openBalances}
            </Badge>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {attentionGroups.length === 0 ? (
              <EmptyState
                description="Open balances between members will show up here when a group needs follow-up."
                icon={Bell}
                title="Nothing needs attention"
              />
            ) : (
              attentionGroups.map((group) => <GroupCard key={`attention-${group.id}`} {...group} />)
            )}
          </div>
        </section>

        <section className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Your groups</h2>
            <span className="text-sm leading-6 text-muted-foreground sm:text-[15px]">Balances first</span>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {!hasGroups ? (
              <EmptyState
                description="Create a group to start adding members, expenses, and balances."
                icon={Users}
                title="No groups yet"
              />
            ) : (
              data.groups.map((group) => <GroupCard key={group.id} {...group} />)
            )}
          </div>
        </section>

        <RecentActivityList items={data.recentActivity} />
      </div>
    </MobileShell>
  )
}
