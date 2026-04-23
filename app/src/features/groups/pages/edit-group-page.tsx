import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGroupQuery, useUpdateGroupMutation } from '@/lib/queries/use-app-queries'

export function EditGroupPage() {
  const { groupId = '' } = useParams()
  const { data: group } = useGroupQuery(groupId)

  if (!group) {
    return null
  }

  return <EditGroupPageContent key={group.id} group={group} />
}

function EditGroupPageContent({
  group,
}: {
  group: NonNullable<ReturnType<typeof useGroupQuery>['data']>
}) {
  const navigate = useNavigate()
  const updateGroupMutation = useUpdateGroupMutation()
  const [groupName, setGroupName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const normalizedGroupName = groupName.trim()
  const normalizedDescription = description.trim()
  const canSave = normalizedGroupName.length > 0
  const hasChanges =
    normalizedGroupName !== group.name || normalizedDescription !== group.description

  return (
    <MobileShell>
      <ScreenHeader
        backHref={`/groups/${group.id}`}
        subtitle="Update the group basics. Budgets stay inside the group page."
        title="Edit group"
      />

      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!canSave || !hasChanges) {
            return
          }

          setErrorMessage(null)

          try {
            await updateGroupMutation.mutateAsync({
              description: normalizedDescription,
              groupId: group.id,
              name: normalizedGroupName,
            })
            navigate(`/groups/${group.id}`)
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : 'Unable to save group changes.',
            )
          }
        }}
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="group-name">
            Group name
          </label>
          <Input
            className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
            id="group-name"
            value={groupName}
            onChange={(event) => {
              setGroupName(event.target.value)
              setErrorMessage(null)
            }}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="group-description">
            Description
          </label>
          <textarea
            className="min-h-32 w-full rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-[15px]"
            id="group-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value)
              setErrorMessage(null)
            }}
          />
        </div>

        {errorMessage ? (
          <div className="rounded-[24px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <Button
          className="h-12 w-full rounded-2xl"
          disabled={!canSave || !hasChanges || updateGroupMutation.isPending}
          type="submit"
        >
          {updateGroupMutation.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </MobileShell>
  )
}
