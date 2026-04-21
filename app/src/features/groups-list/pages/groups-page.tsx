import { useState } from 'react'
import { ArrowDownAZ, CheckCheck, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/empty-state'
import { AppLogo } from '@/components/common/app-logo'
import { MobileShell } from '@/components/common/mobile-shell'
import { Button } from '@/components/ui/button'
import { GroupCard } from '@/features/dashboard/components/group-card'
import { useAllGroupsQuery } from '@/lib/queries/use-app-queries'

export function GroupsPage() {
  const { data } = useAllGroupsQuery()
  const [statusFilter, setStatusFilter] = useState<'open' | 'done' | 'all'>('open')
  const [sortBy, setSortBy] = useState<'attention' | 'name'>('attention')

  const filteredGroups = (data ?? [])
    .filter((group) => {
      if (statusFilter === 'all') {
        return true
      }

      return statusFilter === 'done' ? group.isDone : !group.isDone
    })
    .sort((left, right) => {
      if (sortBy === 'name') {
        return left.name.localeCompare(right.name)
      }

      return right.openBalanceCount - left.openBalanceCount
    })

  if (!data) {
    return null
  }

  return (
    <MobileShell>
      <div className="space-y-6">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <AppLogo compact />
            <Button asChild className="size-12 rounded-full" size="icon" variant="secondary">
              <Link to="/search" aria-label="Search">
                <Search className="size-5" />
              </Link>
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your shared spaces</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              Groups
            </h1>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Open', value: 'open' as const },
            { label: 'Completed', value: 'done' as const },
            { label: 'All', value: 'all' as const },
          ].map((item) => (
            <Button
              key={item.value}
              className="rounded-full px-4"
              onClick={() => setStatusFilter(item.value)}
              type="button"
              variant={statusFilter === item.value ? 'default' : 'secondary'}
            >
              {item.value === 'done' ? <CheckCheck className="size-4" /> : <Users className="size-4" />}
              {item.label}
            </Button>
          ))}
          <Button
            className="rounded-full px-4"
            onClick={() => setSortBy((current) => (current === 'attention' ? 'name' : 'attention'))}
            type="button"
            variant="secondary"
          >
            <ArrowDownAZ className="size-4" />
            Sort: {sortBy === 'attention' ? 'Attention' : 'Name'}
          </Button>
        </div>

        <div className="space-y-3">
          {filteredGroups.length === 0 ? (
            <EmptyState
              description="Try a different filter or create a new group to populate this view."
              icon={Users}
              title="No groups in this view"
            />
          ) : (
            filteredGroups.map((group) => <GroupCard key={group.id} {...group} />)
          )}
        </div>
      </div>
    </MobileShell>
  )
}
