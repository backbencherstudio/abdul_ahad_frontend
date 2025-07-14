"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loginApi, AuthMeApi } from '@/apis/auth/loginApis'

interface User {
  id: string
  email: string
  name: string
  type: 'DRIVER' | 'GARAGE' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; userType?: string }>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await loginApi({ email, password })
      
      // Store token in localStorage only
      localStorage.setItem('token', response.authorization.token)
      
      // Fetch user details from /api/auth/me
      const userDetails = await AuthMeApi()
      
      // Set user state using the complete user data
      setUser({
        id: userDetails.data.id,
        email: userDetails.data.email,
        name: userDetails.data.name,
        type: userDetails.data.type
      })
      
      return { 
        success: true, 
        message: 'Login successful',
        userType: userDetails.data.type
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

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setUser(null)
        return
      }

      // Fetch user details from /api/auth/me
      const userDetails = await AuthMeApi()
      
      setUser({
        id: userDetails.data.id,
        email: userDetails.data.email,
        name: userDetails.data.name,
        type: userDetails.data.type
      })
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
