"use client"

import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useGetCurrentSubscriptionQuery } from '@/rtk'
import LoadingSpinner from '@/components/reusable/LoadingSpinner'

interface SubscriptionProtectionProps {
  children: React.ReactNode
}

export const SubscriptionProtection: React.FC<SubscriptionProtectionProps> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Protected routes that require active subscription
  const protectedRoutes = [
    '/garage/pricing',
    '/garage/availability',
    '/garage/bookings',
  ]

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isGarageUser = user?.type?.toLowerCase() === 'garage'

  // Fetch subscription data for garage users only on protected routes
  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
  } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !isGarageUser || !isProtectedRoute || isAuthLoading,
  })

  useEffect(() => {
    // Wait for auth to complete first
    if (isAuthLoading) {
      return
    }

    // Only check for garage users on protected routes
    if (!isGarageUser || !isProtectedRoute) {
      return
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
  }, [user, pathname, subscriptionData, isLoadingSubscription, router, isAuthLoading, isGarageUser, isProtectedRoute])

  // Show loading only if auth is done and we're checking subscription
  // Don't show if auth is still loading (let RouteProtection handle that)
  if (
    !isAuthLoading &&
    isGarageUser &&
    isProtectedRoute &&
    isLoadingSubscription
  ) {
    return <LoadingSpinner fullScreen text="Loading..." />
  }

  // Show loading while redirecting (only for garage users on protected routes without active subscription)
  if (
    !isAuthLoading &&
    isGarageUser &&
    isProtectedRoute &&
    !isLoadingSubscription &&
    subscriptionData?.data?.status !== 'ACTIVE'
  ) {
    return <LoadingSpinner fullScreen text="Loading..." />
  }

  return <>{children}</>
}

