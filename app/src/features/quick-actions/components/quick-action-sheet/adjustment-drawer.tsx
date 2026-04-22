import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { CalculatorAmountInput } from '@/features/quick-actions/components/calculator-amount-input'
import { formatAmountDisplay, parseAmountToCents } from '@/features/quick-actions/components/calculator-amount'
import { shouldShowMemberAvatar } from '@/features/quick-actions/components/quick-action-sheet/member-avatar'
import { Pill } from '@/features/quick-actions/components/quick-action-sheet/shared'

type Member = {
  id: string
  name: string
}

type AdjustmentDrawerProps = {
  adjustmentAmountInput: string
  adjustmentMemberId: string
  members: Member[]
  open: boolean
  onAmountChange: (value: string) => void
  onConfirm: () => void
  onMemberChange: (memberId: string) => void
  onOpenChange: (open: boolean) => void
  onReset: () => void
}

export function AdjustmentDrawer({
  adjustmentAmountInput,
  adjustmentMemberId,
  members,
  open,
  onAmountChange,
  onConfirm,
  onMemberChange,
  onOpenChange,
  onReset,
}: AdjustmentDrawerProps) {
  return (
    <Drawer
      direction="bottom"
      modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onReset()
        }
        onOpenChange(nextOpen)
      }}
    >
      <DrawerContent className="mx-auto h-[100svh] max-h-[100svh] max-w-3xl border-none bg-[#fffdf6] data-[vaul-drawer-direction=bottom]:top-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-none sm:data-[vaul-drawer-direction=bottom]:rounded-t-[32px]">
        <DrawerHeader className="space-y-1 px-3.5 pb-2 pt-4 text-left sm:px-4 sm:pt-5">
          <DrawerTitle className="text-xl font-semibold">Adjustments</DrawerTitle>
          <DrawerDescription>
            {adjustmentAmountInput
              ? formatAmountDisplay(adjustmentAmountInput)
              : 'Select member and enter amount'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-2 sm:px-4">
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-sm font-medium text-foreground sm:text-[15px]">User selection</p>
              <div className="flex flex-wrap gap-2">
                {members.map((member, index) => (
                  <Pill
                    key={member.id}
                    active={adjustmentMemberId === member.id}
                    showAvatar={shouldShowMemberAvatar(index)}
                    onClick={() => onMemberChange(member.id)}
                  >
                    {member.name}
                  </Pill>
                ))}
              </div>
            </div>

            <CalculatorAmountInput
              amountInput={adjustmentAmountInput}
              title="Adjustment amount"
              onChange={onAmountChange}
            />
          </div>
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={
              adjustmentMemberId.length === 0 ||
              parseAmountToCents(adjustmentAmountInput) <= 0
            }
            onClick={onConfirm}
            type="button"
          >
            Confirm
          </Button>
          <Button className="h-12 rounded-2xl" variant="secondary" onClick={onReset} type="button">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
