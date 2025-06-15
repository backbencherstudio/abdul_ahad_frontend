import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function Notifications() {
    const notifications = [
        {
            id: 1,
            make: "FORD",
            model: "FOCUS",
            registrationNumber: "L851 DMV",
            color: "Silver",
            fuelType: "Petrol",
            dateRegistered: "10 December 2001",
            motPassDate: "7 December 2023",
            motExpiredOn: "6 January 2024",
            expiryDate: "6 January 2025",
            isExpired: true
        },
        {
            id: 2,
            make: "BMW",
            model: "M5",
            registrationNumber: "L851 DMV",
            color: "Black",
            fuelType: "Petrol",
            dateRegistered: "10 December 2001",
            motPassDate: "7 December 2023",
            motExpiredOn: "6 January 2024",
            expiryDate: "28 January 2025",
            isExpired: true
        }
    ]

    // Report Field Component
    const ReportField = ({ label, value, className = "bg-gray-50 border-gray-300 text-gray-900" }: {
        label: string
        value: string
        className?: string
    }) => (
        <div>
            <Label className="text-sm text-gray-600 mb-1 block">{label}</Label>
            <Input value={value} readOnly className={`${className} text-sm h-9`} />
        </div>
    )

    return (
        <div className="">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

            <div className="space-y-6">
                {notifications.map((notification) => (
                    <div key={notification.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-gray-900">
                                    {notification.make} {notification.model}
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold inline-block">
                                    {notification.registrationNumber}
                                </div>
                            </div>
                        </div>

                        {/* Expired MOT Banner */}
                        {notification.isExpired && (
                            <div className="bg-red-500 text-white text-center py-4">
                                <div className="text-md font-medium font-inder mb-1">{notification.expiryDate}</div>
                                <div className="text-2xl font-inder font-semibold">This Vehicle's MOT Has Expired</div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <ReportField label="Colour" value={notification.color} />
                                    <ReportField label="MOT Pass Date" value={notification.motPassDate} className="bg-white border-green-300 text-green-700" />
                                </div>
                                <div className="space-y-4">
                                    <ReportField label="Fuel type" value={notification.fuelType} />
                                    <ReportField label="MOT expired on" value={notification.motExpiredOn} className="bg-white border-red-300 text-red-700" />
                                </div>
                                <div className="space-y-4">
                                    <ReportField label="Date registered" value={notification.dateRegistered} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
