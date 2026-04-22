import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

type ResetDataDrawerProps = {
  isPending: boolean
  open: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function ResetDataDrawer({
  isPending,
  open,
  onConfirm,
  onOpenChange,
}: ResetDataDrawerProps) {
  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">Reset local data</DrawerTitle>
          <DrawerDescription>
            This clears groups, expenses, settlements, activity, and local account state on this device.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 px-4 pb-2">
          <div className="rounded-[24px] bg-white/75 px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
            After reset, the app will keep only the minimum local bootstrap profile needed to run again.
          </div>
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            Reset local data
          </Button>
          <Button
            className="h-12 rounded-2xl"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
