import { type ReactNode } from 'react'
import { Bell, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AppLogo } from '@/components/common/app-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNotificationsQuery } from '@/lib/queries/use-app-queries'

type RootPageHeaderProps = {
  actions?: ReactNode
  className?: string
  headingClassName?: string
  showNotifications?: boolean
  showSearch?: boolean
  subtitle: string
  subtitleClassName?: string
  title: string
  titleClassName?: string
}

export function RootPageHeader({
  actions,
  className,
  headingClassName,
  showNotifications = false,
  showSearch = false,
  subtitle,
  subtitleClassName,
  title,
  titleClassName,
}: RootPageHeaderProps) {
  const { data: notifications } = useNotificationsQuery()
  const unreadNotificationCount = (notifications ?? []).filter((item) => item.isRead === false).length
  const defaultActions = showSearch || showNotifications ? (
    <>
      {showSearch ? (
        <Button asChild className="size-12 rounded-full" size="icon" variant="secondary">
          <Link to="/search" aria-label="Search">
            <Search className="size-5" />
          </Link>
        </Button>
      ) : null}
      {showNotifications ? (
        <Button asChild className="relative size-12 rounded-full" size="icon" variant="secondary">
          <Link to="/notifications" aria-label="Notifications">
            <Bell className="size-5" />
            {unreadNotificationCount > 0 ? (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[var(--color-banana-900)]" />
            ) : null}
          </Link>
        </Button>
      ) : null}
    </>
  ) : null

  return (
    <header className={cn('space-y-3.5 sm:space-y-5', className)}>
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <AppLogo compact />
        {actions ?? defaultActions ? (
          <div className="flex items-center gap-2">{actions ?? defaultActions}</div>
        ) : null}
      </div>
      <div className={cn('pt-2.5 sm:pt-4', headingClassName)}>
        <p className={cn('text-base leading-5 text-muted-foreground sm:text-lg sm:leading-6', subtitleClassName)}>{subtitle}</p>
        <h1 className={cn('mt-1 text-4xl leading-[0.95] font-semibold tracking-tight text-foreground sm:mt-1.5 sm:text-5xl', titleClassName)}>
          {title}
        </h1>
      </div>
    </header>
  )
}
