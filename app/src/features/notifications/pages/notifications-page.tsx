import { Bell, ReceiptText, Wallet } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '@/lib/queries/use-app-queries'

export function NotificationsPage() {
  const { data } = useNotificationsQuery()
  const markNotificationReadMutation = useMarkNotificationReadMutation()
  const markAllNotificationsReadMutation = useMarkAllNotificationsReadMutation()
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'settlement'>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all')
  const unreadCount = (data ?? []).filter((item) => item.isRead === false).length
  const filteredItems = (data ?? []).filter((item) => {
    const typeMatches = typeFilter === 'all' ? true : item.type === typeFilter
    const readMatches =
      readFilter === 'all'
        ? true
        : readFilter === 'read'
          ? item.isRead
          : !item.isRead

    return typeMatches && readMatches
  })

  if (!data) {
    return null
  }

  return (
    <MobileShell>
      <ScreenHeader
        action={
          unreadCount > 0 ? (
            <Button
              className="rounded-2xl px-4"
              disabled={markAllNotificationsReadMutation.isPending}
              onClick={() => markAllNotificationsReadMutation.mutate()}
              type="button"
              variant="secondary"
            >
              Mark all read
            </Button>
          ) : undefined
        }
        backHref="/"
        subtitle="Recent money updates that need your attention."
        title="Notifications"
      />

      <div className="flex flex-wrap gap-2">
        {(['all', 'expense', 'settlement'] as const).map((item) => (
          <Button
            key={item}
            className="rounded-full px-4"
            onClick={() => setTypeFilter(item)}
            type="button"
            variant={typeFilter === item ? 'default' : 'secondary'}
          >
            {item === 'all' ? 'All types' : item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
        {(['all', 'unread', 'read'] as const).map((item) => (
          <Button
            key={item}
            className="rounded-full px-4"
            onClick={() => setReadFilter(item)}
            type="button"
            variant={readFilter === item ? 'default' : 'secondary'}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <EmptyState
            description="Notifications will appear here when expenses and settlements are recorded."
            icon={Bell}
            title="No notifications yet"
          />
        ) : (
          filteredItems.map((item) => (
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
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      className={`w-fit rounded-full px-2.5 py-1 text-[10px] ${
                        item.isRead
                          ? 'bg-white/80 text-muted-foreground'
                          : 'bg-[var(--color-banana-200)] text-[var(--color-banana-950)]'
                      }`}
                    >
                      {item.isRead ? 'Read' : 'Unread'}
                    </Badge>
                    <button
                      className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      disabled={markNotificationReadMutation.isPending}
                      onClick={() =>
                        markNotificationReadMutation.mutate({
                          activityId: item.id,
                          isRead: !item.isRead,
                        })
                      }
                      type="button"
                    >
                      Mark as {item.isRead ? 'unread' : 'read'}
                    </button>
                  </div>
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
