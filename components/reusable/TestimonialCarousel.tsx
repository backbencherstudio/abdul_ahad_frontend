'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { FaStar, FaStarHalf } from 'react-icons/fa'

export interface TestimonialType {
    id: number;
    name: string;
    rating: number;
    title: string;
    image: string;
    comment: string;
}

interface TestimonialCarouselProps {
    testimonials: TestimonialType[];
    options?: EmblaOptionsType;
    autoplay?: boolean;
    autoplayDelay?: number;
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
    testimonials,
    options = { loop: true, align: 'start' },
    autoplay = true,
    autoplayDelay = 3000
}) => {
    const plugins = autoplay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : []
    const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    const onInit = useCallback(() => {
        if (!emblaApi) return
        setScrollSnaps(emblaApi.scrollSnapList())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onInit()
        onSelect()
        emblaApi.on('reInit', onInit)
        emblaApi.on('select', onSelect)
        emblaApi.on('reInit', onSelect)
    }, [emblaApi, onInit, onSelect])

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index)
    }, [emblaApi])

    const renderStars = (rating: number) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.1 

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FaStar 
                    key={i} 
                    className="text-yellow-400 w-5 h-5"
                />
            )
        }

        // Half star
        if (hasHalfStar) {
            stars.push(
                <FaStarHalf 
                    key="half" 
                    className="text-yellow-400 w-5 h-5"
                />
            )
        }

        // Empty stars
        const remainingStars = 5 - Math.ceil(rating)
        for (let i = 0; i < remainingStars; i++) {
            stars.push(
                <FaStar 
                    key={`empty-${i}`} 
                    className="text-gray-300 w-5 h-5"
                />
            )
        }

        return stars
    }

    return (
        <div className="testimonial-carousel">
            {/* Carousel Container */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="flex-none w-full md:w-1/2 lg:w-1/3 px-4"
                        >
                            <div className="bg-[#F8FAFB] p-8 rounded-2xl  border border-[#D2D2D5] h-full flex flex-col">
                                {/* Rating */}
                                <div className="flex items-center mb-4">
                                    {renderStars(testimonial.rating)}
                                </div>

                                {/* Comment */}
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                                    {testimonial.comment}
                                </p>

                                {/* User Info */}
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-gray-500 text-xs">
                                            {testimonial.title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-8 space-x-3">
                {scrollSnaps.map((_, index) => (
                    <button
                        key={index}
                        className={`w-5 h-2 cursor-pointer rounded-full transition-all duration-300 ease-in-out focus:outline-none  ${index === selectedIndex
                            ? 'bg-[#19CA32] scale-125 w-6'
                            : 'bg-[#B8EFBF]'
                            }`}
                        onClick={() => scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default TestimonialCarousel 