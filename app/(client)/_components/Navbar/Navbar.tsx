'use client'

import SmalButtonReuseable from '@/components/reusable/SmalButtonReuseable'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import React, { useState } from 'react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    // dynamic years
    const currentYear = new Date().getFullYear()


    // dynamic addional menu items
    const additionalMenuItems = [
        {
            name: 'Contact Us',
            link: '/contact'
        },
        {
            name: 'Cookie Policy',
            link: '/cookie-policy'
        },
        {
            name: 'Privacy Policy',
            link: '/privacy-policy'
        }
    ]

    return (
        // backdrop-filter: blur(5px);
        <div className='bg-[#14A228] w-full py-4 '>
            <div className='flex items-center justify-between container px-5 2xl:px-0'>
                <div className='text-start text-white font-bold text-3xl font-arial-rounded'>
                    <h1>simplymot.co.uk</h1>
                </div>

                {/* Desktop Navigation */}
                <div className='hidden md:flex items-center gap-2'>
                    <SmalButtonReuseable
                        text='Log in'
                        className='border border-white text-white rounded-[8px] px-4 py-2 hover:bg-white hover:text-black transition-all duration-300'
                    />
                    <SmalButtonReuseable
                        text='Sign up'
                        className='bg-white text-black rounded-[8px] px-4 py-2 hover:bg-white/80 transition-all duration-300'
                    />
                </div>

                {/* Mobile Navigation */}
                <div className='md:hidden'>
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className='text-white hover:bg-white/20 p-2 cursor-pointer'>
                                <Menu className='size-7' />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className='w-[320px] bg-gradient-to-br from-white to-gray-50 border-r border-gray-200 p-0'>
                            <div className='flex flex-col h-full'>
                                {/* Header Section */}
                                <div className='bg-[#14A228] text-white p-6 pb-8'>
                                    <h2 className='text-2xl font-bold font-arial-rounded'>simplymot.co.uk</h2>
                                    <p className='text-sm text-white/80 mt-1'>Your trusted MOT service</p>
                                </div>

                                {/* Navigation Content */}
                                <div className='flex flex-col flex-1 p-6 space-y-4'>
                                    <div className='space-y-3'>
                                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Account</h3>

                                        <Button
                                            variant="outline"
                                            className='w-full cursor-pointer justify-start h-12 text-left border-2 border-[#14A228] text-[#14A228] font-medium hover:bg-[#14A228] hover:text-white transition-all duration-300 shadow-sm'
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <span className='ml-2'>Log in to your account</span>
                                        </Button>

                                        <Button
                                            className='w-full cursor-pointer justify-start h-12 text-left bg-[#14A228] text-white font-medium hover:bg-[#14A228]/90 transition-all duration-300 shadow-lg'
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <span className='ml-2'>Create new account</span>
                                        </Button>
                                    </div>

                                    {/* Additional Menu Items */}
                                    <div className='pt-4 border-t border-gray-200'>
                                        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Quick Actions</h3>
                                        <div className='space-y-2'>
                                            {additionalMenuItems.map((item) => (
                                                <button
                                                    key={item.name}
                                                    className='w-full cursor-pointer text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200'
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {item.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className='py-3 border-t border-gray-200 bg-gray-50'>
                                    <p className='text-sm text-gray-600 text-center'>
                                        © {currentYear} simplymot.co.uk
                                    </p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    )
}
