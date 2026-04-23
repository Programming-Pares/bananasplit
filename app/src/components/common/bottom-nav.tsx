import { Home, Plus, ReceiptText, Settings, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useQuickActions } from '@/app/providers/quick-action-context'
import { cn } from '@/lib/utils'

const leftNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/groups', icon: Users, label: 'Groups' },
]

const rightNavItems = [
  { href: '/activity', icon: ReceiptText, label: 'Activity' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const location = useLocation()
  const { openActionSheet } = useQuickActions()

  return (
    <nav className="mx-auto w-full max-w-3xl">
      <div className="relative">
        <div className="relative rounded-[32px] border border-white/60 bg-card/95 px-2 pb-2 pt-2 shadow-[0_16px_36px_rgba(54,43,14,0.12)] backdrop-blur">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            <div className="grid grid-cols-2 gap-1">
              {leftNavItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.label}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-[20px] px-2 py-3 text-[10px] font-medium text-muted-foreground transition-colors sm:text-[11px]',
                      isActive && 'bg-primary text-primary-foreground',
                    )}
                    to={item.href}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="px-2">
              <button
                aria-label="Add expense"
                className="relative rounded-full"
                onClick={openActionSheet}
                type="button"
              >
                <span className="flex size-15 items-center justify-center rounded-full border-2 border-(--color-banana-500) bg-(--color-banana-950) text-(--color-banana-50) ring-4 ring-[rgba(255,249,231,0.96)] outline-2 outline-(--color-banana-500)">
                  <Plus className="size-7" />
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1">
              {rightNavItems.map((item) => {
                const isActive = location.pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.label}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-[20px] px-2 py-3 text-[10px] font-medium text-muted-foreground transition-colors sm:text-[11px]',
                      isActive && 'bg-primary text-primary-foreground',
                    )}
                    to={item.href}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
