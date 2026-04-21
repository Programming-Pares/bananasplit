import { Bell, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AppLogo } from '@/components/common/app-logo'
import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GroupCard } from '@/features/dashboard/components/group-card'
import { RecentActivityList } from '@/features/dashboard/components/recent-activity-list'
import { SummaryCard } from '@/features/dashboard/components/summary-card'
import { useDashboardQuery } from '@/lib/queries/use-app-queries'

export function DashboardPage() {
  const { data } = useDashboardQuery()

  if (!data) {
    return null
  }

  const attentionGroups = data.groups.filter((group) => group.openBalanceCount > 0)

  return (
    <MobileShell>
      <div className="space-y-6">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <AppLogo compact />
            <Button asChild className="size-12 rounded-full" size="icon" variant="secondary">
              <Link to="/notifications" aria-label="Notifications">
                <Bell className="size-5" />
              </Link>
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Good day, {data.userName}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              Your shared money, sorted.
            </h1>
          </div>
        </header>

        <SummaryCard
          attention={data.summary.attention}
          net={data.summary.net}
          openBalances={data.summary.openBalances}
          owed={data.summary.owed}
          owes={data.summary.owes}
        />

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Needs attention</h2>
            <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
              {data.summary.openBalances}
            </Badge>
          </div>
          <div className="space-y-3">
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

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Your groups</h2>
            <span className="text-sm text-muted-foreground">Balances first</span>
          </div>
          <div className="space-y-3">
            {data.groups.length === 0 ? (
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
