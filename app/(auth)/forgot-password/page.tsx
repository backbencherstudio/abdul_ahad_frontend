"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import bgImage from "@/public/Image/register/bgImage.png"
import carImage from "@/public/Image/register/registerLargeImg.png"
import { useForgotPassword } from '@/hooks/useForgotPassword'

export default function ForgotPassword() {
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    const {
        currentStep,
        isLoading,
        emailForm,
        tokenPasswordForm,
        handleResendEmail,
        handleBackStep,
        handleBack,
        getStepTitle,
        getSubmitButtonText,
        getFormSubmitHandler
    } = useForgotPassword()

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
                        <button onClick={handleBack} className='flex justify-start cursor-pointer border border-white  rounded-full p-2 w-fit group mb-4'>
                            <div className='text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300'>
                                <ArrowLeft className='w-4 h-4 text-white flex-shrink-0' />
                            </div>
                        </button>

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

                        <form onSubmit={getFormSubmitHandler()} className="space-y-6 sm:space-y-8">

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

                            {currentStep === 'tokenPassword' && (
                                <>
                                    {/* Token Field */}
                                    <div>
                                        <Label htmlFor="token" className="text-sm font-medium text-gray-700 mb-2 block">
                                            Verification Token <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            id="token"
                                            type="text"
                                            placeholder='Enter your verification token'
                                            className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                                            {...tokenPasswordForm.register('token', {
                                                required: 'Verification token is required'
                                            })}
                                        />
                                        {tokenPasswordForm.formState.errors.token && (
                                            <p className="text-red-500 text-sm mt-2">{tokenPasswordForm.formState.errors.token.message}</p>
                                        )}
                                    </div>

                                    {/* New Password Field */}
                                    <div>
                                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                                            New Password <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="newPassword"
                                                type={showNewPassword ? 'text' : 'password'}
                                                placeholder='Enter your new password'
                                                className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg pr-12"
                                                {...tokenPasswordForm.register('newPassword', {
                                                    required: 'New password is required',
                                                    minLength: {
                                                        value: 8,
                                                        message: 'Password must be at least 8 characters long'
                                                    }
                                                })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {tokenPasswordForm.formState.errors.newPassword && (
                                            <p className="text-red-500 text-sm mt-2">{tokenPasswordForm.formState.errors.newPassword.message}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                                            Confirm Password <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder='Confirm your new password'
                                                className="mt-2 py-5 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg pr-12"
                                                {...tokenPasswordForm.register('confirmPassword', {
                                                    required: 'Confirmation password is required',
                                                    validate: (value) => value === tokenPasswordForm.watch('newPassword') || 'Passwords do not match'
                                                })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {tokenPasswordForm.formState.errors.confirmPassword && (
                                            <p className="text-red-500 text-sm mt-2">{tokenPasswordForm.formState.errors.confirmPassword.message}</p>
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
                                    getSubmitButtonText()
                                )}
                            </Button>

                            {/* Navigation Links */}
                            <div className="text-center pt-4 space-y-2">
                                {currentStep === 'tokenPassword' && (
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

                                {currentStep === 'tokenPassword' && (
                                    <div className="text-sm text-gray-600">
                                        Didn't receive the email?{' '}
                                        <button
                                            type="button"
                                            onClick={handleResendEmail}
                                            disabled={isLoading}
                                            className="text-[#19CA32] hover:underline font-medium disabled:opacity-50"
                                        >
                                            Resend Email
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
