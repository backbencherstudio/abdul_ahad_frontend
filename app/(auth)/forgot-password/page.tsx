"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import bgImage from "@/public/Image/register/bgImage.png"
import carImage from "@/public/Image/register/registerLargeImg.png"
import { toast } from 'react-toastify'

interface FormData {
    email: string
}

export default function ForgotPassword() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
    const [isLoading, setIsLoading] = useState(false)

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            toast.success('Send email successfully')
        } catch (error) {
            console.error('Submission error:', error)
        } finally {
            setIsLoading(false)
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
                                Forgot your password?
                            </h2>
                            <p className='text-gray-500 text-sm'>No worries, just enter your email and we’ll send you a reset link.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">


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
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^\S+@\S+$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                                )}
                            </div>


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
                                    'Reset Password'
                                )}
                            </Button>

                            {/* Login Link */}
                            <Link href="/login" className="text-[#19CA32] underline text-sm flex justify-center font-medium hover:scale-105 transition-all duration-300">
                                Return to login
                            </Link>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
