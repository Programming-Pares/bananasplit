import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSearchQuery } from '@/lib/queries/use-app-queries'

function SearchSection({
  items,
  title,
}: {
  items: Array<{ id: string; subtitle: string; title: string; type: 'activity' | 'expense' | 'group' | 'member' }>
  title: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
        <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <Link
            className="block rounded-[22px] bg-secondary/50 px-4 py-3"
            key={`${item.type}-${item.id}`}
            to={
              item.type === 'group'
                ? `/groups/${item.id}`
                : item.type === 'expense'
                  ? `/expenses/${item.id}`
                  : item.type === 'activity'
                    ? '/activity'
                    : '/groups'
            }
          >
            <p className="text-[15px] font-medium text-foreground sm:text-base">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">{item.subtitle}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const { data } = useSearchQuery(query)

  return (
    <MobileShell>
      <ScreenHeader backHref="/" subtitle="Search groups, expenses, members, and activity." title="Search" />

      <div className="space-y-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-12 rounded-2xl border-white/80 bg-white/85 pl-11 shadow-none"
            placeholder="Search anything"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {!query.trim() ? (
          <EmptyState
            description="Type a group name, expense title, member, or activity term."
            icon={Search}
            title="Start searching"
          />
        ) : !data || data.groups.length + data.expenses.length + data.members.length + data.activities.length === 0 ? (
          <EmptyState
            description="No local results matched your search."
            icon={Search}
            title="No results"
          />
        ) : (
          <div className="space-y-4">
            <SearchSection items={data.groups} title="Groups" />
            <SearchSection items={data.expenses} title="Expenses" />
            <SearchSection items={data.members} title="Members" />
            <SearchSection items={data.activities} title="Activity" />
          </div>
        )}
      </div>
    </MobileShell>
  )
}
