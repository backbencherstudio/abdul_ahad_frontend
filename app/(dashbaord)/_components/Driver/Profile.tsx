"use client"
import React, { useState } from 'react'
import { User, Lock } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import MyProfile from '../Common/MyProfile'
import CommonPasswordChangeComponent from '../../_components/Common/PasswordChange'

// Tab Button Component
const TabButton = ({
    isActive,
    onClick,
    icon: Icon,
    children
}: {
    isActive: boolean
    onClick: () => void
    icon: React.ComponentType<any>
    children: React.ReactNode
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 text-sm lg:text-base cursor-pointer p-3 rounded-lg text-left transition-all ${isActive
            ? 'bg-green-100 text-green-700'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
    >
        <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-500'
            }`} />
        {children}
    </button>
)

// Main Component
export default function DriverProfile() {
    // State
    const [activeTab, setActiveTab] = useState('profile')

    return (
        <div className="">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full lg:w-64">
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <div className="space-y-2 flex flex-row lg:flex-col gap-2">
                                <TabButton
                                    isActive={activeTab === 'profile'}
                                    onClick={() => setActiveTab('profile')}
                                    icon={User}
                                >
                                    My Profile
                                </TabButton>
                                <TabButton
                                    isActive={activeTab === 'password'}
                                    onClick={() => setActiveTab('password')}
                                    icon={Lock}
                                >
                                    Password
                                </TabButton>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <MyProfile />
                    )}

                    {activeTab === 'password' && (
                        <CommonPasswordChangeComponent />
                    )}
                </div>
            </div>
        </div>
    )
}
