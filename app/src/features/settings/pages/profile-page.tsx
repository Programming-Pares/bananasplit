import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, PencilLine, ShieldCheck } from 'lucide-react'

import { MobileShell } from '@/components/common/mobile-shell'
import { ScreenHeader } from '@/components/common/screen-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  useSettingsQuery,
  useUpdateAuthStateMutation,
  useUpdateProfileMutation,
} from '@/lib/queries/use-app-queries'

export function ProfilePage() {
  const { data } = useSettingsQuery()
  const updateProfileMutation = useUpdateProfileMutation()
  const updateAuthStateMutation = useUpdateAuthStateMutation()
  const [userName, setUserName] = useState('')
  const [accountEmail, setAccountEmail] = useState('')

  useEffect(() => {
    if (!data) {
      return
    }

    setUserName(data.userName)
    setAccountEmail(data.accountEmail ?? '')
  }, [data])

  if (!data) {
    return null
  }

  const initials = (data.userName || 'Y')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const isGoogleProfile = data.authProvider === 'google' && data.isSignedIn
  const canSaveLocalProfile = userName.trim().length > 0 && !updateProfileMutation.isPending

  return (
    <MobileShell>
      <ScreenHeader
        backHref="/settings"
        subtitle={
          isGoogleProfile
            ? 'Connected account details are shown here.'
            : 'Manage the local identity used across your groups.'
        }
        title="Profile"
      />

      <div className="space-y-5">
        <Card className="border-0 bg-[linear-gradient(160deg,#fff7d3,#fffef8)] shadow-[0_16px_32px_rgba(245,181,0,0.16)]">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border border-white/80">
                <AvatarFallback className="bg-secondary text-lg font-semibold text-secondary-foreground">
                  {initials || 'Y'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-banana-900)]/60">
                    {isGoogleProfile ? 'Google account' : 'Local profile'}
                  </p>
                  <p className="truncate text-[1.65rem] font-semibold tracking-tight text-[var(--color-banana-950)] sm:text-[1.8rem]">
                    {data.userName}
                  </p>
                </div>
                <p className="truncate text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  {data.accountEmail ?? 'No email connected'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[var(--color-banana-900)]">
                {isGoogleProfile ? 'Google linked' : 'Local only'}
              </Badge>
              <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[var(--color-banana-900)]">
                {data.isSignedIn ? 'Signed in' : 'Offline first'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {isGoogleProfile ? (
          <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
            <CardHeader className="pb-1">
              <CardTitle>Connected account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] bg-secondary/35 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/80 p-2 text-foreground">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-foreground sm:text-base">Google manages this profile</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                      Name and email come from the connected account for this MVP.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-[24px] bg-white/70 px-4 py-4 text-sm sm:text-[15px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Display name</span>
                  <span className="font-medium text-foreground">{data.userName}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{data.accountEmail ?? 'Not available'}</span>
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-2xl text-destructive hover:text-destructive"
                disabled={updateAuthStateMutation.isPending}
                onClick={() =>
                  updateAuthStateMutation.mutate({
                    accountEmail: null,
                    authProvider: 'local',
                    isSignedIn: false,
                  })
                }
                type="button"
                variant="secondary"
              >
                Disconnect Google
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
            <CardHeader className="pb-1">
              <CardTitle>Edit local profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground" htmlFor="profile-name">
                  Name
                </label>
                <Input
                  className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                  id="profile-name"
                  placeholder="Basti"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground" htmlFor="profile-email">
                  Email
                </label>
                <Input
                  className="h-12 rounded-2xl border-white/80 bg-white/85 shadow-none"
                  id="profile-email"
                  placeholder="Optional local email"
                  type="email"
                  value={accountEmail}
                  onChange={(event) => setAccountEmail(event.target.value)}
                />
              </div>

              <div className="rounded-[24px] bg-white/70 px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                This local profile is used for greetings, group POV balances, and your member name inside shared expenses.
              </div>

              <Button
                className="h-12 w-full rounded-2xl"
                disabled={!canSaveLocalProfile}
                onClick={() =>
                  updateProfileMutation.mutate({
                    accountEmail,
                    userName,
                  })
                }
                type="button"
              >
                Save profile
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
          <CardHeader className="pb-1">
            <CardTitle>Identity notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-[24px] bg-white/70 px-4 py-4">
              <div className="rounded-2xl bg-secondary p-2 text-secondary-foreground">
                <PencilLine className="size-4" />
              </div>
              <div className="space-y-1 text-sm sm:text-[15px]">
                <p className="font-medium text-foreground">Local mode is editable</p>
                <p className="leading-6 text-muted-foreground">
                  Change your local profile anytime without affecting sync architecture or group data shape.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[24px] bg-white/70 px-4 py-4">
              <div className="rounded-2xl bg-secondary p-2 text-secondary-foreground">
                <Mail className="size-4" />
              </div>
              <div className="space-y-1 text-sm sm:text-[15px]">
                <p className="font-medium text-foreground">Settings remains your account hub</p>
                <p className="leading-6 text-muted-foreground">
                  Go back to <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/settings">Settings</Link> for sign-in, currency, and device preferences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileShell>
  )
}
