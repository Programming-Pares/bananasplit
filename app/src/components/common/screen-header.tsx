import { type ReactNode } from 'react'
import { ArrowLeft, Ellipsis } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

type ScreenHeaderProps = {
  action?: ReactNode
  actionLabel?: string
  backHref?: string
  title: string
  subtitle?: string
}

export function ScreenHeader({
  action,
  actionLabel,
  backHref,
  title,
  subtitle,
}: ScreenHeaderProps) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3 sm:mb-7 sm:gap-4">
      <div className="flex items-start gap-2.5 sm:gap-3">
        {backHref ? (
          <Button
            asChild
            className="size-10 rounded-2xl"
            size="icon"
            variant="secondary"
          >
            <Link to={backHref}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-[1.75rem] leading-[0.98] font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm leading-5 text-muted-foreground sm:text-[15px] sm:leading-6">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? (
        action
      ) : actionLabel ? (
        <Button className="size-10 rounded-2xl" size="icon" variant="secondary">
          <Ellipsis className="size-4" />
          <span className="sr-only">{actionLabel}</span>
        </Button>
      ) : null}
    </header>
  )
}
