import { type PropsWithChildren, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboardQuery } from '@/lib/queries/use-app-queries'

export function OnboardingGuard({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const { data, isLoading } = useDashboardQuery()

  useEffect(() => {
    if (!isLoading && data && !data.isOnboarded) {
      navigate('/onboarding')
    }
  }, [data, isLoading, navigate])

  if (isLoading) {
    return null // Or a loading spinner
  }

  if (data && !data.isOnboarded) {
    return null
  }

  return <>{children}</>
}
