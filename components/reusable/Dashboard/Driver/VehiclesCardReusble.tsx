import React, { memo, useMemo, useState } from 'react'
import Image from 'next/image'

interface MotReport {
    id: number
    color: string
    fuelType: string
    registrationDate: string
    motTestNumber: string
    motPassDate: string
    motExpiryDate: string
    motStatus: string
    vehicleReg?: string
    vehicleImage?: string
    vehicleMake?: string
    vehicleModel?: string
}

interface VehiclesCardReusbleProps {
    motReports: MotReport[]
    onVehicleClick?: (vehicle: MotReport) => void
    selectedRegistration?: string | null
    isLoading?: boolean
}

// Check if image URL is valid
const isValidImageUrl = (url: string): boolean => {
    if (!url || url.includes('example') || url === '') return false
    return true
}

// Skeleton cards to show while data is loading
const SkeletonCard = memo(() => (
    <div className="bg-[#F8FAFB] rounded-lg p-6 border border-[#B8EFBF] animate-pulse">
        {/* Skeleton Image */}
        <div className="flex justify-center mb-4">
            <div className="w-[100px] h-[100px] bg-gray-200 rounded-lg"></div>
        </div>
        {/* Skeleton Registration */}
        <div className="text-center mb-4">
            <div className="bg-gray-300 px-3 py-1 rounded inline-block text-sm font-bold w-20 h-6"></div>
        </div>
    </div>
))

const VehicleCard = memo(({
    vehicle,
    isSelected,
    onVehicleClick
}: {
    vehicle: MotReport
    isSelected: boolean
    onVehicleClick?: (vehicle: MotReport) => void
}) => {
    const [imageError, setImageError] = useState(false)

    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <div
            className={`bg-[#F8FAFB] rounded-lg p-6 border border-[#B8EFBF] cursor-pointer hover:shadow-md transition-all duration-200 group ${isSelected ? 'ring-2 ring-[#19CA32]' : ''}`}
            onClick={() => onVehicleClick?.(vehicle)}
        >
            {/* Vehicle Image or Brand Name */}
            <div className="flex justify-center mb-4">
                <div className="rounded-lg flex items-center justify-center min-h-[100px]">
                    {imageError || !isValidImageUrl(vehicle.vehicleImage || '') ? (
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#19CA32] to-[#16b82e] rounded-full flex items-center justify-center mb-2 shadow-md">
                                <span className="text-white text-xl font-bold">
                                    {vehicle.vehicleMake?.charAt(0).toUpperCase() || 'V'}
                                </span>
                            </div>
                            <span className="text-gray-700 font-semibold text-sm text-center px-2">
                                {vehicle.vehicleMake || 'Vehicle'}
                            </span>
                        </div>
                    ) : (
                        <Image
                            src={vehicle.vehicleImage || ''}
                            alt={`${vehicle.vehicleMake} ${vehicle.vehicleModel}`}
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
                    {vehicle.vehicleReg}
                </div>
            </div>
        </div>
    )
})

const VehiclesCardReusble = memo(({
    motReports,
    onVehicleClick,
    selectedRegistration,
    isLoading = false
}: VehiclesCardReusbleProps) => {
    // Memoize the cards to prevent unnecessary re-renders
    const vehicleCards = useMemo(() => {
        // Show skeleton only when loading
        if (isLoading) {
            return (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            )
        }

        // Show empty state when not loading and no data
        if (motReports.length === 0) {
            return (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-600 text-lg">No vehicles found.</p>
                    <p className="text-gray-500 text-sm mt-2">Add vehicles to see MOT reports here.</p>
                </div>
            )
        }

        // Show vehicle cards when data is available
        return motReports.map((vehicle, index) => {
            const isSelected = selectedRegistration && vehicle.vehicleReg &&
                selectedRegistration.toLowerCase() === vehicle.vehicleReg.toLowerCase()

            return (
                <VehicleCard
                    key={`${vehicle.vehicleReg}-${vehicle.id}`}
                    vehicle={vehicle}
                    isSelected={!!isSelected}
                    onVehicleClick={onVehicleClick}
                />
            )
        })
    }, [motReports, selectedRegistration, onVehicleClick, isLoading])

    return (
        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vehicleCards}
            </div>
        </div>
    )
})

// Set display names for better debugging
SkeletonCard.displayName = 'SkeletonCard'
VehicleCard.displayName = 'VehicleCard'
VehiclesCardReusble.displayName = 'VehiclesCardReusble'

export default VehiclesCardReusble
