import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type BreakdownItem = {
  adjustmentCents?: number
  amount: string
  member: string
  memberId?: string
}

type ExpenseBreakdownCardProps = {
  items: BreakdownItem[]
}

export function ExpenseBreakdownCard({ items }: ExpenseBreakdownCardProps) {
  return (
    <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div className="flex items-center justify-between rounded-[22px] bg-secondary/65 px-4 py-3" key={item.member}>
            <span className="text-sm text-foreground">{item.member}</span>
            <span className="text-sm font-semibold text-foreground">{item.amount}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
