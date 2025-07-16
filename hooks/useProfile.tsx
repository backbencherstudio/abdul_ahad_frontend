"use client"

import { useState, useEffect } from 'react'
import { AuthMeApi } from '@/apis/auth/loginApis'
import { useAuth } from './useAuth'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string | null
  avatar_url?: string
  address: string | null
  phone_number: string | null
  vts_number: string | null
  primary_contact: string | null
  type: string
  gender: string | null
  date_of_birth: string | null
  created_at: string
  garage_name: string | null
}

interface UseProfileReturn {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useProfile = (): UseProfileReturn => {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setProfile(null)
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await AuthMeApi()
      setProfile(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile data')
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [isAuthenticated])

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile
  }
} 