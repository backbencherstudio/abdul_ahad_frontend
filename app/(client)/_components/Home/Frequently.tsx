import React from 'react'
import Image from 'next/image'
import LineImage from '@/public/Image/mot/line.png'
import fagImgLeft from '@/public/Image/faq/faqImg.png'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus } from 'lucide-react'

export default function Frequently() {
    const faq = [
        {
            id: 1,
            question: 'How Do I Make A Booking?',
            answer: [
                {
                    id: 1,
                    title: 'Step 1: Enter Your Vehicle Details',
                    description: 'Type in your Vehicle registration number and postcode to get started.',
                },
                {
                    id: 2,
                    title: 'Step 2: Choose a Garage & Date',
                    description: 'Browse through the list of nearby garages. Pick the one that works best for you and select a date that fits your schedule.',
                },
                {
                    id: 3,
                    title: 'Step 3: Confirm Your Booking',
                    description: "Once you've chosen your garage and date, just confirm to book your appointment. You're all set!",
                },
            ]
        },
        {
            id: 2,
            question: 'Do I Pay Anything Upfront?',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'Nope! You simply pay the garage directly on the day of your MOT',
                },
            ]
        },
        {
            id: 3,
            question: 'How Do I Choose A Time For My Booking?',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'You can pick a preferred morning or afternoon slot, but not a specific time. Don\'t worry- most garages will reach out to confirm the exact time after you book.',
                },
            ]
        },
        {
            id: 4,
            question: 'How Do I Change The Date Or Time Of My Booking Or Make Any Amendments?',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'Get in touch with the garage directly if you need to make any changes to your booking, like rescheduling or updating the date/time.',
                },
            ]
        },
        {
            id: 5,
            question: 'How Do I Cancel My Booking?',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'Want to cancel your booking? Just let the garage know directly - they\'ll take it from there.',
                },
            ]
        },
        {
            id: 6,
            question: 'Are There Any Cancellation Fees?',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'Nope! There are no cancellation fees.',
                },
            ]
        },
        {
            id: 7,
            question: 'Are There Any Retest Fees?',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'It depends on the garage, but don\'t worry - if there is a fee, it\'ll be clearly shown on their booking page.',
                },
            ]
        },
        {
            id: 8,
            question: 'What Do I Do If I Need Additional Services From The Garage?',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'Just leave a note in the space provided when booking - the more details, the better! The garage will get back to you with a quote for any additional services you\'re interested in.',
                },
            ]
        },
        {
            id: 9,
            question: 'I Forgot When My Appointment Is - What Should I Do?',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'No worries! You\'ll have received an email and text confirmation when you booked. Please check those for your appointment details. If you\'re still unsure, feel free to reach out to us or the garage directly and we\'ll be happy to help!',
                },
            ]
        },
        {
            id: 10,
            question: 'I Haven\'t Received An Email Or Text After Making A Booking',
            answer: [
                {
                    id: 1,
                    title: '',
                    description: 'No problem! Please check your junk or spam folder just in case it landed there. If you still can\'t find it, just drop us an email and we\'ll be happy to resend your confirmation.',
                },
            ]
        },
    ]
    return (
        <div className='container px-5 2xl:px-0 py-16'>
            <div className='flex flex-col lg:flex-row justify-between gap-8 lg:gap-16'>
                {/* left side */}
                <div className='w-full lg:w-1/2'>
                    {/* Title Section */}
                    <div className=" mb-16">
                        <h2 className="text-3xl text-center lg:text-left md:text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
                            Frequently Asked {' '}
                            <br />
                            <span className="relative inline-block">
                                Questions
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
                    {/* image */}
                    <div className='flex justify-center lg:justify-start'>
                        <Image src={fagImgLeft} alt='fagImgLeft' width={500} height={500} className='sm:w-7/12 lg:w-9/12 w-full h-full object-cover' />
                    </div>
                </div>
                {/* right side  */}
                <div className='w-full lg:w-1/2'>
                    <div>
                        <Accordion type="single" collapsible className="w-full ">
                            {faq.map((item, index) => (
                                <AccordionItem
                                    key={item.id}
                                    value={`item-${item.id}`}
                                    className={` py-1.5 ${index !== faq.length - 1 ? 'border-b border-gray-200' : ''}`}
                                >
                                    <AccordionTrigger className="text-left cursor-pointer text-base md:text-lg font-medium text-gray-900 hover:no-underline [&>svg:last-child]:hidden [&[data-state=open]>svg:first-child]:rotate-45">
                                        {item.question}
                                        <Plus className="h-5 w-5 shrink-0 transition-transform duration-200" />
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4 pb-2 ">
                                        {item.answer.map((ans) => (
                                            <div key={ans.id} className="mb-4 last:mb-0">
                                                {ans.title && (
                                                    <h4 className="font-semibold text-gray-900 mb-2">
                                                        {ans.title}
                                                    </h4>
                                                )}
                                                <p className="text-gray-700 leading-relaxed">
                                                    {ans.description}
                                                </p>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    )
}
