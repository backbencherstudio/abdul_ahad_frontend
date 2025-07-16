"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { forgotPasswordApi, verifyResetPasswordApi, resendVerificationEmailApi } from '@/apis/auth/loginApis'

interface EmailFormData {
    email: string
}

interface TokenPasswordFormData {
    token: string
    newPassword: string
    confirmPassword: string
}

type FormStep = 'email' | 'tokenPassword'

export const useForgotPassword = () => {
    const [currentStep, setCurrentStep] = useState<FormStep>('email')
    const [userEmail, setUserEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Form instances
    const emailForm = useForm<EmailFormData>()
    const tokenPasswordForm = useForm<TokenPasswordFormData>()

    // Helper function to extract error message
    const getErrorMessage = (error: any): string => {
        if (error.response?.data?.message) {
            return error.response.data.message
        } else if (error.message) {
            return error.message
        } else {
            return 'Something went wrong. Please try again.'
        }
    }

    // Email submission handler
    const onEmailSubmit = async (data: EmailFormData) => {
        setIsLoading(true)
        try {
            const response = await forgotPasswordApi(data.email)
            setUserEmail(data.email)
            setCurrentStep('tokenPassword')
            toast.success(response.message || 'Reset link sent to your email')
        } catch (error: any) {
            const errorMessage = getErrorMessage(error)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Token and Password reset handler (combined)
    const onTokenPasswordSubmit = async (data: TokenPasswordFormData) => {
        setIsLoading(true)
        try {
            if (data.newPassword !== data.confirmPassword) {
                toast.error('Passwords do not match')
                return
            }
            const response = await verifyResetPasswordApi(userEmail, data.token, data.newPassword)
            toast.success(response.message || 'Password reset successfully')
            router.push('/login')
        } catch (error: any) {
            const errorMessage = getErrorMessage(error)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Resend email handler
    const handleResendEmail = async () => {
        setIsLoading(true)
        try {
            const response = await resendVerificationEmailApi(userEmail)
            toast.success(response.message || 'Reset email resent successfully')
        } catch (error: any) {
            const errorMessage = getErrorMessage(error)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Navigation handlers
    const handleBackStep = () => {
        if (currentStep === 'tokenPassword') {
            setCurrentStep('email')
        }
    }

    const handleBack = () => {
        router.back()
    }

    // Get step title and subtitle
    const getStepTitle = () => {
        switch (currentStep) {
            case 'email':
                return {
                    title: 'Forgot your password?',
                    subtitle: 'No worries, just enter your email and we\'ll send you a reset link.'
                }
            case 'tokenPassword':
                return {
                    title: 'Reset your password',
                    subtitle: `Enter the verification token sent to ${userEmail} and your new password.`
                }
        }
    }

    // Get submit button text
    const getSubmitButtonText = () => {
        if (isLoading) return 'Please wait...'
        
        switch (currentStep) {
            case 'email':
                return 'Send Reset Link'
            case 'tokenPassword':
                return 'Reset Password'
            default:
                return 'Submit'
        }
    }

    // Get form submit handler
    const getFormSubmitHandler = () => {
        switch (currentStep) {
            case 'email':
                return emailForm.handleSubmit(onEmailSubmit)
            case 'tokenPassword':
                return tokenPasswordForm.handleSubmit(onTokenPasswordSubmit)
            default:
                return () => { }
        }
    }

    return {
        // State
        currentStep,
        userEmail,
        isLoading,
        
        // Forms
        emailForm,
        tokenPasswordForm,
        
        // Handlers
        onEmailSubmit,
        onTokenPasswordSubmit,
        handleResendEmail,
        handleBackStep,
        handleBack,
        
        // Utilities
        getStepTitle,
        getSubmitButtonText,
        getFormSubmitHandler
    }
} 