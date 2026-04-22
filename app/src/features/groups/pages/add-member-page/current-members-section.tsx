import { Users } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function shouldShowMemberAvatar(index: number) {
  return index % 2 === 0
}

type CurrentMembersSectionProps = {
  members: Array<{ id: string; name: string }>
  onSelectMember: (memberId: string, memberName: string) => void
}

export function CurrentMembersSection({
  members,
  onSelectMember,
}: CurrentMembersSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-foreground sm:text-[15px]">Current members</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map((member, index) => (
          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-sm text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] sm:text-[15px]"
            key={member.id}
            onClick={() => onSelectMember(member.id, member.name)}
            type="button"
          >
            {shouldShowMemberAvatar(index) ? (
              <Avatar className="size-6 border border-white/70">
                <AvatarFallback className="bg-secondary text-[10px] font-semibold text-secondary-foreground">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : null}
            {member.name}
          </button>
        ))}
      </div>
    </section>
  )
}
