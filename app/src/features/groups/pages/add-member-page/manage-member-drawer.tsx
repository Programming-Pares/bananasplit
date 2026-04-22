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

type SelectedMember = {
  id: string
  name: string
} | undefined

type ManageMemberDrawerProps = {
  isRemovePending: boolean
  isRenamePending: boolean
  open: boolean
  selectedMember: SelectedMember
  selectedMemberName: string
  setSelectedMemberName: (value: string) => void
  onClose: () => void
  onOpenChange: (open: boolean) => void
  onRemove: () => Promise<void>
  onSave: () => Promise<void>
}

export function ManageMemberDrawer({
  isRemovePending,
  isRenamePending,
  open,
  selectedMember,
  selectedMemberName,
  setSelectedMemberName,
  onClose,
  onOpenChange,
  onRemove,
  onSave,
}: ManageMemberDrawerProps) {
  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">Manage member</DrawerTitle>
          <DrawerDescription>Rename or remove this member from the group.</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="member-rename">
              Member name
            </label>
            <Input
              className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
              id="member-rename"
              value={selectedMemberName}
              onChange={(event) => setSelectedMemberName(event.target.value)}
            />
          </div>
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={!selectedMember || selectedMemberName.trim().length === 0 || isRenamePending}
            onClick={onSave}
            type="button"
          >
            Save member
          </Button>
          <Button
            className="h-12 rounded-2xl text-destructive hover:text-destructive"
            disabled={!selectedMember || isRemovePending}
            onClick={onRemove}
            type="button"
            variant="secondary"
          >
            Remove member
          </Button>
          <Button className="h-12 rounded-2xl" onClick={onClose} type="button" variant="secondary">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
