import { ReceiptText, Wallet } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Card, CardContent } from '@/components/ui/card'
import { useActivityQuery } from '@/lib/queries/use-app-queries'

export function ActivityPage() {
  const { data } = useActivityQuery()

  if (!data) {
    return null
  }

  return (
    <MobileShell>
      <ScreenHeader subtitle="All expense and settlement moves" title="Activity" />

      <div className="space-y-3">
        {data.length === 0 ? (
          <EmptyState
            description="Expenses and settlements will appear here once you start using your groups."
            icon={ReceiptText}
            title="No activity yet"
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
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{item.groupName}</p>
                    <p className="text-xs text-muted-foreground">{item.when}</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
                  <p className="text-sm font-semibold text-foreground">{item.amount}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </MobileShell>
  )
}
