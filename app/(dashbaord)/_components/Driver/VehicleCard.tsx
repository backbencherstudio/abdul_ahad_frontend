import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { getBrandLogo } from '@/helper/vehicle.helper'

import { VehicleData } from '@/rtk/slices/driver/bookMyMotSlice'

// Types
interface VehicleCardProps {
    vehicle: VehicleData | null
}

// Utility function
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

// Check if image URL is valid
const isValidImageUrl = (url: string): boolean => {
    if (!url || url.includes('example') || url === '') return false
    return true
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
    const router = useRouter()
    
    // State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Get vehicle image or logo
    const vehicleImage = vehicle ? getBrandLogo(vehicle.make) : ''

    // Event handlers
    const handleVehicleClick = () => {
        if (vehicle) {
            setIsModalOpen(true)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const handleMotReports = () => {
        if (vehicle) {
            router.push(`/driver/mot-reports/${vehicle.registration_number}`)
        }
    }

    const handleImageError = () => {
        setImageError(true)
    }

    if (!vehicle) {
        return (
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-6">
                <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-2">No vehicle found</div>
                    <p className="text-gray-600">Please check your registration number and postcode and try again.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Vehicle Card */}
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div
                        className="bg-[#F8FAFB] rounded-lg p-6 border border-[#B8EFBF] cursor-pointer hover:shadow-md transition-all duration-200 group"
                        onClick={handleVehicleClick}
                    >
                        {/* Vehicle Image or Brand Name */}
                        <div className="flex justify-center mb-4">
                            <div className="rounded-lg flex items-center justify-center min-h-[100px]">
                                {imageError || !isValidImageUrl(vehicleImage) ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-14 h-14 bg-gradient-to-br from-[#19CA32] to-[#16b82e] rounded-full flex items-center justify-center mb-2 shadow-md">
                                            <span className="text-white text-xl font-bold">
                                                {vehicle.make.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-gray-700 font-semibold text-sm text-center px-2">
                                            {vehicle.make}
                                        </span>
                                    </div>
                                ) : (
                                    <Image
                                        src={vehicleImage}
                                        alt={`${vehicle.make} ${vehicle.model}`}
                                        width={100}
                                        height={100}
                                        className="object-contain w-full h-full"
                                        onError={handleImageError}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Registration Number */}
                        <div className="text-center mb-4">
                            <div className="bg-black text-white px-3 py-1 rounded inline-block text-sm font-bold">
                                {vehicle.registration_number}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Details Modal */}
            <CustomReusableModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={vehicle ? `MOT Details for ${vehicle.registration_number}` : "Vehicle Details"}
                showHeader={false}
                className="max-w-sm"
            >
                {vehicle && (
                    <div className="bg-white rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#19CA32] text-white p-4 text-center">
                            <h2 className="text-lg font-semibold">MOT check</h2>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* MOT Status */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">MOT Expiry Date</span>
                                <span className="text-sm text-gray-600">
                                    {formatDate(vehicle.mot_expiry_date)}
                                </span>
                            </div>

                            {/* Model Variant */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Model variant</span>
                                <span className="text-sm text-gray-600">
                                    {vehicle.make} {vehicle.model}
                                </span>
                            </div>

                            {/* Color */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Color</span>
                                <span className="text-sm text-gray-600">
                                    {vehicle.color}
                                </span>
                            </div>

                            {/* Fuel Type */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Fuel Type</span>
                                <span className="text-sm text-gray-600">
                                    {vehicle.fuel_type}
                                </span>
                            </div>

                            {/* MOT Reports Button */}
                            <Button 
                                onClick={handleMotReports}
                                className="w-full bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium py-3 mt-6 rounded-lg"
                            >
                                MOT Reports
                            </Button>
                        </div>
                    </div>
                )}
            </CustomReusableModal>
        </>
    )
}
