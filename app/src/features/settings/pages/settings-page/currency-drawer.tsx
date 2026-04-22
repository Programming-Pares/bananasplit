import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

type CurrencyDrawerProps = {
  currentCurrency: string
  isPending: boolean
  open: boolean
  selectedCurrency: string
  setSelectedCurrency: (currency: string) => void
  onOpenChange: (open: boolean) => void
  onSave: () => Promise<void>
}

export function CurrencyDrawer({
  currentCurrency,
  isPending,
  open,
  selectedCurrency,
  setSelectedCurrency,
  onOpenChange,
  onSave,
}: CurrencyDrawerProps) {
  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">Currency</DrawerTitle>
          <DrawerDescription>Choose the local currency used by this device.</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 px-4 pb-2">
          <button
            className={`flex w-full items-center justify-between rounded-[24px] border px-4 py-4 text-left transition-colors ${
              selectedCurrency === 'PHP'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-white/80 bg-white/85 text-foreground'
            }`}
            onClick={() => setSelectedCurrency('PHP')}
            type="button"
          >
            <div>
              <p className="text-sm font-medium sm:text-[15px]">Philippine Peso</p>
              <p className={`mt-1 text-sm sm:text-[15px] ${selectedCurrency === 'PHP' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                PHP · Peso
              </p>
            </div>
            <span className="text-sm font-medium sm:text-[15px]">Available</span>
          </button>
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={selectedCurrency === currentCurrency || isPending}
            onClick={onSave}
            type="button"
          >
            Save currency
          </Button>
          <Button
            className="h-12 rounded-2xl"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="secondary"
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
