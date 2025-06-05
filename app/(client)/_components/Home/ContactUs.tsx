'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import bgImg from '@/public/Image/home/bannerImage.png'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import LargeButtonReuseable from '@/components/reusable/LargeButtonReuseable'

interface ContactFormData {
    name: string
    email: string
    contactNumber: string
    message: string
}

export default function ContactUs() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<ContactFormData>()

    const onSubmit = async (data: ContactFormData) => {
        try {
            // console.log('Form Data:', data)

            reset()
            alert('Message sent successfully!')
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('Failed to send message. Please try again.')
        }
    }

    return (
        <div style={{ backgroundImage: `url(${bgImg.src})` }} className='w-full bg-cover bg-center bg-no-repeat py-20 lg:py-30 relative overflow-hidden'>
            {/* Right Form */}
            <div className='container flex justify-center items-center px-5 2xl:px-0'>
                <div className='w-full max-w-sm md:max-w-md bg-white shadow-lg rounded-lg'>
                    <div className=' bg-[#14A228] text-white rounded-t-lg py-5 px-6'>
                        <h1 className='text-xl font-bold'>Contact Us</h1>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className='p-6 space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor="name" className='text-sm font-medium'>
                                Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Name"
                                className={`h-12 border-[#14A228]/20 ${errors.name ? 'border-red-500' : ''}`}
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Name must be at least 2 characters'
                                    }
                                })}
                            />
                            {errors.name && (
                                <span className='text-red-500 text-sm'>{errors.name.message}</span>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor="email" className='text-sm font-medium'>
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email"
                                className={`h-12 border-[#14A228]/20 ${errors.email ? 'border-red-500' : ''}`}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                            />
                            {errors.email && (
                                <span className='text-red-500 text-sm'>{errors.email.message}</span>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor="contactNumber" className='text-sm font-medium'>
                                Contact Number
                            </Label>
                            <Input
                                id="contactNumber"
                                type="tel"
                                placeholder="Contact Number"
                                className={`h-12 border-[#14A228]/20 ${errors.contactNumber ? 'border-red-500' : ''}`}
                                {...register('contactNumber', {
                                    required: 'Contact number is required',
                                    pattern: {
                                        value: /^[+]?[0-9\s\-\(\)]{10,}$/,
                                        message: 'Invalid contact number'
                                    }
                                })}
                            />
                            {errors.contactNumber && (
                                <span className='text-red-500 text-sm'>{errors.contactNumber.message}</span>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor="message" className='text-sm font-medium'>
                                Message
                            </Label>
                            <Textarea
                                id="message"
                                placeholder="Message"
                                className={`min-h-[100px] border-[#14A228]/20 ${errors.message ? 'border-red-500' : ''}`}
                                {...register('message', {
                                    required: 'Message is required',
                                    minLength: {
                                        value: 10,
                                        message: 'Message must be at least 10 characters'
                                    }
                                })}
                            />
                            {errors.message && (
                                <span className='text-red-500 text-sm'>{errors.message.message}</span>
                            )}
                        </div>

                        <LargeButtonReuseable
                            text={isSubmitting ? 'Sending...' : 'Send Message'}
                            className='bg-[#19CA32] border border-[#19CA32] text-white px-4 py-2 rounded-md w-full disabled:opacity-50'
                            disabled={isSubmitting}
                            type="submit"
                        />
                    </form>
                </div>
            </div>
        </div>
    )
}
