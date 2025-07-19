"use client"

import { useState } from 'react'
import { changesProfileApi } from '@/apis/auth/authApis'

// Password change data interface
interface PasswordChangeData {
    old_password: string
    new_password: string
}

interface UsePasswordChangeReturn {
    changePassword: (data: PasswordChangeData) => Promise<boolean>
    isLoading: boolean
    error: string | null
    resetError: () => void
}

export const usePasswordChange = (): UsePasswordChangeReturn => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const changePassword = async (data: PasswordChangeData): Promise<boolean> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await changesProfileApi(data)

            if (response.success) {
                return true
            } else {
                setError(response.message || 'Failed to change password')
                return false
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to change password'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const resetError = () => {
        setError(null)
    }

    return {
        changePassword,
        isLoading,
        error,
        resetError
    }
} 