"use client"

import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface AdditionalServicesSectionProps {
    value: string
    onChange: (value: string) => void
}

export default function AdditionalServicesSection({
    value,
    onChange
}: AdditionalServicesSectionProps) {
    return (
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <Label htmlFor="additionalServices" className="text-sm font-medium text-gray-700 mb-2 block">
                Additional Services <span className="text-gray-500 text-xs">(Optional)</span>
            </Label>
            <Textarea
                id="additionalServices"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full resize-none border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32]"
                rows={4}
                placeholder="Mention any additional services you require..."
            />
        </div>
    )
}
