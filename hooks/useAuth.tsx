"use client"

import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

export const useAuth = () => {
  const auth = useContext(AuthContext)
  
  if (auth === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  // Check if user is a driver
  const isDriver = () => {
    return auth.user?.type === 'DRIVER'
  }

  // Check if user is a garage
  const isGarage = () => {
    return auth.user?.type === 'GARAGE'
  }

  // Check if user is an admin
  const isAdmin = () => {
    return auth.user?.type === 'ADMIN'
  }

  return {
    ...auth,
    isDriver,
    isGarage,
    isAdmin
  }
}
