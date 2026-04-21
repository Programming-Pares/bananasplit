import { ReceiptText, Wallet } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type ActivityItem = {
  id: string
  text: string
  type: 'expense' | 'settlement'
}

type RecentActivityListProps = {
  items: ActivityItem[]
}

export function RecentActivityList({ items }: RecentActivityListProps) {
  return (
    <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <EmptyState
            className="border-0 bg-transparent px-0 py-4 shadow-none"
            description="Recent expenses and settlements will appear here."
            icon={ReceiptText}
            title="No activity yet"
          />
        ) : (
          items.map((item) => (
            <div className="flex items-start gap-3" key={item.id}>
              <div className="mt-0.5 rounded-2xl bg-secondary p-2 text-secondary-foreground">
                {item.type === 'expense' ? (
                  <ReceiptText className="size-4" />
                ) : (
                  <Wallet className="size-4" />
                )}
              </div>
              <div className="min-w-0 space-y-2">
                <Badge className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground">
                  {item.type === 'expense' ? 'Expense' : 'Settlement'}
                </Badge>
                <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
