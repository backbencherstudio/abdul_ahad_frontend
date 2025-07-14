"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Check, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import bgImage from "@/public/Image/register/bgImage.png"
import carImage from "@/public/Image/register/registerLargeImg.png"
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface FormData {
    email: string
    password: string
    agreeToTerms: boolean
}

const data = [
    {
        id: 1,
        title: 'Book your MOT in just a few taps',

    },
    {
        id: 2,
        title: 'Amend or cancel appointments anytime',
    },
    {
        id: 3,
        title: 'Get automatic MOT reminders',
    },
    {
        id: 4,
        title: 'Keep track of past MOTs',
    },
    {
        id: 5,
        title: 'Stay road-legal with zero stress',
    },
]
export default function DriverSignInPage() {
    const [showPassword, setShowPassword] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { login } = useAuth()

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            const result = await login(data.email, data.password)
            if (result.success) {
                toast.success(result.message)

                // Check if user is a driver
                if (result.userType === 'DRIVER') {
                    router.push('/driver/book-my-mot')
                } else {
                    toast.error('User not found or not a driver')
                }
            } else {
                toast.error(result.message)
            }
        } catch (error: any) {
            toast.error(error.message || 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleBack = () => {
        router.back()
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
                <div className="relative z-10 p-6 lg:p-12 flex flex-col justify-between h-full">
                    <div>
                        {/* back button */}
                        <button onClick={handleBack} className='flex justify-start cursor-pointer border border-white  rounded-full p-2 w-fit group'>
                            <div className='text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300'>
                                <ArrowLeft className='w-4 h-4 text-white flex-shrink-0' />
                            </div>
                        </button>

                        <div className='text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center'>
                            <Link href="/">simplymot.co.uk</Link>
                        </div>

                        {/* Feature List */}
                        <div className="space-y-3 lg:space-y-4 mt-20">
                            <h2 className="text-lg md:text-xl lg:text-[28px] font-semibold font-inder">
                                All Your MOT Needs In One Place.
                            </h2>
                            {
                                data.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <Check className="w-4 h-4 lg:w-5 lg:h-5 text-white flex-shrink-0" />
                                        <span className="text-sm md:text-base lg:text-lg font-[400]">{item.title}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Car Image */}
                    <div className="flex justify-end mt-4 lg:mt-0">
                        <Image
                            src={carImage}
                            alt="Car with people illustration"
                            className="max-w-xs sm:max-w-sm md:max-w-md w-full h-auto"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 lg:flex-1 flex items-center justify-center rounded-2xl">
                <div className="w-full max-w-full  lg:max-w-lg xl:max-w-xl">
                    <div className="bg-white rounded-xl border border-[#19CA32]  p-8 sm:p-10 lg:p-12">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 sm:mb-10">
                            Let’s get you signed in
                        </h2>

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



                            {/* Password Field */}
                            <div>
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                                    Password <span className='text-red-500'>*</span>
                                </Label>
                                <div className="relative mt-2">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Enter your password'
                                        className="py-5 pr-12 border border-[#19CA32] focus:border-[#19CA32] focus:ring-[#19CA32] text-base px-4 rounded-lg"
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 6,
                                                message: 'Password must be at least 6 characters'
                                            }
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-2">{errors.password.message}</p>
                                )}
                            </div>
                            {/* forget password */}
                            <div className="flex justify-end ">
                                <Link href="/forgot-password" className="text-[#19CA32] underline  text-sm hover:scale-105 transition-all duration-300">
                                    Forget Password
                                </Link>
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
                                    'Log in Account'
                                )}
                            </Button>

                            {/* Login Link */}
                            <div className="text-center pt-4">
                                <span className="text-sm text-gray-600">
                                    Don’t have account ?{' '}
                                    <Link href="/create-account/driver" className="text-[#19CA32] underline font-medium">
                                        Create Account
                                    </Link>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
