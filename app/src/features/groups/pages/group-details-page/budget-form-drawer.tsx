import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type BudgetFormDrawerProps = {
  amountInput: string
  isPending: boolean
  name: string
  open: boolean
  title: string
  onAmountChange: (value: string) => void
  onClose: () => void
  onNameChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSave: () => Promise<void>
}

export function BudgetFormDrawer({
  amountInput,
  isPending,
  name,
  open,
  title,
  onAmountChange,
  onClose,
  onNameChange,
  onOpenChange,
  onSave,
}: BudgetFormDrawerProps) {
  const canSave = name.trim().length > 0 && Number.parseFloat(amountInput) > 0

  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">{title}</DrawerTitle>
          <DrawerDescription>
            Create a spend bucket for this group and assign expenses to it later.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-5 px-4 pb-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground" htmlFor="budget-name">
              Budget name
            </label>
            <Input
              className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
              id="budget-name"
              placeholder="Food"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground" htmlFor="budget-amount">
              Budget amount
            </label>
            <Input
              className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
              id="budget-amount"
              inputMode="decimal"
              placeholder="5000"
              value={amountInput}
              onChange={(event) => onAmountChange(event.target.value)}
            />
          </div>
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={!canSave || isPending}
            onClick={onSave}
            type="button"
          >
            Save budget
          </Button>
          <Button className="h-12 rounded-2xl" onClick={onClose} type="button" variant="secondary">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
