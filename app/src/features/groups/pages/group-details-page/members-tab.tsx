import { Users } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'

type MemberBalance = {
  directLines: string[]
  id: string
  name: string
  netLabel: string
  owed: string
  owes: string
}

export function MembersTab({ memberBalances }: { memberBalances: MemberBalance[] }) {
  return memberBalances.length === 0 ? (
    <EmptyState
      description="Add members to see each person's net position and direct balance lines."
      icon={Users}
      title="No member balances yet"
    />
  ) : (
    <>
      {memberBalances.map((member) => (
        <div className="rounded-[24px] bg-card/90 p-4 shadow-[0_12px_30px_rgba(63,52,25,0.08)]" key={member.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-foreground sm:text-base">{member.name}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">{member.netLabel}</p>
            </div>
            <div className="text-right text-sm sm:text-[15px]">
              <p className="text-muted-foreground">Owes {member.owes}</p>
              <p className="mt-1 text-foreground">Is owed {member.owed}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {member.directLines.length === 0 ? (
              <div className="rounded-[20px] bg-secondary/35 px-4 py-3 text-sm text-muted-foreground sm:text-[15px]">
                No direct balances for this member yet.
              </div>
            ) : (
              member.directLines.map((line) => (
                <div className="rounded-[20px] bg-secondary/35 px-4 py-3 text-sm text-foreground sm:text-[15px]" key={`${member.id}-${line}`}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </>
  )
}
