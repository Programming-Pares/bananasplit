import { Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useQuickActions } from '@/app/providers/quick-action-context'
import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupBalanceCard } from '@/features/groups/components/group-balance-card'
import { GroupExpenseList } from '@/features/groups/components/group-expense-list'
import { BalancesTab } from '@/features/groups/pages/group-details-page/balances-tab'
import { GroupMemberChipList } from '@/features/groups/pages/group-details-page/group-member-chip-list'
import { GroupOptionsMenu } from '@/features/groups/pages/group-details-page/group-options-menu'
import { MembersTab } from '@/features/groups/pages/group-details-page/members-tab'
import { RecurringExpenseDrawer } from '@/features/groups/pages/group-details-page/recurring-expense-drawer'
import { RecurringExpensesCard } from '@/features/groups/pages/group-details-page/recurring-expenses-card'
import { TimelineTab } from '@/features/groups/pages/group-details-page/timeline-tab'
import {
  useCreateExpenseFromRecurringMutation,
  useCreateRecurringExpenseMutation,
  useGroupQuery,
  useSetGroupActiveStateMutation,
  useSetGroupDoneStateMutation,
  useToggleRecurringExpensePausedMutation,
} from '@/lib/queries/use-app-queries'

export function GroupDetailsPage() {
  const { groupId = '' } = useParams()
  const { data: group } = useGroupQuery(groupId)

  if (!group) {
    return null
  }

  return <GroupDetailsPageContent key={group.id} group={group} groupId={groupId} />
}

