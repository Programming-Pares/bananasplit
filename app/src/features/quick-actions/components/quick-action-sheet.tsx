import { useEffect, useMemo, useState } from 'react'

import {
  ArrowRight,
  Coins,
  Delete,
  HandCoins,
  Plus,
  ReceiptText,
  Users,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import {
  useCreateExpenseMutation,
  useCreateSettlementMutation,
  useGroupQuery,
  useSelectableGroupsQuery,
} from '@/lib/queries/use-app-queries'
import { cn } from '@/lib/utils'

type QuickActionSheetProps = {
  isOpen: boolean
  onClose: () => void
  onOpenChange: (open: boolean) => void
  onSelectExpense: (groupId?: string) => void
  onSelectSettlement: (groupId?: string) => void
  selectedGroupId?: string | null
  view: 'actions' | 'expense' | 'settlement'
}

type ActionCardProps = {
  description: string
  icon: typeof ReceiptText
  onClick?: () => void
  title: string
}

type AdjustmentEntry = {
  amountCents: number
  id: string
  memberId: string
}

function shouldShowMemberAvatar(index: number) {
  return index % 2 === 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value)
}

function formatCurrencyFromCents(value: number) {
  return formatCurrency(value / 100)
}

function parseAmount(raw: string) {
  if (!raw || raw === '.') {
    return 0
  }

  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseAmountToCents(raw: string) {
  return Math.round(parseAmount(raw) * 100)
}

function formatAmountDisplay(raw: string) {
  return formatCurrency(parseAmount(raw))
}

function appendAmountInput(current: string, next: string) {
  if (next === '.') {
    if (!current) {
      return '0.'
    }

    if (current.includes('.')) {
      return current
    }

    return `${current}.`
  }

  if (current === '0') {
    return next
  }

  const [whole = '', fractional = ''] = current.split('.')
  if (current.includes('.') && fractional.length >= 2) {
    return current
  }

  if (!current && next === '0') {
    return '0'
  }

  if (whole.length >= 7 && !current.includes('.')) {
    return current
  }

  return `${current}${next}`
}

function ActionCard({
  description,
  icon: Icon,
  onClick,
  title,
}: ActionCardProps) {
  return (
    <button
      className="flex w-full items-start gap-3 rounded-[28px] border border-white/80 bg-white/85 p-4 text-left shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
      onClick={onClick}
      type="button"
    >
      <div className="rounded-2xl bg-secondary p-3 text-secondary-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <ArrowRight className="size-4 text-muted-foreground" />
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </button>
  )
}

function Pill({
  active = false,
  showAvatar = false,
  children,
  onClick,
}: {
  active?: boolean
  children: string
  onClick?: () => void
  showAvatar?: boolean
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-white/80 text-foreground hover:bg-white',
      )}
      onClick={onClick}
      type="button"
    >
      {showAvatar ? (
        <Avatar className="size-6 border border-white/70">
          <AvatarFallback
            className={cn(
              'text-[10px] font-semibold',
              active
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            {children.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : null}
      {children}
    </button>
  )
}

function AmountKeypad({
  onBackspace,
  onClear,
  onDigit,
}: {
  onBackspace: () => void
  onClear: () => void
  onDigit: (value: string) => void
}) {
  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ] as const

  return (
    <div className="grid gap-3">
      {keypadRows.map((row) => (
        <div key={row.join('-')} className="grid grid-cols-3 gap-3">
          {row.map((key) => {
            if (key === 'backspace') {
              return (
                <button
                  key={key}
                  className="flex h-16 items-center justify-center rounded-[24px] border border-white/80 bg-white/85 text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
                  onClick={onBackspace}
                  type="button"
                >
                  <Delete className="size-5" />
                </button>
              )
            }

            return (
              <button
                key={key}
                className="h-16 rounded-[24px] border border-white/80 bg-white/85 text-2xl font-semibold text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
                onClick={() => onDigit(key)}
                type="button"
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}

      <button
        className="h-14 rounded-[24px] bg-transparent text-sm font-medium text-destructive transition-colors hover:bg-white/40"
        onClick={onClear}
        type="button"
      >
        Clear
      </button>
    </div>
  )
}

function AmountStep({
  amountInput,
  title,
  onBackspace,
  onClear,
  onDigit,
}: {
  amountInput: string
  title: string
  onBackspace: () => void
  onClear: () => void
  onDigit: (value: string) => void
}) {
  return (
    <div className="space-y-5 px-4 pb-2">
      <div className="rounded-[28px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] px-5 py-6 text-center shadow-[0_18px_40px_rgba(63,52,25,0.08)]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>
        <p className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
          {formatAmountDisplay(amountInput)}
        </p>
      </div>

      <AmountKeypad onBackspace={onBackspace} onClear={onClear} onDigit={onDigit} />
    </div>
  )
}

function ActionChooser({
  onSelectExpense,
  onSelectGroup,
  onSelectSettlement,
}: {
  onSelectExpense: () => void
  onSelectGroup: () => void
  onSelectSettlement: () => void
}) {
  return (
    <div className="space-y-3 px-4 pb-2">
      <ActionCard
        description="Log who paid, split with members, and keep balances updated."
        icon={ReceiptText}
        onClick={onSelectExpense}
        title="Add expense"
      />
      <ActionCard
        description="Start a new household, trip, or barkada group."
        icon={Users}
        onClick={onSelectGroup}
        title="Create group"
      />
      <ActionCard
        description="Record a payment between members and reduce open balances."
        icon={HandCoins}
        onClick={onSelectSettlement}
        title="Settle up"
      />
    </div>
  )
}

function EmptyGroupState() {
  return (
    <div className="px-4 pb-2">
      <div className="rounded-[26px] border border-dashed border-border/80 bg-white/60 px-4 py-5 text-sm leading-6 text-muted-foreground">
        Create an active group first before adding an expense or settlement.
      </div>
    </div>
  )
}

export function QuickActionSheet({
  isOpen,
  onClose,
  onOpenChange,
  onSelectExpense,
  onSelectSettlement,
  selectedGroupId,
  view,
}: QuickActionSheetProps) {
  const selectableGroupsQuery = useSelectableGroupsQuery()
  const createExpenseMutation = useCreateExpenseMutation()
  const createSettlementMutation = useCreateSettlementMutation()
  const [expenseStep, setExpenseStep] = useState<'amount' | 'details'>('amount')
  const [currentGroupId, setCurrentGroupId] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expensePaidById, setExpensePaidById] = useState('')
  const [expenseParticipantIds, setExpenseParticipantIds] = useState<string[]>([])
  const [expenseAdjustments, setExpenseAdjustments] = useState<AdjustmentEntry[]>([])
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)
  const [adjustmentMemberId, setAdjustmentMemberId] = useState('')
  const [adjustmentAmountInput, setAdjustmentAmountInput] = useState('')
  const [settlementPaidById, setSettlementPaidById] = useState('')
  const [settlementReceivedById, setSettlementReceivedById] = useState('')
  const [settlementNote, setSettlementNote] = useState('')

  const actionView = view === 'settlement' ? 'settlement' : 'expense'
  const actionTitle = actionView === 'expense' ? 'Add expense' : 'Settle up'
  const amountPrompt =
    actionView === 'expense' ? 'Enter expense amount' : 'Enter payment amount'
  const amountCents = parseAmountToCents(amountInput)
  const hasValidAmount = amountCents > 0
  const isGroupLocked = Boolean(selectedGroupId)
  const fallbackGroupId = selectedGroupId ?? selectableGroupsQuery.data?.[0]?.id ?? ''
  const effectiveGroupId = isGroupLocked ? selectedGroupId ?? '' : currentGroupId || fallbackGroupId
  const activeGroupQuery = useGroupQuery(effectiveGroupId)
  const activeGroup = activeGroupQuery.data
  const selectableGroups = selectableGroupsQuery.data ?? []
  const members = activeGroup?.memberEntries ?? []
  const memberNameMap = useMemo(
    () => new Map(members.map((member) => [member.id, member.name])),
    [members],
  )
  const allSelected = members.length > 0 && expenseParticipantIds.length === members.length
  const totalAdjustments = expenseAdjustments.reduce(
    (sum, item) => sum + item.amountCents,
    0,
  )
  const hasValidExpense =
    Boolean(activeGroup) &&
    expensePaidById.length > 0 &&
    expenseParticipantIds.length > 0 &&
    totalAdjustments <= amountCents
  const hasValidSettlement =
    Boolean(activeGroup) &&
    settlementPaidById.length > 0 &&
    settlementReceivedById.length > 0 &&
    settlementPaidById !== settlementReceivedById

  useEffect(() => {
    if (!isOpen || view === 'actions') {
      setExpenseStep('amount')
      setCurrentGroupId(selectedGroupId ?? '')
      setAmountInput('')
      setExpenseTitle('')
      setExpensePaidById('')
      setExpenseParticipantIds([])
      setExpenseAdjustments([])
      setAdjustmentMemberId('')
      setAdjustmentAmountInput('')
      setSettlementPaidById('')
      setSettlementReceivedById('')
      setSettlementNote('')
    }
  }, [isOpen, view])

  useEffect(() => {
    if (!isOpen || view === 'actions') {
      return
    }

    if (isGroupLocked) {
      setCurrentGroupId(selectedGroupId ?? '')
      return
    }

    if (!currentGroupId && fallbackGroupId) {
      setCurrentGroupId(fallbackGroupId)
    }
  }, [currentGroupId, fallbackGroupId, isGroupLocked, isOpen, selectedGroupId, view])

  useEffect(() => {
    if (!activeGroup) {
      return
    }

    const [firstMember, secondMember] = activeGroup.memberEntries
    setExpensePaidById(firstMember?.id ?? '')
    setExpenseParticipantIds(activeGroup.memberEntries.map((member) => member.id))
    setSettlementPaidById(firstMember?.id ?? '')
    setSettlementReceivedById(secondMember?.id ?? firstMember?.id ?? '')
  }, [activeGroup?.id])

  const activeMutationPending =
    createExpenseMutation.isPending || createSettlementMutation.isPending

  return (
    <Drawer
      direction="bottom"
      modal
      open={isOpen}
      shouldScaleBackground
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          onClose()
        }
      }}
    >
      <DrawerContent className="mx-auto h-[100svh] max-h-[100svh] max-w-3xl border-none bg-[#fffdf6] data-[vaul-drawer-direction=bottom]:top-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-none sm:data-[vaul-drawer-direction=bottom]:rounded-t-[32px]">
        <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
          <DrawerTitle className="text-xl font-semibold">
            {view === 'actions' ? 'Quick actions' : actionTitle}
          </DrawerTitle>
          <DrawerDescription>
            {view === 'actions'
              ? 'Choose what you want to do next.'
              : expenseStep === 'amount'
                ? amountPrompt
                : formatAmountDisplay(amountInput)}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {view === 'actions' ? (
            <ActionChooser
              onSelectExpense={() => onSelectExpense()}
              onSelectGroup={() => {
                onClose()
                window.location.assign('/groups/new')
              }}
              onSelectSettlement={() => onSelectSettlement()}
            />
          ) : expenseStep === 'amount' ? (
            <AmountStep
              amountInput={amountInput}
              title={amountPrompt}
              onBackspace={() => setAmountInput((current) => current.slice(0, -1))}
              onClear={() => setAmountInput('')}
              onDigit={(value) => setAmountInput((current) => appendAmountInput(current, value))}
            />
          ) : !activeGroup ? (
            <EmptyGroupState />
          ) : actionView === 'expense' ? (
            <>
              <div className="space-y-5 px-4 pb-2">
                <div className="grid gap-4">
                  <div>
                    <label
                      className="mb-3 block text-sm font-medium text-foreground"
                      htmlFor="expense-title"
                    >
                      Title
                    </label>
                    <Input
                      className="mt-1 h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                      id="expense-title"
                      placeholder="Dinner"
                      value={expenseTitle}
                      onChange={(event) => setExpenseTitle(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Group</p>
                    {isGroupLocked ? (
                      <div className="rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none">
                        {activeGroup.name}
                      </div>
                    ) : selectableGroups.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectableGroups.map((group) => (
                          <Pill
                            key={group.id}
                            active={effectiveGroupId === group.id}
                            onClick={() => setCurrentGroupId(group.id)}
                          >
                            {group.name}
                          </Pill>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-border/80 bg-white/50 px-4 py-3 text-sm text-muted-foreground">
                        No active groups available.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Paid by</p>
                    <div className="flex flex-wrap gap-2">
                      {members.map((member, index) => (
                        <Pill
                          key={member.id}
                          active={expensePaidById === member.id}
                          onClick={() => setExpensePaidById(member.id)}
                          showAvatar={shouldShowMemberAvatar(index)}
                        >
                          {member.name}
                        </Pill>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-[minmax(0,9fr)_minmax(3.5rem,1fr)] gap-2">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Split with</p>
                        <div className="flex flex-wrap gap-2">
                          {members.map((member, index) => {
                            const active = expenseParticipantIds.includes(member.id)

                            return (
                              <Pill
                                key={member.id}
                                active={active}
                                showAvatar={shouldShowMemberAvatar(index)}
                                onClick={() => {
                                  if (allSelected) {
                                    setExpenseParticipantIds(
                                      members
                                        .filter((item) => item.id !== member.id)
                                        .map((item) => item.id),
                                    )
                                    return
                                  }

                                  if (active) {
                                    if (expenseParticipantIds.length === 1) {
                                      return
                                    }

                                    setExpenseParticipantIds((current) =>
                                      current.filter((item) => item !== member.id),
                                    )
                                    return
                                  }

                                  setExpenseParticipantIds((current) => [...current, member.id])
                                }}
                              >
                                {member.name}
                              </Pill>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex items-start justify-end pt-7">
                        <button
                          className={cn(
                            'h-10 w-full rounded-full border text-sm font-medium transition-colors',
                            allSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-white/80 text-foreground hover:bg-white',
                          )}
                          onClick={() =>
                            setExpenseParticipantIds(members.map((member) => member.id))
                          }
                          type="button"
                        >
                          All
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">Adjustments</p>
                      <button
                        className="flex size-9 items-center justify-center rounded-full border border-white/80 bg-white/85 text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white"
                        onClick={() => setIsAdjustmentOpen(true)}
                        type="button"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>

                    {expenseAdjustments.length > 0 ? (
                      <div className="space-y-2">
                        {expenseAdjustments.map((adjustment) => (
                          <div
                            className="flex items-center justify-between rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none"
                            key={adjustment.id}
                          >
                            <span className="font-medium">
                              {memberNameMap.get(adjustment.memberId) ?? 'Unknown'}
                            </span>
                            <span className="text-muted-foreground">
                              {formatCurrencyFromCents(adjustment.amountCents)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-border/80 bg-white/50 px-4 py-3 text-sm text-muted-foreground">
                        No adjustments yet.
                      </div>
                    )}
                  </div>

                  <div className="rounded-[26px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Coins className="size-4 text-[var(--color-banana-900)]" />
                      Preview
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {expenseParticipantIds.length} member
                      {expenseParticipantIds.length === 1 ? '' : 's'} selected. Current amount is{' '}
                      {formatAmountDisplay(amountInput)}.
                    </p>
                    {totalAdjustments > amountCents ? (
                      <p className="mt-2 text-sm text-destructive">
                        Adjustments cannot exceed the total amount.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <Drawer
                direction="bottom"
                modal
                open={isAdjustmentOpen}
                onOpenChange={(open) => {
                  if (!open) {
                    setIsAdjustmentOpen(false)
                    setAdjustmentMemberId('')
                    setAdjustmentAmountInput('')
                    return
                  }

                  setIsAdjustmentOpen(true)
                }}
              >
                <DrawerContent className="mx-auto h-[100svh] max-h-[100svh] max-w-3xl border-none bg-[#fffdf6] data-[vaul-drawer-direction=bottom]:top-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-none sm:data-[vaul-drawer-direction=bottom]:rounded-t-[32px]">
                  <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
                    <DrawerTitle className="text-xl font-semibold">Adjustments</DrawerTitle>
                    <DrawerDescription>
                      {adjustmentAmountInput
                        ? formatAmountDisplay(adjustmentAmountInput)
                        : 'Select member and enter amount'}
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">User selection</p>
                        <div className="flex flex-wrap gap-2">
                          {members.map((member, index) => (
                            <Pill
                              key={member.id}
                              active={adjustmentMemberId === member.id}
                              showAvatar={shouldShowMemberAvatar(index)}
                              onClick={() => setAdjustmentMemberId(member.id)}
                            >
                              {member.name}
                            </Pill>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[28px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] px-5 py-6 text-center shadow-[0_18px_40px_rgba(63,52,25,0.08)]">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                          Adjustment amount
                        </p>
                        <p className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
                          {formatAmountDisplay(adjustmentAmountInput)}
                        </p>
                      </div>

                      <AmountKeypad
                        onBackspace={() =>
                          setAdjustmentAmountInput((current) => current.slice(0, -1))
                        }
                        onClear={() => setAdjustmentAmountInput('')}
                        onDigit={(value) =>
                          setAdjustmentAmountInput((current) =>
                            appendAmountInput(current, value),
                          )
                        }
                      />
                    </div>
                  </div>

                  <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
                    <Button
                      className="h-12 rounded-2xl"
                      disabled={
                        adjustmentMemberId.length === 0 ||
                        parseAmountToCents(adjustmentAmountInput) <= 0
                      }
                      onClick={() => {
                        setExpenseAdjustments((current) => [
                          ...current,
                          {
                            amountCents: parseAmountToCents(adjustmentAmountInput),
                            id: crypto.randomUUID(),
                            memberId: adjustmentMemberId,
                          },
                        ])
                        setIsAdjustmentOpen(false)
                        setAdjustmentMemberId('')
                        setAdjustmentAmountInput('')
                      }}
                      type="button"
                    >
                      Confirm
                    </Button>
                    <Button
                      className="h-12 rounded-2xl"
                      variant="secondary"
                      onClick={() => {
                        setIsAdjustmentOpen(false)
                        setAdjustmentMemberId('')
                        setAdjustmentAmountInput('')
                      }}
                      type="button"
                    >
                      Close
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </>
          ) : (
            <div className="space-y-5 px-4 pb-2">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Group</p>
                  {isGroupLocked ? (
                    <div className="rounded-[24px] border border-white/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-none">
                      {activeGroup.name}
                    </div>
                  ) : selectableGroups.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectableGroups.map((group) => (
                        <Pill
                          key={group.id}
                          active={effectiveGroupId === group.id}
                          onClick={() => setCurrentGroupId(group.id)}
                        >
                          {group.name}
                        </Pill>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-border/80 bg-white/50 px-4 py-3 text-sm text-muted-foreground">
                      No active groups available.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Paid by</p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member, index) => (
                      <Pill
                        key={member.id}
                        active={settlementPaidById === member.id}
                        onClick={() => setSettlementPaidById(member.id)}
                        showAvatar={shouldShowMemberAvatar(index)}
                      >
                        {member.name}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Received by</p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member, index) => (
                      <Pill
                        key={member.id}
                        active={settlementReceivedById === member.id}
                        onClick={() => setSettlementReceivedById(member.id)}
                        showAvatar={shouldShowMemberAvatar(index)}
                      >
                        {member.name}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="mb-3 block text-sm font-medium text-foreground"
                    htmlFor="settlement-note"
                  >
                    Note
                  </label>
                  <Input
                    className="mt-1 h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                    id="settlement-note"
                    placeholder="Transfer after dinner"
                    value={settlementNote}
                    onChange={(event) => setSettlementNote(event.target.value)}
                  />
                </div>

                <div className="rounded-[26px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Coins className="size-4 text-[var(--color-banana-900)]" />
                    Preview
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {memberNameMap.get(settlementPaidById) ?? 'Unknown'} pays{' '}
                    {memberNameMap.get(settlementReceivedById) ?? 'Unknown'}{' '}
                    {formatAmountDisplay(amountInput)}.
                  </p>
                  {!hasValidSettlement ? (
                    <p className="mt-2 text-sm text-destructive">
                      Paid by and received by must be different.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
          {view === 'actions' ? (
            <Button className="h-12 rounded-2xl" onClick={() => onSelectExpense()} type="button">
              <Plus className="size-4" />
              Add expense
            </Button>
          ) : expenseStep === 'amount' ? (
            <Button
              className="h-12 rounded-2xl"
              disabled={!hasValidAmount}
              onClick={() => setExpenseStep('details')}
              type="button"
            >
              Continue
            </Button>
          ) : actionView === 'expense' ? (
            <Button
              className="h-12 rounded-2xl"
              disabled={!hasValidExpense || activeMutationPending}
              onClick={async () => {
                if (!activeGroup) {
                  return
                }

                await createExpenseMutation.mutateAsync({
                  adjustmentEntries: expenseAdjustments.map((item) => ({
                    amountCents: item.amountCents,
                    memberId: item.memberId,
                  })),
                  amountCents,
                  groupId: activeGroup.id,
                  note: null,
                  paidByMemberId: expensePaidById,
                  participantMemberIds: expenseParticipantIds,
                  title: expenseTitle.trim() || 'Expense',
                })
                onClose()
              }}
              type="button"
            >
              Confirm expense
            </Button>
          ) : (
            <Button
              className="h-12 rounded-2xl"
              disabled={!hasValidSettlement || activeMutationPending}
              onClick={async () => {
                if (!activeGroup) {
                  return
                }

                await createSettlementMutation.mutateAsync({
                  amountCents,
                  groupId: activeGroup.id,
                  note: settlementNote.trim() || null,
                  paidByMemberId: settlementPaidById,
                  receivedByMemberId: settlementReceivedById,
                })
                onClose()
              }}
              type="button"
            >
              Confirm settlement
            </Button>
          )}
          <Button className="h-12 rounded-2xl" variant="secondary" onClick={onClose} type="button">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
