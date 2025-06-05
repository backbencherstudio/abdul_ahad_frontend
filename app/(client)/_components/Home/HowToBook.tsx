import React from 'react'
import LineImage from '@/public/Image/mot/line.png'
import Image from 'next/image'
import CarIcon from '../Icon/CarIcon'
import DateIocn from '../Icon/DateIocn'
import CalenderIcon from '../Icon/CalenderIcon'

export default function HowToBook() {
    const steps = [
        {
            id: 1,
            icon: <CarIcon />,
            title: "Enter Your Details",
            description: "Enter your car reg and postcode to find local garages near you."
        },
        {
            id: 2,
            icon: < DateIocn />,
            title: "Choose A Date And Garage",
            description: "Select one of our trusted garages and a date that best suits you."
        },
        {
            id: 3,
            icon: <CalenderIcon />,
            title: "Book Your Appointment",
            description: "Confirm your booking – it's that simple"
        }
    ]

    return (
        <div className="py-16 lg:py-24">
            <div className="container mx-auto px-5 2xl:px-0">
                {/* Title Section */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
                        How To {' '}
                        <span className="relative inline-block">
                            Book Your  MOT
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

                {/* Steps Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {steps.map((step, index) => (
                        <div key={step.id} className="text-center">
                            {/* Icon Container */}
                            <div className="flex justify-center mb-2">
                                <div className="w-20 h-20 bg-white flex items-center justify-center ">
                                    {step.icon}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl lg:text-2xl font-medium text-[#070707] mb-3">
                                {step.title}
                            </h3>

                            {/* Description */}
                            <p className="text-[#4A4C56] text-base leading-relaxed max-w-sm mx-auto">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
