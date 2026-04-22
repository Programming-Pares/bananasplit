import { CheckCheck, Clock3, Ellipsis, PauseCircle, PlayCircle, Plus, Repeat, ToggleLeft, ToggleRight, UserPlus, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useQuickActions } from '@/app/providers/quick-action-provider'
import { EmptyState } from '@/components/common/empty-state'
import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupBalanceCard } from '@/features/groups/components/group-balance-card'
import { GroupExpenseList } from '@/features/groups/components/group-expense-list'
import {
  useGroupQuery,
  useCreateExpenseFromRecurringMutation,
  useCreateRecurringExpenseMutation,
  useSetGroupActiveStateMutation,
  useSetGroupDoneStateMutation,
  useToggleRecurringExpensePausedMutation,
} from '@/lib/queries/use-app-queries'

function shouldShowMemberAvatar(index: number) {
  return index % 2 === 0
}

export function GroupDetailsPage() {
  const { groupId = '' } = useParams()
  const { data: group } = useGroupQuery(groupId)
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

  if (!group) {
    return null
  }

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
          <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground sm:text-xs">
            {group.isDone ? 'Done' : 'Open'}
          </Badge>
          <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground sm:text-xs">
            {group.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {group.members.map((member, index) => (
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-sm text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] sm:text-[15px]"
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
          <TabsList className="grid h-12 w-full grid-cols-4 rounded-2xl bg-secondary/80 p-1">
            <TabsTrigger className="rounded-xl" value="expenses">
              Expenses
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="balances">
              Balances
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="members">
              Members
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="timeline">
              Timeline
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-2 space-y-3" value="expenses">
            <div className="rounded-[24px] bg-card/90 p-4 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-medium text-foreground sm:text-base">Recurring expenses</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">Keep regular group costs ready to reuse.</p>
                </div>
                <Button
                  className="rounded-2xl"
                  disabled={group.isDone}
                  onClick={() => {
                    setRecurringTitle('')
                    setRecurringAmount('')
                    setRecurringFrequency('monthly')
                    setRecurringPaidById(group.memberEntries[0]?.id ?? '')
                    setRecurringParticipantIds(group.memberEntries.map((member) => member.id))
                    setIsRecurringOpen(true)
                  }}
                  type="button"
                  variant="secondary"
                >
                  <Repeat className="size-4" />
                  Add recurring
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {group.recurringExpenses.length === 0 ? (
                  <EmptyState
                    className="border-0 bg-secondary/35 py-6 shadow-none"
                    description="Set up a weekly or monthly template for rent, bills, or subscriptions."
                    icon={Repeat}
                    title="No recurring expenses yet"
                  />
                ) : (
                  group.recurringExpenses.map((item) => (
                    <div
                      className="rounded-[22px] bg-secondary/35 px-4 py-4"
                      key={item.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-medium text-foreground sm:text-base">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                            {item.frequencyLabel} · {item.amount} · {item.participantCount} people
                          </p>
                        </div>
                        <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-secondary-foreground">
                          {item.isPaused ? 'Paused' : 'Active'}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          className="rounded-full px-4"
                          disabled={createExpenseFromRecurringMutation.isPending || item.isPaused || group.isDone}
                          onClick={() => createExpenseFromRecurringMutation.mutate({ recurringExpenseId: item.id })}
                          type="button"
                          variant="secondary"
                        >
                          <Plus className="size-4" />
                          Create now
                        </Button>
                        <Button
                          className="rounded-full px-4"
                          disabled={toggleRecurringExpensePausedMutation.isPending}
                          onClick={() =>
                            toggleRecurringExpensePausedMutation.mutate({
                              isPaused: !item.isPaused,
                              recurringExpenseId: item.id,
                            })
                          }
                          type="button"
                          variant="secondary"
                        >
                          {item.isPaused ? <PlayCircle className="size-4" /> : <PauseCircle className="size-4" />}
                          {item.isPaused ? 'Resume' : 'Pause'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <GroupExpenseList items={group.expenses} />
          </TabsContent>
          <TabsContent className="mt-0 space-y-3" value="balances">
            {group.settlementSuggestions.length > 0 ? (
              <div className="rounded-[24px] bg-card/90 p-4 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-[var(--color-banana-900)]" />
                  <p className="text-[15px] font-medium text-foreground sm:text-base">Suggested settle-ups</p>
                </div>
                <div className="mt-3 space-y-2">
                  {group.settlementSuggestions.map((item) => (
                    <div className="rounded-[20px] bg-secondary/45 px-4 py-3 text-sm text-foreground sm:text-[15px]" key={`${item.fromId}-${item.toId}`}>
                      {item.suggestion}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {group.balanceItems.length === 0 ? (
              <EmptyState
                description="Once expenses create debts between members, balance lines will appear here."
                icon={Wallet}
                title="No balances yet"
              />
            ) : (
              group.balanceItems.map((item) => (
                <div className="rounded-[22px] bg-card/90 px-4 py-4 text-sm text-muted-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] sm:text-[15px]" key={item}>
                  {item}
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent className="mt-0 space-y-3" value="members">
            {group.memberBalances.length === 0 ? (
              <EmptyState
                description="Add members to see each person’s net position and direct balance lines."
                icon={Users}
                title="No member balances yet"
              />
            ) : (
              group.memberBalances.map((member) => (
                <div className="rounded-[24px] bg-card/90 p-4 shadow-[0_12px_30px_rgba(63,52,25,0.08)]" key={member.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-foreground sm:text-base">{member.name}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">{member.netLabel}</p>
                    </div>
                    <div className="text-right text-sm sm:text-[15px]">
                      <p className="text-muted-foreground">Owes {member.owes}</p>
                      <p className="mt-1 text-foreground">Is owed {member.owed}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {member.directLines.length === 0 ? (
                      <div className="rounded-[20px] bg-secondary/35 px-4 py-3 text-sm text-muted-foreground sm:text-[15px]">
                        No direct balances for this member yet.
                      </div>
                    ) : (
                      member.directLines.map((line) => (
                        <div className="rounded-[20px] bg-secondary/35 px-4 py-3 text-sm text-foreground sm:text-[15px]" key={`${member.id}-${line}`}>
                          {line}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent className="mt-0 space-y-3" value="timeline">
            {group.timeline.length === 0 ? (
              <EmptyState
                description="Group actions, member changes, and money events will build a local timeline here."
                icon={Clock3}
                title="No history yet"
              />
            ) : (
              group.timeline.map((item) => (
                <div className="rounded-[22px] bg-card/90 px-4 py-4 shadow-[0_12px_30px_rgba(63,52,25,0.08)]" key={item.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[15px] font-medium text-foreground sm:text-base">{item.text}</p>
                    <Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] text-secondary-foreground">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">{item.when}</p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Drawer direction="bottom" open={isRecurringOpen} onOpenChange={setIsRecurringOpen}>
        <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
          <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
            <DrawerTitle className="text-xl font-semibold">Recurring expense</DrawerTitle>
            <DrawerDescription>Create a reusable weekly or monthly template for this group.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="recurring-title">
                Title
              </label>
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                id="recurring-title"
                value={recurringTitle}
                onChange={(event) => setRecurringTitle(event.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground sm:text-[15px]" htmlFor="recurring-amount">
                Amount
              </label>
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                id="recurring-amount"
                inputMode="decimal"
                value={recurringAmount}
                onChange={(event) => setRecurringAmount(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['weekly', 'monthly'] as const).map((item) => (
                <Button
                  key={item}
                  className="rounded-full px-4"
                  onClick={() => setRecurringFrequency(item)}
                  type="button"
                  variant={recurringFrequency === item ? 'default' : 'secondary'}
                >
                  {item === 'weekly' ? 'Weekly' : 'Monthly'}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground sm:text-[15px]">Paid by</p>
              <div className="flex flex-wrap gap-2">
                {group.memberEntries.map((member) => (
                  <Button
                    key={member.id}
                    className="rounded-full px-4"
                    onClick={() => setRecurringPaidById(member.id)}
                    type="button"
                    variant={recurringPaidById === member.id ? 'default' : 'secondary'}
                  >
                    {member.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground sm:text-[15px]">Participants</p>
              <div className="flex flex-wrap gap-2">
                {group.memberEntries.map((member) => {
                  const active = recurringParticipantIds.includes(member.id)

                  return (
                    <Button
                      key={member.id}
                      className="rounded-full px-4"
                      onClick={() =>
                        setRecurringParticipantIds((current) =>
                          active
                            ? current.filter((item) => item !== member.id)
                            : [...current, member.id],
                        )
                      }
                      type="button"
                      variant={active ? 'default' : 'secondary'}
                    >
                      {member.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
            <Button
              className="h-12 rounded-2xl"
              disabled={!canCreateRecurring || createRecurringExpenseMutation.isPending}
              onClick={async () => {
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
              type="button"
            >
              Save recurring expense
            </Button>
            <Button className="h-12 rounded-2xl" onClick={() => setIsRecurringOpen(false)} type="button" variant="secondary">
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </MobileShell>
  )
}
