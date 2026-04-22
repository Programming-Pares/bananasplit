import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'

type GroupMember = {
  id: string
  name: string
}

type RecurringExpenseDrawerProps = {
  amount: string
  canCreate: boolean
  frequency: 'weekly' | 'monthly'
  isPending: boolean
  open: boolean
  paidById: string
  participantIds: string[]
  title: string
  members: GroupMember[]
  onAmountChange: (value: string) => void
  onClose: () => void
  onFrequencyChange: (value: 'weekly' | 'monthly') => void
  onOpenChange: (open: boolean) => void
  onPaidByChange: (memberId: string) => void
  onParticipantToggle: (memberId: string) => void
  onSave: () => Promise<void>
  onTitleChange: (value: string) => void
}

export function RecurringExpenseDrawer({
  amount,
  canCreate,
  frequency,
  isPending,
  open,
  paidById,
  participantIds,
  title,
  members,
  onAmountChange,
  onClose,
  onFrequencyChange,
  onOpenChange,
  onPaidByChange,
  onParticipantToggle,
  onSave,
  onTitleChange,
}: RecurringExpenseDrawerProps) {
  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">Recurring expense</DrawerTitle>
          <DrawerDescription>Create a reusable weekly or monthly template for this group.</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="recurring-title">
              Title
            </label>
            <Input
              className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
              id="recurring-title"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="recurring-amount">
              Amount
            </label>
            <Input
              className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
              id="recurring-amount"
              inputMode="decimal"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['weekly', 'monthly'] as const).map((item) => (
              <Button
                key={item}
                className="rounded-full px-4"
                onClick={() => onFrequencyChange(item)}
                type="button"
                variant={frequency === item ? 'default' : 'secondary'}
              >
                {item === 'weekly' ? 'Weekly' : 'Monthly'}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground sm:text-[15px]">Paid by</p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <Button
                  key={member.id}
                  className="rounded-full px-4"
                  onClick={() => onPaidByChange(member.id)}
                  type="button"
                  variant={paidById === member.id ? 'default' : 'secondary'}
                >
                  {member.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground sm:text-[15px]">Participants</p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const active = participantIds.includes(member.id)

                return (
                  <Button
                    key={member.id}
                    className="rounded-full px-4"
                    onClick={() => onParticipantToggle(member.id)}
                    type="button"
                    variant={active ? 'default' : 'secondary'}
                  >
                    {member.name}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={!canCreate || isPending}
            onClick={onSave}
            type="button"
          >
            Save recurring expense
          </Button>
          <Button className="h-12 rounded-2xl" onClick={onClose} type="button" variant="secondary">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
