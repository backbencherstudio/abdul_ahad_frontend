"use client"
import React from 'react'
import GarageProfileCard from '../../_components/Garage/GarageProfileCard'
import GarageProfileAdd from '../../_components/Garage/GarageProfileAdd'
import { useGetProfileQuery } from '@/rtk/api/garage/profileApis'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function GarageProfile() {
    const { data, isLoading, isError, refetch } = useGetProfileQuery()
    const profile = data?.data

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#19CA32]" />
                <p className="ml-2 text-sm text-gray-600">Loading garage profile...</p>
            </div>
        )
    }

    if (isError || !profile) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <p className="text-red-500 text-sm">Unable to load garage profile.</p>
                <Button onClick={() => refetch()} className="bg-[#19CA32] hover:bg-[#16b82e]">
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <GarageProfileCard
                garageName={profile.garage_name}
                address={profile.address}
                postcode={profile.zip_code}
                contact={profile.primary_contact || profile.phone_number}
                email={profile.email}
                vtsNumber={profile.vts_number}
                phoneNumber={profile.phone_number}
                avatarUrl={profile.avatar_url}
            />
            <GarageProfileAdd profile={profile} />
        </div>
    )
}
