import { Delete } from 'lucide-react'

import {
  appendCalculatorInput,
  backspaceCalculatorInput,
  formatAmountDisplay,
  formatExpressionPreview,
} from '@/features/quick-actions/components/calculator-amount'

function CalculatorKeypad({
  onBackspace,
  onClear,
  onInput,
}: {
  onBackspace: () => void
  onClear: () => void
  onInput: (value: string) => void
}) {
  const keypadRows = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['.', '0', '=', '+'],
  ] as const

  return (
    <div className="grid gap-2.5 sm:gap-3">
      {keypadRows.map((row) => (
        <div key={row.join('-')} className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {row.map((key) => {
            const isOperator = ['/', '*', '-', '+', '='].includes(key)

            return (
              <button
                key={key}
                className={`h-15 rounded-[22px] border text-[1.55rem] font-semibold shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors sm:h-16 sm:rounded-[24px] sm:text-[1.8rem] ${
                  isOperator
                    ? 'border-[rgba(245,181,0,0.28)] bg-[rgba(245,181,0,0.14)] text-[var(--color-banana-950)] hover:bg-[rgba(245,181,0,0.2)]'
                    : 'border-white/80 bg-white/85 text-foreground hover:bg-white'
                }`}
                onClick={() => onInput(key)}
                type="button"
              >
                {key}
              </button>
            )
          })}
        </div>
      ))}

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <button
          className="flex h-13 items-center justify-center rounded-[22px] border border-white/80 bg-white/85 text-foreground shadow-[0_12px_30px_rgba(63,52,25,0.08)] transition-colors hover:bg-white sm:h-14 sm:rounded-[24px]"
          onClick={onBackspace}
          type="button"
        >
          <Delete className="size-5" />
        </button>
        <button
          className="h-13 rounded-[22px] bg-transparent text-sm font-medium text-destructive transition-colors hover:bg-white/40 sm:h-14 sm:rounded-[24px] sm:text-[15px]"
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

type CalculatorAmountInputProps = {
  amountInput: string
  title: string
  onChange: (next: string) => void
}

export function CalculatorAmountInput({
  amountInput,
  title,
  onChange,
}: CalculatorAmountInputProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="rounded-[28px] bg-[linear-gradient(160deg,#fff7d3,#fffef8)] px-4 py-5 text-center shadow-[0_18px_40px_rgba(63,52,25,0.08)] sm:px-5 sm:py-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-[15px]">
          {title}
        </p>
        <p className="mt-1.5 text-sm font-medium leading-5 text-[var(--color-banana-900)]/75 sm:mt-2 sm:text-[15px]">
          {formatExpressionPreview(amountInput)}
        </p>
        <p className="mt-2 text-[2.45rem] leading-none font-semibold tracking-tight text-foreground sm:mt-3 sm:text-5xl">
          {formatAmountDisplay(amountInput)}
        </p>
      </div>

      <CalculatorKeypad
        onBackspace={() => onChange(backspaceCalculatorInput(amountInput))}
        onClear={() => onChange('')}
        onInput={(value) => onChange(appendCalculatorInput(amountInput, value))}
      />
    </div>
  )
}
