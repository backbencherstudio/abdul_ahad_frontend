import React from 'react'
import LineImage from '@/public/Image/mot/line.png'
import Image from 'next/image'
import TestimonialCarousel from '@/components/reusable/TestimonialCarousel'

export default function CustomersSay() {
    const customers = [
        {
            id: 1,
            name: 'Marie Alisa',
            rating: 2.2,
            title: 'Businessman',
            image: '/Image/home/user1.png',
            comment: 'EngageBoost transformed our community engagement strategy. Their expert advice increased our interactions by 60%, delivering real, measurable results.'
        },
        {
            id: 2,
            name: 'Cameron',
            rating: 4.5,
            title: 'Businessman',
            image: '/Image/home/user1.png',
            comment: 'EngageBoost transformed our community engagement strategy. Their expert advice increased our interactions by 60%, delivering real, measurable results.'
        },
        {
            id: 3,
            name: 'Victoria',
            rating: 5,
            title: 'Businessman',
            image: '/Image/home/user1.png',
            comment: 'EngageBoost transformed our community engagement strategy. Their expert advice increased our interactions by 60%, delivering real, measurable results.'
        },
        {
            id: 4,
            name: 'Victoria',
            rating: 5,
            title: 'Businessman',
            image: '/Image/home/user1.png',
            comment: 'EngageBoost transformed our community engagement strategy. Their expert advice increased our interactions by 60%, delivering real, measurable results.'
        },
    ]

    return (
        <div className='container px-5 2xl:px-0 py-16'>
            {/* Title Section */}
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
                    What Our{' '}
                    <span className="relative inline-block">
                        Customers Say
                        <Image
                            src={LineImage}
                            alt="line decoration"
                            className="absolute -bottom-5 left-0 w-full h-auto"
                            width={400}
                            height={25}
                        />
                    </span>
                </h2>
            </div>

            {/* Testimonial Carousel */}
            <TestimonialCarousel
                testimonials={customers}
                autoplay={true}
                autoplayDelay={4000}
            />
        </div>
    )
}
