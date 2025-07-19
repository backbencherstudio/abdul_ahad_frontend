"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OTPInput } from '@/components/ui/otp-input'
import { Loader2, Mail, Clock, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import { changeEmailRequestApi, changesEmailApi } from '@/apis/auth/authApis'

interface EmailChangeModalProps {
    isOpen: boolean
    onClose: () => void
    currentEmail: string
    onEmailChangeSuccess: (newEmail: string) => void
}

export function EmailChangeModal({
    isOpen,
    onClose,
    currentEmail,
    onEmailChangeSuccess
}: EmailChangeModalProps) {
    const [step, setStep] = useState<'email' | 'verification'>('email')
    const [newEmail, setNewEmail] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
    const [isExpired, setIsExpired] = useState(false)

    // Countdown timer
    useEffect(() => {
        if (step === 'verification' && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsExpired(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [step, timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!newEmail) {
            toast.error('Please enter a new email address')
            return
        }

        if (newEmail === currentEmail) {
            toast.error('New email must be different from current email')
            return
        }

        // Basic email validation
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
        if (!emailRegex.test(newEmail)) {
            toast.error('Please enter a valid email address')
            return
        }

        setIsLoading(true)
        try {
            // First step: Send verification code to new email
            const response = await changeEmailRequestApi({ email: newEmail })
            setStep('verification')
            setTimeLeft(300)
            setIsExpired(false)
            toast.success(response.message || 'Verification code sent to your new email address')
        } catch (error: any) {
            toast.error(error.message || 'Failed to send verification code')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!verificationCode || verificationCode.length !== 6) {
            toast.error('Please enter the 6-digit verification code')
            return
        }

        if (isExpired) {
            toast.error('Verification code has expired. Please request a new one.')
            return
        }

        setIsLoading(true)
        try {
            // Second step: Verify the code
            const response = await changesEmailApi({ 
                email: newEmail, 
                token: verificationCode 
            })
            
            toast.success(response.message || 'Email changed successfully!')
            onEmailChangeSuccess(newEmail)
            handleClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to verify code')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        setIsResending(true)
        try {
            const response = await changeEmailRequestApi({ email: newEmail })
            setTimeLeft(300)
            setIsExpired(false)
            setVerificationCode('')
            toast.success(response.message || 'New verification code sent')
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend code')
        } finally {
            setIsResending(false)
        }
    }

    const handleClose = () => {
        setStep('email')
        setNewEmail('')
        setVerificationCode('')
        setIsLoading(false)
        setIsResending(false)
        setTimeLeft(300)
        setIsExpired(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold">
                        {step === 'email' ? 'Change Email Address' : 'Verify New Email'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {step === 'email' ? (
                        // Email Input Step
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center">
                                    <Mail className="h-12 w-12 text-[#14A228]" />
                                </div>
                                <p className="text-gray-600">
                                    Enter your new email address
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currentEmail" className="text-sm font-medium text-gray-700">
                                    Current Email
                                </Label>
                                <Input
                                    id="currentEmail"
                                    type="email"
                                    value={currentEmail}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newEmail" className="text-sm font-medium text-gray-700">
                                    New Email Address
                                </Label>
                                <Input
                                    id="newEmail"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Enter new email address"
                                    className="border-gray-300 focus:border-[#14A228] focus:ring-[#14A228]"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || !newEmail}
                                className="w-full cursor-pointer bg-[#14A228] hover:bg-green-600 disabled:bg-gray-300"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Sending Code...
                                    </>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </Button>
                        </form>
                    ) : (
                        // Verification Step
                        <form onSubmit={handleVerificationSubmit} className="space-y-4">
                            <div className="text-center space-y-2">
                                <div className="flex justify-center">
                                    <Mail className="h-12 w-12 text-[#14A228]" />
                                </div>
                                <p className="text-gray-600">
                                    We've sent a verification code to
                                </p>
                                <p className="font-medium text-gray-900">{newEmail}</p>
                            </div>

                            {/* Countdown Timer */}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-[#14A228]" />
                                    <span className={isExpired ? "text-red-500 font-medium" : "text-gray-600"}>
                                        {isExpired ? "Code expired" : `Time remaining: ${formatTime(timeLeft)}`}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-medium text-gray-700">
                                    Enter 6-digit verification code
                                </Label>
                                <OTPInput
                                    value={verificationCode}
                                    onChange={setVerificationCode}
                                    length={6}
                                    className="justify-center"
                                />
                            </div>

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    disabled={isLoading || !verificationCode || verificationCode.length !== 6 || isExpired}
                                    className="w-full cursor-pointer bg-[#14A228] hover:bg-green-600 disabled:bg-gray-300"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Change Email'
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResendCode}
                                    disabled={isResending || !isExpired}
                                    className="w-full cursor-pointer"
                                >
                                    {isResending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Resending...
                                        </>
                                    ) : (
                                        'Resend Code'
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep('email')}
                                    className="w-full cursor-pointer"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Email Input
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 