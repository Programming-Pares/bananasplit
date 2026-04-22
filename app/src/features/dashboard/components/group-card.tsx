import { ArrowUpRight, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type GroupCardProps = {
  id: string
  isActive: boolean
  isDone: boolean
  memberCount: number
  name: string
  netLabel: string
  openBalanceCount: number
  topBalance: string
  trend: 'positive' | 'negative'
}

export function GroupCard({
  id,
  isActive,
  isDone,
  memberCount,
  name,
  netLabel,
  openBalanceCount,
  topBalance,
  trend,
}: GroupCardProps) {
  return (
    <Link className="block" to={`/groups/${id}`}>
      <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-foreground sm:text-base">{name}</p>
                <Badge className="rounded-full bg-secondary px-2.5 text-[10px] text-secondary-foreground">
                  {openBalanceCount} open
                </Badge>
                <Badge className="rounded-full bg-secondary px-2.5 text-[10px] text-secondary-foreground">
                  {isDone ? 'Done' : isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="flex items-center gap-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                <Users className="size-4" />
                {memberCount} members
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:text-[13px]">
              {isDone ? 'Done' : 'Open'}
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>

          <div className="space-y-3">
            <p
              className={cn(
                'text-xl font-semibold sm:text-[1.35rem]',
                trend === 'positive'
                  ? 'text-emerald-600'
                  : 'text-orange-600',
              )}
            >
              {netLabel}
            </p>
            <div className="rounded-[20px] bg-secondary/45 px-3.5 py-3 text-sm leading-6 text-foreground sm:text-[15px]">
              {topBalance}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
