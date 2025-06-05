'use client'
import React, { useRef, useEffect } from 'react'
import bgImg from '@/public/Image/home/bannerImage.png'
import lineImg from '@/public/Image/home/line.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell } from 'lucide-react'
import Image from 'next/image'
import LogoStart from '../Icon/LogoStart'
import GroupStart from '../Icon/GroupStart'
import { useCountUp } from 'react-countup'

export default function HomeBanner() {
    const countUpRef = useRef(null);
    const { start } = useCountUp({
        ref: countUpRef,
        start: 0,
        end: 100,
        duration: 3,
        suffix: 'k+',
        enableScrollSpy: true,
        scrollSpyDelay: 500,
    });

    // user data with image 
    const data = [
        {
            image: '/Image/home/user1.png',
            name: 'John Doe',
        },
        {
            image: '/Image/home/user2.png',
            name: 'Jane Doe',
        },
        {
            image: '/Image/home/user3.png',
            name: 'John Doe',
        },
        {
            image: '/Image/home/user4.png',
            name: 'John Doe',
        },

    ]
    return (
        <div
            style={{ backgroundImage: `url(${bgImg.src})` }}
            className='w-full min-h-[calc(100vh-80px)] md:h-[calc(100vh-88px)] bg-cover bg-center bg-no-repeat flex items-center justify-center mt-[65px] md:mt-0 py-8 md:py-0'
        >
            <div className='container px-5 2xl:px-0'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center'>
                    {/* Left Content */}
                    <div className='text-white space-y-6'>
                        <div className='space-y-4'>
                            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight'>
                                MOT Bookings{' '}
                                <br />
                                <span className='relative inline-block'>
                                    Made Simple.
                                    <Image
                                        src={lineImg}
                                        alt="line decoration"
                                        className='absolute -bottom-3 left-0 w-full h-auto'
                                        width={300}
                                        height={20}
                                    />
                                </span>
                            </h1>
                            <p className='text-lg md:text-xl text-white/90 max-w-lg'>
                                Find Trusted MOT Garages Near You. No Upfront Payments. Book Anytime, Anywhere.
                            </p>
                        </div>

                        {/* User Reviews Section */}
                        <div className='flex flex-col gap-4 mt-8 lg:mt-20'>
                            {/* User Avatars */}
                            <div className='flex items-center'>
                                <div className='flex -space-x-5'>
                                    {data.map((user, index) => (
                                        <div key={index} className='relative'>
                                            <Image
                                                src={user.image}
                                                alt={user.name}
                                                width={100}
                                                height={100}
                                                className='w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-white object-cover'
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className='ml-4'>
                                    <p className='text-2xl text-yellow-400 font-semibold'>
                                        <span ref={countUpRef}>100k+</span>
                                    </p>
                                    <p className='text-xl text-white'>happy clients</p>
                                </div>
                            </div>

                            {/* Trustpilot Rating */}
                            <div className='flex flex-col items-start gap-2'>
                                <div className='flex items-center gap-1 mb-1'>
                                    <LogoStart />
                                </div>
                                <div className='flex items-center gap-1'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <GroupStart key={star} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className='flex justify-center lg:justify-end'>
                        <div className='w-full max-w-sm md:max-w-md bg-white shadow-lg rounded-lg'>
                            <div className=' bg-[#14A228] text-white rounded-t-lg py-5 px-6'>
                                <h1 className='text-xl font-bold'>Book Your Vehicle In</h1>
                            </div>
                            <div className='p-6 space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor="registration" className='text-sm font-medium text-[#14A228]'>
                                        Registration number (number plate)
                                    </Label>
                                    <Input
                                        id="registration"
                                        type="text"
                                        placeholder="XXXXXXX"
                                        className='h-12 bg-[#14A228]/10 border-[#14A228]/20 focus:border-[#14A228] placeholder:text-[#14A228]/60'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor="postcode" className='text-sm font-medium text-[#14A228]'>
                                        Postcode
                                    </Label>
                                    <Input
                                        id="postcode"
                                        type="text"
                                        placeholder="XXXXXXX"
                                        className='h-12 bg-[#14A228]/10 border-[#14A228]/20 focus:border-[#14A228] placeholder:text-[#14A228]/60'
                                    />
                                </div>

                                <Button className='w-full cursor-pointer h-12 bg-[#14A228] hover:bg-[#14A228]/90 text-white font-semibold text-base'>
                                    Book My MOT
                                </Button>

                                <Button
                                    variant="outline"
                                    className='w-full cursor-pointer h-12 border-[#14A228] text-[#14A228] hover:bg-[#14A228]/10 font-semibold text-base'
                                >

                                    Free MOT Reminder
                                    <Bell className='w-4 h-4 mr-2' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
