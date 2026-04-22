import { cn } from '@/lib/utils'

type MemberModeButtonProps = {
  active: boolean
  children: string
  onClick: () => void
}

export function MemberModeButton({
  active,
  children,
  onClick,
}: MemberModeButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full border px-3 py-2 text-sm transition-colors sm:text-[15px]',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-white/80 text-foreground hover:bg-white',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}
