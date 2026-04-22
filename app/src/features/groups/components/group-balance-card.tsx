import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type GroupBalanceCardProps = {
  items: string[]
}

function parseBalanceItem(item: string) {
  const match = item.match(/^(.*?) owed ₱([\d.,]+) to (.*)$/)

  if (!match) {
    return null
  }

  const [, from, amount, to] = match
  const involvesYou = from === 'You' || to === 'You'

  return {
    amount: `₱${amount}`,
    from,
    involvesYou,
    to,
  }
}

export function GroupBalanceCard({ items }: GroupBalanceCardProps) {
  const visibleItems = items.filter((item) => !/₱0(?:\.00)?\b/i.test(item))
  const parsedItems = visibleItems
    .map(parseBalanceItem)
    .filter((item): item is NonNullable<ReturnType<typeof parseBalanceItem>> => item !== null)
    .sort((left, right) => Number(right.involvesYou) - Number(left.involvesYou))

  return (
    <Card className="border-0 bg-[linear-gradient(155deg,#fff7d3,#fffef8)] shadow-[0_16px_32px_rgba(245,181,0,0.16)]">
      <CardHeader className="pb-3">
        <CardTitle>Group balance summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {parsedItems.length > 0 ? (
            parsedItems.map((item) => (
              <div
                className="rounded-[24px] bg-white/80 px-4 py-4 shadow-[0_12px_24px_rgba(63,52,25,0.06)]"
                key={`${item.from}-${item.amount}-${item.to}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {item.involvesYou ? (
                        <Badge
                          className={cn(
                            'rounded-full px-2.5 py-1 text-[10px]',
                            item.from === 'You'
                              ? 'bg-[#fff1e2] text-[#9a4b16]'
                              : 'bg-[#eef9ee] text-[#246b34]',
                          )}
                        >
                          {item.from === 'You' ? 'You owe' : 'You are owed'}
                        </Badge>
                      ) : (
                        <Badge className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground">
                          Between members
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm leading-6 text-foreground sm:text-[15px]">
                      <span className="font-semibold">{item.from}</span>
                      <span className="text-muted-foreground"> owed </span>
                      <span className="font-semibold text-[var(--color-banana-950)]">
                        {item.amount}
                      </span>
                      <span className="text-muted-foreground"> to </span>
                      <span className="font-semibold">{item.to}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[22px] bg-white/75 px-4 py-3 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              No open balances.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
