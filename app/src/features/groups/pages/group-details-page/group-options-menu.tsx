import {
  CheckCheck,
  Ellipsis,
  ToggleLeft,
  ToggleRight,
  UserPlus,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

type GroupOptionsMenuProps = {
  groupId: string
  isDone: boolean
  isActive: boolean
  isOpen: boolean
  menuActionPending: boolean
  onMarkDone: () => Promise<void>
  onToggleActive: () => Promise<void>
  setIsOpen: (updater: boolean | ((current: boolean) => boolean)) => void
}

export function GroupOptionsMenu({
  groupId,
  isDone,
  isActive,
  isOpen,
  menuActionPending,
  onMarkDone,
  onToggleActive,
  setIsOpen,
}: GroupOptionsMenuProps) {
  return (
    <div className="relative">
      <Button
        className="size-10 rounded-2xl"
        size="icon"
        variant="secondary"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Ellipsis className="size-4" />
        <span className="sr-only">Group options</span>
      </Button>
      {isOpen ? (
        <div className="absolute right-0 top-12 z-20 w-52 rounded-[24px] border border-white/80 bg-[#fffdf6] p-2 shadow-[0_20px_40px_rgba(63,52,25,0.12)]">
          <Button
            disabled={menuActionPending}
            asChild
            className="h-11 w-full justify-start rounded-2xl"
            variant="ghost"
          >
            <Link to={`/groups/${groupId}/members/new`}>
              <UserPlus className="size-4" />
              Add member
            </Link>
          </Button>
          <Button
            className="h-11 w-full justify-start rounded-2xl"
            disabled={menuActionPending || isDone}
            variant="ghost"
            onClick={onToggleActive}
            type="button"
          >
            {isActive ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
            {isActive ? 'Make inactive' : 'Make active'}
          </Button>
          <Button
            className="h-11 w-full justify-start rounded-2xl"
            variant="ghost"
            disabled={menuActionPending}
            onClick={onMarkDone}
            type="button"
          >
            <CheckCheck className="size-4" />
            {isDone ? 'Reopen group' : 'Mark as done'}
          </Button>
          <Button
            className="h-11 w-full justify-start rounded-2xl text-destructive hover:text-destructive"
            variant="ghost"
            type="button"
          >
            Delete group
          </Button>
        </div>
      ) : null}
    </div>
  )
}