function GroupDetailsPageContent({
  group,
  groupId,
}: {
  group: NonNullable<ReturnType<typeof useGroupQuery>['data']>
  groupId: string
}) {
  const { openExpenseSheet, openSettlementSheet } = useQuickActions()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRecurringOpen, setIsRecurringOpen] = useState(false)
  const [recurringTitle, setRecurringTitle] = useState('')
  const [recurringAmount, setRecurringAmount] = useState('')
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly'>('monthly')
  const [recurringPaidById, setRecurringPaidById] = useState('')
  const [recurringParticipantIds, setRecurringParticipantIds] = useState<string[]>([])
  const setGroupActiveStateMutation = useSetGroupActiveStateMutation()
  const setGroupDoneStateMutation = useSetGroupDoneStateMutation()
  const createRecurringExpenseMutation = useCreateRecurringExpenseMutation()
  const toggleRecurringExpensePausedMutation = useToggleRecurringExpensePausedMutation()
  const createExpenseFromRecurringMutation = useCreateExpenseFromRecurringMutation()

  const canCreateRecurring =
    recurringTitle.trim().length > 0 &&
    Number.parseFloat(recurringAmount) > 0 &&
    recurringPaidById.length > 0 &&
    recurringParticipantIds.length > 0
  const menuActionPending =
    setGroupActiveStateMutation.isPending || setGroupDoneStateMutation.isPending

  return (
    <MobileShell>
      <ScreenHeader
        action={
          <GroupOptionsMenu
            groupId={groupId}
            isActive={group.isActive}
            isDone={group.isDone}
            isOpen={isMenuOpen}
            menuActionPending={menuActionPending}
            onMarkDone={async () => {
              await setGroupDoneStateMutation.mutateAsync({
                groupId,
                isDone: !group.isDone,
              })
              setIsMenuOpen(false)
            }}
            onToggleActive={async () => {
              await setGroupActiveStateMutation.mutateAsync({
                groupId,
                isActive: !group.isActive,
              })
              setIsMenuOpen(false)
            }}
            setIsOpen={setIsMenuOpen}
          />
        }
        backHref="/"
        subtitle={`${group.memberCount} members`}
        title={group.name}
      />

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground sm:text-xs">
            {group.isDone ? 'Done' : 'Open'}
          </Badge>
          <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground sm:text-xs">
            {group.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <GroupMemberChipList members={group.members} />
        <GroupBalanceCard items={group.balanceItems} />

        <div className="grid grid-cols-2 gap-3">
          <Button
            className="h-12 rounded-2xl"
            disabled={group.isDone}
            onClick={() => openExpenseSheet(groupId)}
            type="button"
          >
            <Plus className="size-4" />
            Expense
          </Button>
          <Button
            className="h-12 rounded-2xl"
            disabled={group.isDone}
            variant="secondary"
            onClick={() => openSettlementSheet(groupId)}
            type="button"
          >
            <Wallet className="size-4" />
            Settle up
          </Button>
        </div>

        <Tabs className="space-y-4" defaultValue="expenses">
          <TabsList className="grid h-12 w-full grid-cols-4 rounded-2xl bg-secondary/80 p-1">
            <TabsTrigger className="rounded-xl" value="expenses">Expenses</TabsTrigger>
            <TabsTrigger className="rounded-xl" value="balances">Balances</TabsTrigger>
            <TabsTrigger className="rounded-xl" value="members">Members</TabsTrigger>
            <TabsTrigger className="rounded-xl" value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-2 space-y-3" value="expenses">
            <RecurringExpensesCard
              canEdit={!group.isDone}
              isCreateNowPending={createExpenseFromRecurringMutation.isPending}
              isPausePending={toggleRecurringExpensePausedMutation.isPending}
              items={group.recurringExpenses}
              onCreateNew={() => {
                setRecurringTitle('')
                setRecurringAmount('')
                setRecurringFrequency('monthly')
                setRecurringPaidById('')
                setRecurringParticipantIds([])
                setIsRecurringOpen(true)
              }}
              onCreateNow={(recurringExpenseId) =>
                createExpenseFromRecurringMutation.mutate({ recurringExpenseId })
              }
              onTogglePaused={(recurringExpenseId, isPaused) =>
                toggleRecurringExpensePausedMutation.mutate({
                  isPaused,
                  recurringExpenseId,
                })
              }
            />
            <GroupExpenseList items={group.expenses} />
          </TabsContent>

          <TabsContent className="mt-0 space-y-3" value="balances">
            <BalancesTab
              balanceItems={group.balanceItems}
              settlementSuggestions={group.settlementSuggestions}
            />
          </TabsContent>

          <TabsContent className="mt-0 space-y-3" value="members">
            <MembersTab memberBalances={group.memberBalances} />
          </TabsContent>

          <TabsContent className="mt-0 space-y-3" value="timeline">
            <TimelineTab items={group.timeline} />
          </TabsContent>
        </Tabs>
      </div>

      <RecurringExpenseDrawer
        amount={recurringAmount}
        canCreate={canCreateRecurring}
        frequency={recurringFrequency}
        isPending={createRecurringExpenseMutation.isPending}
        open={isRecurringOpen}
        paidById={recurringPaidById}
        participantIds={recurringParticipantIds}
        title={recurringTitle}
        members={group.memberEntries}
        onAmountChange={setRecurringAmount}
        onClose={() => setIsRecurringOpen(false)}
        onFrequencyChange={setRecurringFrequency}
        onOpenChange={setIsRecurringOpen}
        onPaidByChange={setRecurringPaidById}
        onParticipantToggle={(memberId) =>
          setRecurringParticipantIds((current) =>
            current.includes(memberId)
              ? current.filter((item) => item !== memberId)
              : [...current, memberId],
          )
        }
        onSave={async () => {
          await createRecurringExpenseMutation.mutateAsync({
            amountCents: Math.round(Number.parseFloat(recurringAmount) * 100),
            frequency: recurringFrequency,
            groupId,
            paidByMemberId: recurringPaidById,
            participantMemberIds: recurringParticipantIds,
            title: recurringTitle,
          })
          setIsRecurringOpen(false)
        }}
        onTitleChange={setRecurringTitle}
      />
    </MobileShell>
  )
}
