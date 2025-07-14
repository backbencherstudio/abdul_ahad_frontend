"use client"

import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface RouteProtectionProps {
  children: React.ReactNode
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (user) {
        const isDriverRoute = pathname.startsWith('/driver')
        const isGarageRoute = pathname.startsWith('/garage')
        const isAdminRoute = pathname.startsWith('/admin')

        // If user tries to access a route they don't have permission for, redirect immediately
        if (isDriverRoute && user.type !== 'DRIVER') {
          router.push('/unauthorized')
          return
        }

        if (isGarageRoute && user.type !== 'GARAGE') {
          router.push('/unauthorized')
          return
        }

        if (isAdminRoute && user.type !== 'ADMIN') {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
          <div className="text-lg text-gray-600">Checking authentication...</div>
        </div>
      </div>
    )
  }

  // Show loading while redirecting (for both login and unauthorized)
  if (!isAuthenticated || (user && (
    (pathname.startsWith('/driver') && user.type !== 'DRIVER') ||
    (pathname.startsWith('/garage') && user.type !== 'GARAGE') ||
    (pathname.startsWith('/admin') && user.type !== 'ADMIN')
  ))) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#19CA32]" />
          <div className="text-lg text-gray-600">
            {!isAuthenticated ? 'Redirecting to login...' : 'Redirecting...'}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 