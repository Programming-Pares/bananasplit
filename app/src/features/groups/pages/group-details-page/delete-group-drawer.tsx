import { useState } from 'react'

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

type DeleteGroupDrawerProps = {
  groupName: string
  isPending: boolean
  open: boolean
  onConfirm: () => Promise<void>
  onOpenChange: (open: boolean) => void
}

export function DeleteGroupDrawer({
  groupName,
  isPending,
  open,
  onConfirm,
  onOpenChange,
}: DeleteGroupDrawerProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const normalizedGroupName = groupName.trim()
  const canConfirm = confirmationText.trim() === normalizedGroupName

  return (
    <Drawer
      direction="bottom"
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setConfirmationText('')
          setErrorMessage(null)
        }
      }}
    >
      <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">Delete group</DrawerTitle>
          <DrawerDescription>
            This will remove the group, its budgets, expenses, settlements, and timeline entries.
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={async (event) => {
            event.preventDefault()
            if (!canConfirm) {
              return
            }

            setErrorMessage(null)

            try {
              await onConfirm()
              setConfirmationText('')
            } catch (error) {
              setErrorMessage(
                error instanceof Error ? error.message : 'Unable to delete this group.',
              )
            }
          }}
        >
          <div className="space-y-4 px-4 pb-2">
            <div className="rounded-[24px] bg-white/70 px-4 py-4 text-sm leading-6 text-muted-foreground">
              Type <span className="font-medium text-foreground">{normalizedGroupName}</span> to confirm permanent deletion.
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground" htmlFor="delete-group-confirmation">
                Confirm group name
              </label>
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                id="delete-group-confirmation"
                value={confirmationText}
                onChange={(event) => {
                  setConfirmationText(event.target.value)
                  setErrorMessage(null)
                }}
              />
            </div>

            {errorMessage ? (
              <div className="rounded-[24px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          <Button
            className="h-12 rounded-2xl"
            disabled={!canConfirm || isPending}
            type="submit"
            variant="destructive"
          >
            {isPending ? 'Deleting...' : 'Delete group'}
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
        </form>
      </DrawerContent>
    </Drawer>
  )
}
