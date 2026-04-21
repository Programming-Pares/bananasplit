import { CheckCheck, Ellipsis, Plus, ToggleLeft, ToggleRight, UserPlus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useQuickActions } from '@/app/providers/quick-action-provider'
import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupBalanceCard } from '@/features/groups/components/group-balance-card'
import { GroupExpenseList } from '@/features/groups/components/group-expense-list'
import {
  useGroupQuery,
  useSetGroupActiveStateMutation,
  useSetGroupDoneStateMutation,
} from '@/lib/queries/use-app-queries'

function shouldShowMemberAvatar(index: number) {
  return index % 2 === 0
}

export function GroupDetailsPage() {
  const { groupId = '' } = useParams()
  const { data: group } = useGroupQuery(groupId)
  const { openExpenseSheet, openSettlementSheet } = useQuickActions()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const setGroupActiveStateMutation = useSetGroupActiveStateMutation()
  const setGroupDoneStateMutation = useSetGroupDoneStateMutation()

  if (!group) {
    return null
  }

  const menuActionPending =
    setGroupActiveStateMutation.isPending || setGroupDoneStateMutation.isPending

  return (
    <MobileShell>
      <ScreenHeader
        action={
          <div className="relative">
            <Button
              className="size-10 rounded-2xl"
              size="icon"
              variant="secondary"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              <Ellipsis className="size-4" />
              <span className="sr-only">Group options</span>
            </Button>
            {isMenuOpen ? (
              <div className="absolute right-0 top-12 z-20 w-52 rounded-[24px] border border-white/80 bg-[#fffdf6] p-2 shadow-[0_20px_40px_rgba(63,52,25,0.12)]">
                <Button
                  disabled={menuActionPending}
                  asChild
                  className="h-11 w-full justify-start rounded-2xl"
                  variant="ghost"
                >
                  <Link to={`/groups/${groupId}/members/new`}>
                    <UserPlus className="size-4" />
                    Add member
                  </Link>
                </Button>
                <Button
                  className="h-11 w-full justify-start rounded-2xl"
                  disabled={menuActionPending || group.isDone}
                  variant="ghost"
                  onClick={async () => {
                    await setGroupActiveStateMutation.mutateAsync({
                      groupId,
                      isActive: !group.isActive,
                    })
                    setIsMenuOpen(false)
                  }}
                  type="button"
                >
                  {group.isActive ? (
                    <ToggleRight className="size-4" />
                  ) : (
                    <ToggleLeft className="size-4" />
                  )}
                  {group.isActive ? 'Make inactive' : 'Make active'}
                </Button>
                <Button
                  className="h-11 w-full justify-start rounded-2xl"
                  variant="ghost"
                  disabled={menuActionPending}
                  onClick={async () => {
                    await setGroupDoneStateMutation.mutateAsync({
                      groupId,
                      isDone: !group.isDone,
                    })
                    setIsMenuOpen(false)
                  }}
                  type="button"
                >
                  <CheckCheck className="size-4" />
                  {group.isDone ? 'Reopen group' : 'Mark as done'}
                </Button>
                <Button
                  className="h-11 w-full justify-start rounded-2xl text-destructive hover:text-destructive"
                  variant="ghost"
                  type="button"
                >
                  Delete group
                </Button>
              </div>
            ) : null}
          </div>
        }
        backHref="/"
        subtitle={`${group.memberCount} members`}
        title={group.name}
      />

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
            {group.isDone ? 'Done' : 'Open'}
          </Badge>
          <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
            {group.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {group.members.map((member, index) => (
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-sm text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)]"
              key={member}
            >
              {shouldShowMemberAvatar(index) ? (
                <Avatar className="size-6 border border-white/70">
                  <AvatarFallback className="bg-secondary text-[10px] font-semibold text-secondary-foreground">
                    {member.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : null}
              {member}
            </div>
          ))}
        </div>

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
          <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-secondary/80 p-1">
            <TabsTrigger className="rounded-xl" value="expenses">
              Expenses
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="balances">
              Balances
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-2 space-y-3" value="expenses">
            <GroupExpenseList items={group.expenses} />
          </TabsContent>
          <TabsContent className="mt-0 space-y-3" value="balances">
            {group.balanceItems.length === 0 ? (
              <EmptyState
                description="Once expenses create debts between members, balance lines will appear here."
                icon={Wallet}
                title="No balances yet"
              />
            ) : (
              group.balanceItems.map((item) => (
                <div className="rounded-[22px] bg-card/90 px-4 py-4 text-sm text-muted-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)]" key={item}>
                  {item}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileShell>
  )
}
