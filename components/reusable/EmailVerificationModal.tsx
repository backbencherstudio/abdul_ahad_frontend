"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { OTPInput } from '@/components/ui/otp-input'
import { Loader2, Mail, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { emailVerificationApi, resendEmailVerificationApi } from '@/apis/auth/registerApis'

interface EmailVerificationModalProps {
    isOpen: boolean
    onClose: () => void
    email: string
    onVerificationSuccess: () => void
}

export function EmailVerificationModal({
    isOpen,
    onClose,
    email,
    onVerificationSuccess
}: EmailVerificationModalProps) {
    const [otp, setOtp] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [timeLeft, setTimeLeft] = useState(300)
    const [isExpired, setIsExpired] = useState(false)
    const [timerKey, setTimerKey] = useState(0)

    // Countdown timer effect
    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(300)
            setIsExpired(false)
            setOtp('')
            return
        }

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    setIsExpired(true)
                    clearInterval(timer)
                    return 0
                }
                return prevTime - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isOpen, timerKey])

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleVerification = async () => {
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit code')
            return
        }

        if (isExpired) {
            toast.error('Verification code has expired. Please request a new one.')
            return
        }

        setIsVerifying(true)
        try {
            const response = await emailVerificationApi({ email, token: otp })
            if (response.success || response.status === 'success') {
                toast.success(response?.message || 'Email verified successfully!')
                onVerificationSuccess()
                onClose()
            } else {
                toast.error(response?.message || 'Verification failed')
            }
        } catch (error: any) {
            toast.error(error.message || 'Verification failed')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResendCode = async () => {
        try {
            const response = await resendEmailVerificationApi({ email })
            if (response.success || response.status === 'success') {

                setTimeLeft(300)
                setIsExpired(false)
                setOtp('')
                setTimerKey(prev => prev + 1)
                toast.success(response?.message || 'Verification code resent to your email')
            } else {
                toast.error(response?.message || 'Failed to resend code')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend code')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold">
                        Verify Your Email
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <Mail className="h-12 w-12 text-[#19CA32]" />
                        </div>
                        <p className="text-gray-600">
                            We've sent a verification code to
                        </p>
                        <p className="font-medium text-gray-900">{email}</p>
                    </div>

                    {/* Countdown Timer */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-[#19CA32]" />
                            <span className={isExpired ? "text-red-500 font-medium" : "text-gray-600"}>
                                {isExpired ? "Code expired" : `Time remaining: ${formatTime(timeLeft)}`}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700">
                            Enter 6-digit verification code
                        </label>
                        <OTPInput
                            value={otp}
                            onChange={setOtp}
                            length={6}
                            className="justify-center"
                        />
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleVerification}
                            disabled={otp.length !== 6 || isVerifying || isExpired}
                            className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#19CA32]/90 text-white py-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verifying...
                                </div>
                            ) : isExpired ? (
                                'Code Expired'
                            ) : (
                                'Verify Email'
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                onClick={handleResendCode}
                                className="text-sm text-[#19CA32] hover:underline"
                            >
                                Didn't receive the code? Resend
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 