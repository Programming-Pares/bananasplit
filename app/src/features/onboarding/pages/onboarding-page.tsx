import { ArrowRight, PencilRuler } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AppLogo } from '@/components/common/app-logo'
import { MobileShell } from '@/components/common/mobile-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function OnboardingPage() {
  return (
    <MobileShell showBottomNav={false}>
      <div className="flex min-h-[calc(100svh-4rem)] flex-col justify-between gap-6">
        <div className="space-y-6">
          <AppLogo />

          <Card className="overflow-hidden border-0 bg-[linear-gradient(160deg,var(--color-banana-300),#fff5ca_70%)] shadow-[0_20px_40px_rgba(245,181,0,0.22)]">
            <CardContent className="space-y-5 p-5">
              <Badge className="rounded-full bg-white/80 px-3 py-1 text-[var(--color-banana-900)]">
                Mobile-first MVP
              </Badge>
              <div className="space-y-2">
                <h1 className="text-[2.35rem] font-semibold tracking-tight text-[var(--color-banana-950)] sm:text-5xl">
                  Split bills. Stay friends.
                </h1>
                <p className="text-sm leading-6 text-[var(--color-banana-900)]/80 sm:text-[15px]">
                  Start with one local profile, one group, and one clean expense flow.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-[24px] bg-white/75 p-4 text-sm text-[var(--color-banana-900)] sm:text-[15px]">
                <PencilRuler className="size-5" />
                Placeholder logo stays here until you swap in final brand.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="name">
                Your name
              </label>
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/80 shadow-none"
                defaultValue="Sebas"
                id="name"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="currency">
                Preferred currency
              </label>
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/80 shadow-none"
                defaultValue="PHP"
                id="currency"
                placeholder="Currency"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="h-14 w-full rounded-full text-base font-semibold shadow-[0_16px_32px_rgba(245,181,0,0.28)]">
            <Link to="/">
              Create first group
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <p className="text-center text-sm leading-6 text-muted-foreground sm:text-[15px]">
            Data will live on-device first. Sync can come later.
          </p>
        </div>
      </div>
    </MobileShell>
  )
}
