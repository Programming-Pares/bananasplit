import { EmptyState } from '@/components/common/empty-state'
import { AppLogo } from '@/components/common/app-logo'
import { MobileShell } from '@/components/common/mobile-shell'
import { Users } from 'lucide-react'
import { GroupCard } from '@/features/dashboard/components/group-card'
import { useGroupsQuery } from '@/lib/queries/use-app-queries'

export function GroupsPage() {
  const { data } = useGroupsQuery()

  if (!data) {
    return null
  }

  return (
    <MobileShell>
      <div className="space-y-6">
        <header className="space-y-4">
          <AppLogo compact />
          <div>
            <p className="text-sm text-muted-foreground">Your shared spaces</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              Groups
            </h1>
          </div>
        </header>

        <div className="space-y-3">
          {data.length === 0 ? (
            <EmptyState
              description="Create your first group to start tracking shared expenses."
              icon={Users}
              title="No groups yet"
            />
          ) : (
            data.map((group) => <GroupCard key={group.id} {...group} />)
          )}
        </div>
      </div>
    </MobileShell>
  )
}
