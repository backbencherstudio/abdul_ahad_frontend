"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PersonalInformationSectionProps {
    name: string
    email: string
    phone: string
}

export default function PersonalInformationSection({
    name,
    email,
    phone
}: PersonalInformationSectionProps) {
    return (
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#19CA32] rounded-full"></div>
                Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                        Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        value={name}
                        readOnly
                        className="w-full h-11 border-gray-300 bg-gray-50 cursor-not-allowed"
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                {/* Email Field */}
                <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                        Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="w-full h-11 border-gray-300 bg-gray-50 cursor-not-allowed"
                        placeholder="your.email@example.com"
                        required
                    />
                </div>

                {/* Phone Number Field */}
                <div className="md:col-span-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                        Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        readOnly
                        className="w-full h-11 border-gray-300 bg-gray-50 cursor-not-allowed"
                        placeholder="+44 123 456 7890"
                        required
                    />
                </div>
            </div>
        </div>
    )
}
