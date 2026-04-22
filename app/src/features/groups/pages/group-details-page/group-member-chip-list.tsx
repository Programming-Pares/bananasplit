import { Avatar, AvatarFallback } from '@/components/ui/avatar'

function shouldShowMemberAvatar(index: number) {
  return index % 2 === 0
}

export function GroupMemberChipList({ members }: { members: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {members.map((member, index) => (
        <div
          className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-sm text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] sm:text-[15px]"
          key={member}
        >
          {shouldShowMemberAvatar(index) ? (
            <Avatar className="size-6 border border-white/70">
              <AvatarFallback className="bg-secondary text-[10px] font-semibold text-secondary-foreground">
                {member.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : null}
          {member}
        </div>
      ))}
    </div>
  )
}
