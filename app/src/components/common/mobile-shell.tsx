import { type PropsWithChildren } from 'react'

import { BottomNav } from '@/components/common/bottom-nav'
import { cn } from '@/lib/utils'

type MobileShellProps = PropsWithChildren<{
  className?: string
  showBottomNav?: boolean
}>

export function MobileShell({
  children,
  className,
  showBottomNav = true,
}: MobileShellProps) {
  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(255,232,160,0.88),_transparent_32%),linear-gradient(180deg,#fffef8_0%,#fff8df_100%)]">
      <div className="mx-auto min-h-svh max-w-3xl pb-6 sm:px-4 sm:pt-4">
        <main
          className={cn(
            'min-h-svh border-0 bg-background/88 px-3 py-3.5 shadow-none backdrop-blur sm:min-h-[calc(100svh-2rem)] sm:rounded-[32px] sm:border sm:border-white/60 sm:px-4 sm:py-4 sm:shadow-[0_24px_60px_rgba(86,66,17,0.12)]',
            showBottomNav && 'pb-28',
            className,
          )}
        >
          {children}
        </main>
      </div>
      {showBottomNav ? <BottomNav /> : null}
    </div>
  )
}
