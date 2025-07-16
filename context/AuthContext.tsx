"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loginApi, AuthMeApi } from '@/apis/auth/loginApis'

// Types
interface User {
  id: string
  email: string
  name: string
  type: 'DRIVER' | 'GARAGE' | 'ADMIN'
  avatar_url?: string
  garage_name?: string // Added for garage users
}

interface LoginResult {
  success: boolean
  message: string
  userType?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  loginWithType: (email: string, password: string, expectedType: 'DRIVER' | 'GARAGE' | 'ADMIN') => Promise<LoginResult>
  logout: () => void
  checkAuth: () => Promise<void>
}

// Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Provider Props
interface AuthProviderProps {
  children: ReactNode
}

// Helper Functions
const validateApiEndpoint = (): boolean => {
  return !!process.env.NEXT_PUBLIC_API_ENDPOINT
}

const createUserFromResponse = (userDetails: any): User => {
  return {
    id: userDetails.data.id,
    email: userDetails.data.email,
    name: userDetails.data.name,
    type: userDetails.data.type,
    avatar_url: userDetails.data.avatar_url,
    garage_name: userDetails.data.garage_name // Add this line
  }
}

const createFallbackUser = (email: string, type: string): User => {
  return {
    id: 'temp-id',
    email: email,
    name: 'User',
    type: type as 'DRIVER' | 'GARAGE' | 'ADMIN',
    avatar_url: undefined
  }
}

// Main Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Login with type validation
  const loginWithType = async (email: string, password: string, expectedType: 'DRIVER' | 'GARAGE' | 'ADMIN'): Promise<LoginResult> => {
    try {
      setIsLoading(true)

      // Validate API endpoint
      if (!validateApiEndpoint()) {
        return { 
          success: false, 
          message: 'API endpoint not configured. Please check your environment variables.'
        }
      }
      
      // Perform login with type
      const loginResponse = await loginApi({ 
        email, 
        password, 
        type: expectedType 
      })
      
      // If login successful, set token and user state
      localStorage.setItem('token', loginResponse.authorization.token)
      
      // Get user details for complete user data
      let userDetails = null
      try {
        userDetails = await AuthMeApi()
      } catch (authMeError) {
        // If AuthMeApi fails, create fallback user
        console.warn('AuthMeApi failed, using fallback user data')
      }
      
      // Set user state
      if (userDetails) {
        setUser(createUserFromResponse(userDetails))
      } else {
        setUser(createFallbackUser(email, expectedType))
      }
      
      return { 
        success: true, 
        message: 'Login successful',
        userType: expectedType
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Login failed'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = (): void => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // Check authentication status
  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setUser(null)
        return
      }

      const userDetails = await AuthMeApi()
      setUser(createUserFromResponse(userDetails))
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize auth check on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    loginWithType,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
