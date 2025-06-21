"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'

type ContactFormValues = {
    name: string
    email: string
    contactNumber: string
    message: string
}

export default function ContactUs() {
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ContactFormValues>({
        defaultValues: {
            name: "",
            email: "",
            contactNumber: "",
            message: "",
        },
    })

    const onSubmit = async (data: ContactFormValues) => {
        try {
            setIsLoading(true)

            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.success("Form submitted successfully")
            // console.log("Form submitted:", data)
            reset()
        } catch (error) {
            console.error("Error submitting form:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[80vh] py-8">
            <div className="w-full max-w-lg rounded-lg border border-[#14A228] shadow-lg">
                <div className="bg-[#14A228] text-white p-4 rounded-t-lg">
                    <h1 className="text-xl font-inder font-semibold ">Contact Us</h1>
                </div>
                <div className="p-6 bg-white rounded-b-lg">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-medium">Name</Label>
                            <Input
                                id="name"
                                placeholder=""
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: {
                                        value: 2,
                                        message: "Name must be at least 2 characters"
                                    }
                                })}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder=""
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^\S+@\S+$/i,
                                        message: "Please enter a valid email address"
                                    }
                                })}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactNumber" className="text-gray-700 font-medium">Contact Number</Label>
                            <Input
                                id="contactNumber"
                                type="tel"
                                placeholder=""
                                {...register("contactNumber", {
                                    required: "Contact number is required",
                                    minLength: {
                                        value: 10,
                                        message: "Contact number must be at least 10 digits"
                                    }
                                })}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                            />
                            {errors.contactNumber && (
                                <p className="text-red-500 text-sm">{errors.contactNumber.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-gray-700 font-medium">Message</Label>
                            <Textarea
                                id="message"
                                placeholder=""
                                {...register("message", {
                                    required: "Message is required",
                                    minLength: {
                                        value: 10,
                                        message: "Message must be at least 10 characters"
                                    }
                                })}
                                className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[120px] resize-none"
                            />
                            {errors.message && (
                                <p className="text-red-500 text-sm">{errors.message.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full cursor-pointer bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-md mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Messages"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
