import { useState } from 'react'
import { ArrowLeft, ArrowRight, Coins, UserCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { AppLogo } from '@/components/common/app-logo'
import { MobileShell } from '@/components/common/mobile-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCompleteOnboardingMutation } from '@/lib/queries/use-app-mutations'
import { cn } from '@/lib/utils'

const onboardingSchema = z.object({
  userName: z.string().min(1, 'Name is required'),
  currency: z.string().min(1, 'Currency is required').max(5, 'Too long'),
})

type OnboardingValues = z.infer<typeof onboardingSchema>
type Step = 'welcome' | 'name'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('welcome')
  const { mutateAsync: completeOnboarding, isPending } = useCompleteOnboardingMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      userName: '',
      currency: 'PHP',
    },
  })

  async function nextStep() {
    if (step === 'welcome') {
      setStep('name')
    }
  }

  const onSubmit = async (values: OnboardingValues) => {
    try {
      await completeOnboarding(values)
      navigate('/')
    } catch (error) {
      console.error('Onboarding failed:', error)
    }
  }

  const steps = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'name', label: 'Profile' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  return (
    <MobileShell showBottomNav={false}>
      <div className="flex min-h-[calc(100svh-4rem)] flex-col py-6">
        {/* Progress Bar */}
        <div className="mb-16 flex gap-2.5 px-4">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                idx <= currentStepIndex ? "bg-[var(--color-banana-500)]" : "bg-white/40"
              )}
            />
          ))}
        </div>

        <div className="flex-1 overflow-hidden relative px-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="h-full flex flex-col"
          >
            {/* Step 1: Welcome */}
            {step === 'welcome' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex h-full flex-col items-center justify-between text-center pb-8 pt-4">
                <div className="space-y-8 w-full">
                  <div className="relative mx-auto w-fit">
                    <div className="absolute -inset-8 rounded-full bg-[var(--color-banana-400)]/30 blur-3xl" />
                    <AppLogo compact className="scale-150 relative z-10" />
                  </div>

                  <div className="space-y-4 px-2">
                    <h1 className="text-4xl font-black tracking-tight text-[var(--color-banana-950)]">
                      BananaSplit
                    </h1>
                    <p className="text-lg font-medium text-muted-foreground/90 max-w-[280px] mx-auto">
                      The simplest way to split expenses with your friends.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 px-2">
                    <div className="flex items-center gap-4 rounded-3xl bg-white/60 p-4 text-left shadow-sm ring-1 ring-black/[0.03]">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-banana-100)] text-[var(--color-banana-600)]">
                        <UserCircle2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-banana-950)]">Groups for anything</p>
                        <p className="text-xs text-muted-foreground">Roommates, trips, or just dinner.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-3xl bg-white/60 p-4 text-left shadow-sm ring-1 ring-black/[0.03]">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-banana-100)] text-[var(--color-banana-600)]">
                        <Coins className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-banana-950)]">We handle the math bro</p>
                        <p className="text-xs text-muted-foreground">So you don't have to think about it.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-8">
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="h-16 w-full rounded-[28px] bg-[var(--color-banana-500)] text-lg font-bold text-[var(--color-banana-950)] shadow-[0_12px_24px_rgba(245,181,0,0.3)] transition-all active:scale-95"
                  >
                    Get Started
                    <ArrowRight className="ml-2 size-6" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Name */}
            {step === 'name' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex h-full flex-col items-center justify-between text-center pb-8 pt-4">
                <div className="space-y-12 w-full">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[var(--color-banana-100)] text-[var(--color-banana-600)]">
                    <UserCircle2 className="size-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tight text-[var(--color-banana-950)]">
                      What's your name?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-[280px] mx-auto">
                      This is how your friends will see you in groups.
                    </p>
                  </div>

                  <div className="w-full space-y-6">
                    <Input
                      placeholder="e.g. Satoshi"
                      {...register('userName')}
                      className={cn(
                        "h-16 rounded-[28px] border-2 border-[var(--color-banana-200)] bg-white/50 px-6 text-xl text-center focus-visible:ring-[var(--color-banana-500)]",
                        errors.userName && "border-destructive focus-visible:ring-destructive"
                      )}
                      autoFocus
                    />
                    {errors.userName && (
                      <p className="text-sm font-medium text-destructive">{errors.userName.message}</p>
                    )}
                  </div>

                </div>

                <div className="w-full space-y-4 pt-8">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-16 w-full rounded-[28px] bg-[var(--color-banana-950)] text-lg font-bold text-white shadow-xl transition-all active:scale-95"
                  >
                    {isPending ? 'Setting up...' : 'Finish Setup'}
                    {!isPending && <ArrowRight className="ml-2 size-6" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep('welcome')}
                    className="h-12 rounded-full text-muted-foreground"
                  >
                    <ArrowLeft className="mr-2 size-5" />
                    Back to start
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/40">
          <span className="text-[10px] font-bold tracking-widest uppercase italic">Made with love by Programming-Pares</span>
        </div>
      </div>
    </MobileShell>
  )
}
