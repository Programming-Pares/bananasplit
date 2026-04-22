import { useState } from 'react'
import { BellRing, Cloud, Mail, QrCode, Sparkles, Users } from 'lucide-react'

import proMascot from '@/assets/pro-mascot.png'
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
import { cn } from '@/lib/utils'

type ProUpgradeCardProps = {
  className?: string
}

const proBenefits = [
  {
    description: 'Keep balances, groups, and activity backed up across devices.',
    icon: Cloud,
    title: 'Cloud sync',
  },
  {
    description: 'Bring people in faster with QR codes and direct email invites.',
    icon: QrCode,
    title: 'Invite via QR and email',
  },
  {
    description: 'Send reminder notifications so members do not forget what they owe.',
    icon: BellRing,
    title: 'Push reminders',
  },
  {
    description: 'Create as many travel, barkada, household, and event groups as you need.',
    icon: Users,
    title: 'Unlimited groups',
  },
  {
    description: 'Use the app without interruptions or promo clutter.',
    icon: Sparkles,
    title: 'No ads',
  },
  {
    description: 'Pay once and keep the upgrade without recurring charges.',
    icon: Mail,
    title: 'One-time unlock',
  },
]

export function ProUpgradeCard({ className }: ProUpgradeCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className={cn(
          'overflow-hidden rounded-[28px] border border-white/65 bg-white shadow-[0_18px_44px_rgba(86,66,17,0.12)]',
          className,
        )}
      >
        <div className="relative min-h-48 rounded-[24px]">
          <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-[24px] bg-[linear-gradient(160deg,#f2b300,#ffd95a)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" />
          <img
            alt="BananaSplit Pro upgrade"
            className="absolute -bottom-14 left-0 z-10 h-[132%] w-auto object-contain drop-shadow-[0_20px_28px_rgba(86,66,17,0.24)] sm:-bottom-15 sm:left-2"
            loading="eager"
            src={proMascot}
          />
          <div className="relative z-20 flex min-h-48 items-start justify-end px-4 py-4 sm:px-5 sm:py-5">
            <div className="ml-[40%] flex min-h-40 w-full max-w-none flex-col justify-between rounded-[24px] bg-white/96 px-4 py-4 text-left shadow-[0_14px_30px_rgba(86,66,17,0.1)] backdrop-blur sm:ml-[38%] sm:px-5">
              <div>
                <Badge className="rounded-full bg-[rgba(245,181,0,0.14)] px-3 py-1 text-[11px] text-[var(--color-banana-950)]">
                  BananaSplit Pro
                </Badge>
                <p className="mt-3 text-xl font-semibold leading-tight text-[var(--color-banana-950)] sm:text-[1.65rem]">
                  Upgrade once. Split smarter.
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:rgba(79,57,11,0.76)] sm:text-[15px]">
                  Cloud sync, smarter invites, reminders, and unlimited groups with no ads.
                </p>
              </div>
              <div className="mt-4">
                <Button
                  className="w-full rounded-2xl bg-[var(--color-banana-500)] px-5 text-[var(--color-banana-950)] shadow-[0_12px_24px_rgba(245,181,0,0.2)] hover:bg-[var(--color-banana-300)]"
                  onClick={() => setIsOpen(true)}
                  type="button"
                >
                  See Pro benefits
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Drawer direction="bottom" open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="mx-auto flex max-h-[85svh] max-w-3xl flex-col border-none bg-[#fffdf6]">
          <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full bg-[rgba(245,181,0,0.16)] px-3 py-1 text-[11px] text-[var(--color-banana-950)]">
                BananaSplit Pro
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">One-time payment only</span>
            </div>
            <DrawerTitle className="text-xl font-semibold">Everything that makes shared money smoother</DrawerTitle>
            <DrawerDescription>
              Upgrade once to unlock cloud backup, better invites, reminders, and room for every group you manage.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
            {proBenefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-3 rounded-[24px] border border-border/70 bg-[linear-gradient(160deg,#fff8de,#fffef8)] px-4 py-4"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(245,181,0,0.14)] text-[var(--color-banana-950)]">
                  <benefit.icon className="size-5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground sm:text-base">{benefit.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
            <div className="rounded-[24px] bg-[linear-gradient(160deg,#fff1b3,#fff9e2)] px-4 py-4 text-left shadow-[0_12px_28px_rgba(245,181,0,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-banana-900)]">
                Pro unlock
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-banana-950)] sm:text-[1.35rem]">One payment. No recurring charge.</p>
              <p className="mt-1 text-sm leading-6 text-[color:rgba(79,57,11,0.76)] sm:text-[15px]">
                Wire your payment flow later and keep this drawer as the conversion surface.
              </p>
            </div>
            <Button className="rounded-2xl" onClick={() => setIsOpen(false)} type="button">
              Got it
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
