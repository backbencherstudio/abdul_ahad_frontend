"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
]

export default function DefultCalanderViewShimmer() {
    return (
        <Card className="w-full">
            <CardContent className="p-4 sm:p-5">
                <div className="space-y-2">
                    {DAYS.map((day, index) => (
                        <div
                            key={day}
                            className={`pb-3 ${index !== DAYS.length - 1 ? 'border-b border-gray-200' : ''}`}
                        >
                            {/* Day Name and Closed Switch Shimmer */}
                            <div className="mb-3 flex justify-between items-center">
                                {/* Day Name Shimmer */}
                                <Skeleton className="h-5 w-24 bg-gray-200" />

                                {/* Closed Switch Shimmer */}
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-16 bg-gray-200" />
                                    <Skeleton className="h-5 w-10 rounded-full bg-gray-200" />
                                </div>
                            </div>

                            {/* Main Row - From/To Times, Duration, Add Break Button Shimmer */}
                            <div className="flex flex-col 2xl:flex-row 2xl:items-start gap-3">
                                {/* From Time Shimmer */}
                                <div className="flex-1 min-w-0">
                                    <Skeleton className="h-3 w-12 mb-1 bg-gray-200" />
                                    <Skeleton className="h-9 w-full rounded bg-gray-100" />
                                </div>

                                {/* To Time Shimmer */}
                                <div className="flex-1 min-w-0">
                                    <Skeleton className="h-3 w-8 mb-1 bg-gray-200" />
                                    <Skeleton className="h-9 w-full rounded bg-gray-100" />
                                </div>

                                <div className='flex sm:flex-row flex-col justify-between gap-3'>
                                    {/* Duration Input Shimmer */}
                                    <div className="flex-shrink-0 w-full sm:w-6/12">
                                        <Skeleton className="h-3 w-20 mb-1 bg-gray-200" />
                                        <Skeleton className="h-9 w-full rounded bg-gray-100" />
                                    </div>

                                    {/* Manage Breaks Button Shimmer */}
                                    <div className="flex-shrink-0 w-full sm:w-6/12 pr-3">
                                        <Skeleton className="h-4 w-12 mb-1 bg-gray-200 opacity-0" />
                                        <Skeleton className="h-9 w-full rounded bg-gray-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

