import logo from '@/assets/logo.png'
import { cn } from '@/lib/utils'

type AppLogoProps = {
  className?: string
  compact?: boolean
}

export function AppLogo({ className, compact = false }: AppLogoProps) {
  return (
    <div className={cn('flex items-center gap-3 sm:gap-3.5', className)}>
      <img
        alt="BananaSplit logo"
        className="size-10 rounded-2xl object-cover shadow-[0_10px_24px_rgba(245,181,0,0.28)] sm:size-11"
        loading="eager"
        src={logo}
      />
      <div className={cn('min-w-0', compact ? 'space-y-0' : 'space-y-0.5')}>
        <div className="flex items-start gap-1.5">
          <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
            BananaSplit
          </p>
          <span className="mt-0.5 text-[9px] font-semibold tracking-[0.22em] text-[var(--color-banana-500)] uppercase sm:text-[10px]">
            Pro
          </span>
        </div>
        {!compact ? (
          <p className="text-sm leading-6 text-muted-foreground">
            Split bills. Stay friends.
          </p>
        ) : null}
      </div>
    </div>
  )
}
