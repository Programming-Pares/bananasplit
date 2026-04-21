import { Bell, ReceiptText, Wallet } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useActivityQuery } from '@/lib/queries/use-app-queries'

export function NotificationsPage() {
  const { data } = useActivityQuery()

  if (!data) {
    return null
  }

  return (
    <MobileShell>
      <ScreenHeader
        backHref="/"
        subtitle="Recent money updates that need your attention."
        title="Notifications"
      />

      <div className="space-y-3">
        {data.length === 0 ? (
          <EmptyState
            description="Notifications will appear here when expenses and settlements are recorded."
            icon={Bell}
            title="No notifications yet"
          />
        ) : (
          data.map((item) => (
            <Card
              className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]"
              key={item.id}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-2xl bg-secondary p-2 text-secondary-foreground">
                  {item.type === 'expense' ? (
                    <ReceiptText className="size-4" />
                  ) : (
                    <Wallet className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{item.groupName}</p>
                    <p className="text-xs text-muted-foreground">{item.when}</p>
                  </div>
                  <Badge className="w-fit rounded-full bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground">
                    {item.type === 'expense' ? 'Expense update' : 'Settlement update'}
                  </Badge>
                  <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Bell className="size-4 text-[var(--color-banana-900)]" />
                    {item.amount}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </MobileShell>
  )
}
