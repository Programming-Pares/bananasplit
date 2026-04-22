import { useEffect, useState } from 'react'
import {
  ChevronRight,
  CloudOff,
  Download,
  LogOut,
  Mail,
  MoonStar,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { MobileShell } from '@/components/common/mobile-shell'
import { RootPageHeader } from '@/components/common/root-page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ProUpgradeCard } from '@/features/pro/components/pro-upgrade-card'
import { Separator } from '@/components/ui/separator'
import {
  useResetLocalDataMutation,
  useSettingsQuery,
  useUpdateAuthStateMutation,
  useUpdateCurrencyMutation,
} from '@/lib/queries/use-app-queries'

function SettingsRow({
  icon: Icon,
  label,
  onClick,
  showChevron = true,
  value,
}: {
  icon: typeof Wallet
  label: string
  onClick?: () => void
  showChevron?: boolean
  value: string
}) {
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

export function SettingsPage() {
  const { data } = useSettingsQuery()
  const updateAuthStateMutation = useUpdateAuthStateMutation()
  const updateCurrencyMutation = useUpdateCurrencyMutation()
  const resetLocalDataMutation = useResetLocalDataMutation()
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('PHP')

  useEffect(() => {
    if (!data) {
      return
    }

    setSelectedCurrency(data.currency)
  }, [data])

  if (!data) {
    return null
  }

  const accountName =
    data.authProvider === 'google' && data.isSignedIn
      ? `${data.userName} via Google`
      : data.userName
  const accountEmail = data.accountEmail ?? 'Not signed in'
  const sessionMode = data.isSignedIn ? 'Signed in' : 'Local only'
  const accountProvider = data.isSignedIn ? 'Google linked' : 'No external provider'
  const shortDeviceId = data.deviceId.slice(0, 8).toUpperCase()

  return (
    <MobileShell>
      <div className="space-y-5">
        <RootPageHeader
          showNotifications
          showSearch
          subtitle="Account, preferences, and local data"
          title="Settings"
        />

        <Card className="border-0 bg-[linear-gradient(160deg,#fff7d3,#fffef8)] shadow-[0_16px_32px_rgba(245,181,0,0.16)]">
          <CardContent className="space-y-5 p-5">
            <Link className="block rounded-[28px] outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring/50" to="/profile">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border border-white/80">
                  <AvatarFallback className="bg-secondary text-lg font-semibold text-secondary-foreground">
                    {accountName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-banana-900)]/60">
                      Account
                    </p>
                    <p className="truncate text-[1.65rem] font-semibold tracking-tight text-[var(--color-banana-950)] sm:text-[1.8rem]">
                      {accountName}
                    </p>
                  </div>
                  <p className="truncate text-sm leading-6 text-muted-foreground sm:text-[15px]">{accountEmail}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-2 text-[var(--color-banana-900)]">
                  <ChevronRight className="size-4" />
                </div>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[var(--color-banana-900)]">
                {data.isSignedIn ? 'Signed in' : 'Local mode'}
              </Badge>
              <Badge className="rounded-full bg-white/80 px-3 py-1 text-[11px] text-[var(--color-banana-900)]">
                Offline first
              </Badge>
            </div>

            <div className="rounded-[24px] bg-white/75 px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              {data.isSignedIn
                ? 'Your account is connected for a simpler sign-in experience. Local data still stays first in this MVP.'
                : 'You are currently using the app in local mode. Sign in when you want a linked account later.'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
          <CardHeader className="pb-1">
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-secondary/35 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/80 p-2 text-foreground">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-foreground sm:text-base">Google sign in</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                    Simple account link for this MVP.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {!data.isSignedIn ? (
                  <Button
                    className="h-12 rounded-2xl"
                    disabled={updateAuthStateMutation.isPending}
                    onClick={() =>
                      updateAuthStateMutation.mutate({
                        accountEmail: 'sebas@gmail.com',
                        authProvider: 'google',
                        isSignedIn: true,
                      })
                    }
                    type="button"
                  >
                    Sign in with Google
                  </Button>
                ) : (
                  <Button
                    className="h-12 rounded-2xl"
                    variant="secondary"
                    disabled={updateAuthStateMutation.isPending}
                    onClick={() =>
                      updateAuthStateMutation.mutate({
                        accountEmail: 'sebas@gmail.com',
                        authProvider: 'google',
                        isSignedIn: true,
                      })
                    }
                    type="button"
                  >
                    Connected to Google
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-[24px] bg-white/70 px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              This sign-in is UI-functional for now: you can toggle signed-in state and logout from this page.
            </div>

            {data.isSignedIn ? (
              <Button
                className="h-12 w-full rounded-2xl text-destructive hover:text-destructive"
                variant="secondary"
                disabled={updateAuthStateMutation.isPending}
                onClick={() =>
                  updateAuthStateMutation.mutate({
                    accountEmail: null,
                    authProvider: 'local',
                    isSignedIn: false,
                  })
                }
                type="button"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
          <CardHeader className="pb-1">
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsRow
              icon={Wallet}
              label="Currency"
              onClick={() => setIsCurrencyOpen(true)}
              value={data.currency}
            />
            <Separator />
            <SettingsRow icon={MoonStar} label="Theme" showChevron={false} value="Banana" />
          </CardContent>
        </Card>

        <ProUpgradeCard />

        <Card className="border-0 bg-card/90 shadow-[0_12px_30px_rgba(63,52,25,0.08)]">
          <CardHeader className="pb-1">
            <CardTitle>Data & safety</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsRow icon={Download} label="Export local data" value="Ready" />
            <Separator />
            <SettingsRow icon={CloudOff} label="Sync status" showChevron={false} value="Offline only" />
            <Separator />
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-secondary p-2 text-secondary-foreground">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-[15px] text-foreground sm:text-base">Session security</p>
                  <p className="text-sm leading-6 text-muted-foreground sm:text-[15px]">
                    Local account state and device identity for this installation.
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-[24px] bg-white/70 px-4 py-4 text-sm sm:text-[15px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Access mode</span>
                  <span className="font-medium text-foreground">{sessionMode}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Account provider</span>
                  <span className="font-medium text-foreground">{accountProvider}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Device ID</span>
                  <span className="inline-flex items-center gap-2 font-medium text-foreground">
                    <Smartphone className="size-4 text-muted-foreground" />
                    <span className="font-mono">{shortDeviceId}</span>
                  </span>
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-2xl text-destructive hover:text-destructive"
                disabled={resetLocalDataMutation.isPending}
                onClick={() => setIsResetOpen(true)}
                type="button"
                variant="secondary"
              >
                <RotateCcw className="size-4" />
                Reset local data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Drawer
        direction="bottom"
        open={isCurrencyOpen}
        onOpenChange={(open) => {
          setIsCurrencyOpen(open)
          if (open) {
            setSelectedCurrency(data.currency)
          }
        }}
      >
        <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
          <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
            <DrawerTitle className="text-xl font-semibold">Currency</DrawerTitle>
            <DrawerDescription>Choose the local currency used by this device.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 px-4 pb-2">
            <button
              className={`flex w-full items-center justify-between rounded-[24px] border px-4 py-4 text-left transition-colors ${
                selectedCurrency === 'PHP'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-white/80 bg-white/85 text-foreground'
              }`}
              onClick={() => setSelectedCurrency('PHP')}
              type="button"
            >
              <div>
                <p className="text-sm font-medium sm:text-[15px]">Philippine Peso</p>
                <p className={`mt-1 text-sm sm:text-[15px] ${selectedCurrency === 'PHP' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  PHP · ₱
                </p>
              </div>
              <span className="text-sm font-medium sm:text-[15px]">Available</span>
            </button>
          </div>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
            <Button
              className="h-12 rounded-2xl"
              disabled={selectedCurrency === data.currency || updateCurrencyMutation.isPending}
              onClick={async () => {
                await updateCurrencyMutation.mutateAsync({
                  currency: selectedCurrency,
                })
                setIsCurrencyOpen(false)
              }}
              type="button"
            >
              Save currency
            </Button>
            <Button
              className="h-12 rounded-2xl"
              onClick={() => setIsCurrencyOpen(false)}
              type="button"
              variant="secondary"
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer direction="bottom" open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DrawerContent className="mx-auto max-w-3xl border-none bg-[#fffdf6]">
          <DrawerHeader className="space-y-1 px-4 pb-2 pt-5 text-left">
            <DrawerTitle className="text-xl font-semibold">Reset local data</DrawerTitle>
            <DrawerDescription>
              This clears groups, expenses, settlements, activity, and local account state on this device.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 px-4 pb-2">
            <div className="rounded-[24px] bg-white/75 px-4 py-4 text-sm leading-6 text-muted-foreground sm:text-[15px]">
              After reset, the app will keep only the minimum local bootstrap profile needed to run again.
            </div>
          </div>

          <DrawerFooter className="border-t border-border/70 bg-[#fffdf6] px-4 pb-6 pt-4">
            <Button
              className="h-12 rounded-2xl"
              disabled={resetLocalDataMutation.isPending}
              onClick={async () => {
                await resetLocalDataMutation.mutateAsync()
                setIsResetOpen(false)
              }}
              type="button"
              variant="destructive"
            >
              Reset local data
            </Button>
            <Button
              className="h-12 rounded-2xl"
              onClick={() => setIsResetOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </MobileShell>
  )
}
