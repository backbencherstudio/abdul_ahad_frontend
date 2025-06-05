import React from 'react'
import Image from 'next/image'
import bgImage from '@/public/Image/book/Bgbook.png'
import leftImage from '@/public/Image/book/leftImg.png'
import rightImage from '@/public/Image/book/rightImg.png'
import SmalButtonReuseable from '@/components/reusable/SmalButtonReuseable'

export default function ReadytoBook() {
    return (
        <div style={{ backgroundImage: `url(${bgImage.src})` }} className='w-full bg-cover bg-center bg-no-repeat py-20 lg:py-40 relative overflow-hidden'>
            {/* Main Content - Inside Container */}
            <div className='container px-5 2xl:px-0 relative z-10'>
                <div className='text-center space-y-6'>
                    <h2 className='text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-6'>
                        Ready to Book Your MOT?
                    </h2>
                    <p className='text-white/90 text-lg mb-6 max-w-xl mx-auto'>
                        Book your MOT test today and ensure your vehicle stays legal, safe, and ready for the road.
                    </p>
                    <SmalButtonReuseable text='Book My MOT' className='bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200  ' />
                </div>
            </div>

            {/* Left Image - Outside Container, Bottom Positioned */}
            <div className='absolute bottom-0 left-0 z-0 hidden lg:block'>
                <Image
                    width={500}
                    height={500}
                    src={leftImage}
                    alt="MOT Service Left"
                    className='h-auto lg:w-7/12'
                    priority
                />
            </div>

            {/* Right Image - Outside Container, Bottom Positioned */}
            <div className='absolute bottom-0 right-0 z-0 hidden lg:block'>
                <Image
                    width={500}
                    height={500}
                    src={rightImage}
                    alt="MOT Service Right"
                    className='h-auto  lg:w-full'
                    priority
                />
            </div>
        </div>
    )
}
