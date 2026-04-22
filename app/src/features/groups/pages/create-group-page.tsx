import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateGroupMutation } from '@/lib/queries/use-app-queries'

export function CreateGroupPage() {
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const createGroupMutation = useCreateGroupMutation()
  const canCreateGroup = groupName.trim().length > 0

  return (
    <MobileShell>
      <ScreenHeader
        backHref="/groups"
        subtitle="Start with the basics. Members can be added later from the group page."
        title="Create group"
      />

      <div className="space-y-6">
        <div className="space-y-3">
          <label
            className="block text-sm font-medium text-foreground sm:text-[15px]"
            htmlFor="group-name"
          >
            Group name
          </label>
          <Input
            className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
            id="group-name"
            placeholder="Beach Trip"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label
            className="block text-sm font-medium text-foreground sm:text-[15px]"
            htmlFor="group-description"
          >
            Description
          </label>
          <textarea
            className="min-h-32 w-full rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-[15px]"
            id="group-description"
            placeholder="Weekend food trip, apartment bills, or any shared spending context."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="grid gap-3 pt-2">
          <Button
            className="h-12 rounded-2xl"
            disabled={!canCreateGroup || createGroupMutation.isPending}
            onClick={async () => {
              const groupId = await createGroupMutation.mutateAsync({
                description: description.trim(),
                name: groupName.trim(),
              })
              navigate(`/groups/${groupId}`)
            }}
            type="button"
          >
            Create group
          </Button>
        </div>
      </div>
    </MobileShell>
  )
}
