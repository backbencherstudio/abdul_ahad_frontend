'use client'

import React, { useEffect } from 'react'
import MotFeeAdd from '../../_components/Garage/MotFeeAdd'
import AdditionalServicesAdd from '../../_components/Garage/AdditionalServicesAdd'
import { Button } from '@/components/ui/button'
import { useGetPricingQuery } from '@/rtk/api/garage/pricingApis'
import { useAppDispatch, setPricingFromResponse } from '@/rtk'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'

export default function Pricing() {
    const dispatch = useAppDispatch()
    const { data, isLoading, isError, refetch } = useGetPricingQuery()
    const prevDataRef = React.useRef<string | null>(null)
    const hasLoadedRef = React.useRef(false)

    // Load data into Redux store when fetched
    useEffect(() => {
        if (data) {
            // Use JSON stringify to compare data objects and prevent unnecessary dispatches
            const dataStr = JSON.stringify(data)
            // Always load on first mount, or when data actually changes
            if (!hasLoadedRef.current || prevDataRef.current !== dataStr) {
                prevDataRef.current = dataStr
                hasLoadedRef.current = true
                dispatch(setPricingFromResponse(data))
            }
        }
    }, [data, dispatch])

    const handleGlobalSave = () => {
        const btn = document.getElementById('pricing-main-save') as HTMLButtonElement | null
        btn?.click()
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* MOT Fee Card Shimmer */}
                <div className="bg-white rounded-lg border border-[#19CA32] p-6 animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <div className="relative">
                                <Skeleton className="h-11 w-full rounded-md" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <div className="relative">
                                <Skeleton className="h-11 w-full rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Services Card Shimmer */}
                <div className="bg-white rounded-lg border border-[#19CA32] py-5 animate-pulse">
                    <div className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-10 w-32 rounded-md" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((index) => (
                                <div key={index} className="space-y-2 rounded-md border border-[#19CA32] p-4">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-11 w-full rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Save Button Shimmer */}
                <div className="mb-10">
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <p className="text-red-500 text-sm">Unable to load pricing data.</p>
                <Button onClick={() => refetch()} className="bg-[#19CA32] hover:bg-[#16b82e]">
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <>
            <MotFeeAdd />
            <AdditionalServicesAdd />

            <div className="mb-10">
                <Button
                    type="button"
                    onClick={handleGlobalSave}
                    className="w-full h-10 bg-[#19CA32] cursor-pointer hover:bg-[#16b82e] text-white font-medium text-base"
                >
                    Save
                </Button>
            </div>
        </>
    )
}
