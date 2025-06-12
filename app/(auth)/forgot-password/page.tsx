"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import bgImage from "@/public/Image/register/bgImage.png"
import carImage from "@/public/Image/register/registerLargeImg.png"
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface EmailFormData {
    email: string
}

interface CodeFormData {
    code: string
}

interface PasswordFormData {
    newPassword: string
    confirmPassword: string
}

type FormStep = 'email' | 'code' | 'password'

export default function ForgotPassword() {
    const [currentStep, setCurrentStep] = useState<FormStep>('email')
    const [userEmail, setUserEmail] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()
    const emailForm = useForm<EmailFormData>()
    const codeForm = useForm<CodeFormData>()
    const passwordForm = useForm<PasswordFormData>()

    const [isLoading, setIsLoading] = useState(false)

    const onEmailSubmit = async (data: EmailFormData) => {
        setIsLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            setUserEmail(data.email)
            setCurrentStep('code')
            toast.success('Verification code sent to your email')
        } catch (error) {
            console.error('Email submission error:', error)
            toast.error('Failed to send verification code')
        } finally {
            setIsLoading(false)
        }
    }

    const onCodeSubmit = async (data: CodeFormData) => {
        setIsLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            // Validate code here
            setCurrentStep('password')
            toast.success('Code verified successfully')
        } catch (error) {
            console.error('Code verification error:', error)
            toast.error('Invalid verification code')
        } finally {
            setIsLoading(false)
        }
    }

    const onPasswordSubmit = async (data: PasswordFormData) => {
        setIsLoading(true)
        try {
            if (data.newPassword !== data.confirmPassword) {
                toast.error('Passwords do not match')
                return
            }
            await new Promise(resolve => setTimeout(resolve, 2000))
            toast.success('Password reset successfully')
            router.push('/login')
        } catch (error) {
            console.error('Password reset error:', error)
            toast.error('Failed to reset password')
        } finally {
            setIsLoading(false)
        }
    }

    const getStepTitle = () => {
        switch (currentStep) {
            case 'email':
                return {
                    title: 'Forgot your password?',
                    subtitle: 'No worries, just enter your email and we\'ll send you a reset link.'
                }
            case 'code':
                return {
                    title: 'Enter verification code',
                    subtitle: `We've sent a 6-digit code to ${userEmail}`
                }
            case 'password':
                return {
                    title: 'Create new password',
                    subtitle: 'Please enter your new password below.'
                }
        }
    }

    const handleBackStep = () => {
        if (currentStep === 'code') {
            setCurrentStep('email')
        } else if (currentStep === 'password') {
            setCurrentStep('code')
        }
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row p-4  gap-4">
            <div
                className="flex-1 lg:flex-1 text-white relative overflow-hidden rounded-2xl min-h-[50vh] lg:min-h-full"
                style={{
                    backgroundImage: `url(${bgImage.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="relative z-10 p-6 lg:p-12 flex flex-col h-full">
                    <div className="flex-shrink-0">
                        {/* back button */}
                        <div className='flex justify-start cursor-pointer border border-white  rounded-full p-2 w-fit group mb-4'>
                            <Link href="/login" className='text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300'>
                                <ArrowLeft className='w-4 h-4 text-white flex-shrink-0' />
                            </Link>
                        </div>

                        <div className='text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center'>
                            <Link href="/">simplymot.co.uk</Link>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center items-center min-h-0">
                        <Image
                            src={carImage}
                            alt="Car with people illustration"
                            className="max-w-sm md:max-w-2xl w-full h-auto object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 lg:flex-1 flex items-center justify-center rounded-2xl">
                <div className="w-full max-w-full  lg:max-w-lg xl:max-w-xl">
                    <div className="bg-white rounded-xl border border-[#19CA32]  p-8 sm:p-10 lg:p-12">
                        <div className='mb-8 sm:mb-10'>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-3">
                                {getStepTitle().title}
                            </h2>
                            <p className='text-gray-500 text-sm'>{getStepTitle().subtitle}</p>
                        </div>

                        <form onSubmit={currentStep === 'email' ? emailForm.handleSubmit(onEmailSubmit) : currentStep === 'code' ? codeForm.handleSubmit(onCodeSubmit) : passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 sm:space-y-8">

                            {currentStep === 'email' && (
                                <>
                                    {/* Email Field */}
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                                            Email <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder='Enter your email'
                                            className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                                            {...emailForm.register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^\S+@\S+$/i,
                                                    message: 'Invalid email address'
                                                }
                                            })}
                                        />
                                        {emailForm.formState.errors.email && (
                                            <p className="text-red-500 text-sm mt-2">{emailForm.formState.errors.email.message}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {currentStep === 'code' && (
                                <>
                                    {/* Code Field */}
                                    <div>
                                        <Label htmlFor="code" className="text-sm font-medium text-gray-700 mb-2 block">
                                            Verification Code <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            placeholder='Enter your verification code'
                                            className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                                            {...codeForm.register('code', {
                                                required: 'Verification code is required',
                                                pattern: {
                                                    value: /^\d+$/,
                                                    message: 'Invalid verification code format'
                                                }
                                            })}
                                        />
                                        {codeForm.formState.errors.code && (
                                            <p className="text-red-500 text-sm mt-2">{codeForm.formState.errors.code.message}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {currentStep === 'password' && (
                                <>
                                    {/* New Password Field */}
                                    <div>
                                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                                            New Password <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder='Enter your new password'
                                            className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                                            {...passwordForm.register('newPassword', {
                                                required: 'New password is required',
                                                minLength: {
                                                    value: 8,
                                                    message: 'Password must be at least 8 characters long'
                                                }
                                            })}
                                        />
                                        {passwordForm.formState.errors.newPassword && (
                                            <p className="text-red-500 text-sm mt-2">{passwordForm.formState.errors.newPassword.message}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                                            Confirm Password <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder='Confirm your new password'
                                            className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                                            {...passwordForm.register('confirmPassword', {
                                                required: 'Confirmation password is required',
                                                validate: (value) => value === passwordForm.watch('newPassword') || 'Passwords do not match'
                                            })}
                                        />
                                        {passwordForm.formState.errors.confirmPassword && (
                                            <p className="text-red-500 text-sm mt-2">{passwordForm.formState.errors.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#19CA32] disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed text-white py-5 rounded-lg font-medium text-base transition-all duration-200  hover:shadow-lg hover:shadow-green-500"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Please wait...</span>
                                    </div>
                                ) : (
                                    currentStep === 'email' ? 'Send Code' :
                                        currentStep === 'code' ? 'Verify Code' :
                                            'Reset Password'
                                )}
                            </Button>

                            {/* Navigation Links */}
                            <div className="text-center pt-4 space-y-2">
                                {currentStep === 'code' && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleBackStep}
                                        className="text-[#19CA32] hover:bg-[#19CA32]/10 font-medium text-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                )}

                                {currentStep === 'code' && (
                                    <div className="text-sm text-gray-600">
                                        Didn't receive the code?{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Resend code logic
                                                toast.success('Code resent to your email')
                                            }}
                                            className="text-[#19CA32] hover:underline font-medium"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                )}

                                <Link href="/login" className="text-[#19CA32] underline text-sm flex justify-center font-medium hover:scale-105 transition-all duration-300">
                                    Return to login
                                </Link>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
