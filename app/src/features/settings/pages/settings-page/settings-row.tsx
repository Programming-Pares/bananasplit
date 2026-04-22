import { ChevronRight, type LucideIcon } from 'lucide-react'

type SettingsRowProps = {
  icon: LucideIcon
  label: string
  onClick?: () => void
  showChevron?: boolean
  value: string
}

export function SettingsRow({
  icon: Icon,
  label,
  onClick,
  showChevron = true,
  value,
}: SettingsRowProps) {
  return (
    <button
      className="flex w-full items-center justify-between gap-3 py-3 text-left"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-secondary p-2 text-secondary-foreground">
          <Icon className="size-4" />
        </div>
        <span className="text-sm text-foreground sm:text-[15px]">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground sm:text-[15px]">
        <span>{value}</span>
        {showChevron ? <ChevronRight className="size-4" /> : null}
      </div>
    </button>
  )
}
