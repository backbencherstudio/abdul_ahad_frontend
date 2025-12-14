"use client"

import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useGetCurrentSubscriptionQuery } from '@/rtk'
import { Loader2 } from 'lucide-react'

interface SubscriptionProtectionProps {
  children: React.ReactNode
}

export const SubscriptionProtection: React.FC<SubscriptionProtectionProps> = ({ children }) => {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  // Fetch subscription data for garage users
  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
  } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !user?.type || user.type.toLowerCase() !== "garage",
  })

  // Protected routes that require active subscription
  const protectedRoutes = [
    '/garage/pricing',
    '/garage/availability',
    '/garage/bookings',
  ]

  useEffect(() => {
    // Only check for garage users
    if (user?.type?.toLowerCase() !== 'garage') {
      return
    }

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (!isProtectedRoute) {
      return // Not a protected route, allow access
    }

    // Wait for subscription data to load
    if (isLoadingSubscription) {
      return
    }

    // Check subscription status
    const subscriptionStatus = subscriptionData?.data?.status
    const hasActiveSubscription = subscriptionStatus === 'ACTIVE'

    // Redirect to subscription page if no active subscription
    if (!hasActiveSubscription) {
      router.push('/garage/subscription')
    }
  }, [user, pathname, subscriptionData, isLoadingSubscription, router])

  // Show loading while checking subscription (only for garage users on protected routes)
  if (
    user?.type?.toLowerCase() === 'garage' &&
    protectedRoutes.some(route => pathname.startsWith(route)) &&
    isLoadingSubscription
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
          <div className="text-lg text-gray-600">Checking subscription...</div>
        </div>
      </div>
    )
  }

  // Show loading while redirecting (only for garage users on protected routes without active subscription)
  if (
    user?.type?.toLowerCase() === 'garage' &&
    protectedRoutes.some(route => pathname.startsWith(route)) &&
    !isLoadingSubscription &&
    subscriptionData?.data?.status !== 'ACTIVE'
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
          <div className="text-lg text-gray-600">Redirecting to subscription page...</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

