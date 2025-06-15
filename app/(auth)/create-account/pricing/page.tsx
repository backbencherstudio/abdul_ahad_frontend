'use client'
import React, { useState } from 'react'
import bgImage from "@/public/Image/register/bgImage.png"
import carImage from "@/public/Image/register/registerLargeImg.png"
import Link from 'next/link'
import { ArrowLeft, Package, ShoppingBasket, Calendar, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'


export default function GaragePricing() {
    const router = useRouter()
    const handleGarageSignup = () => {
        router.push('/create-account/garage')
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

            {/* Right Side - Pricing Card */}
            <div className="flex-1 lg:flex-1 flex items-center justify-center p-4 lg:p-8">
                <div className='border border-[#19CA32] rounded-2xl p-5'>
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg border border-gray-100">
                        {/* Header */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">One Simple Plan</h2>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            We believe in fairness and transparency - no hidden fees, no contracts, no commissions, and no confusing tiers. Just full access for one simple price.
                        </p>

                        {/* Membership Label */}
                        <p className="text-gray-700 text-sm mb-2">Membership</p>

                        {/* Price */}
                        <div className="mb-4">
                            <span className="text-4xl font-bold text-gray-900">£49</span>
                            <span className="text-gray-600 ml-1">/month</span>
                        </div>

                        {/* Billing Info */}
                        <p className="text-gray-500 text-xs mb-6">
                            £49 billed automatically every month on the sign- up date (unless cancelled)
                        </p>

                        {/* CTA Button */}
                        <button onClick={handleGarageSignup} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg mb-8 transition-colors duration-200">
                            Become a Member
                        </button>

                        {/* Features */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <Package className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Unlimited opportunity to receive MOT bookings — 24/7
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <ShoppingBasket className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Boost Your Garage's Visibility.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <Calendar className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Opportunity to upsell and offer extra services!
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <TrendingUp className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        No Contract. No commission.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <Package className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        Simple set up
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
