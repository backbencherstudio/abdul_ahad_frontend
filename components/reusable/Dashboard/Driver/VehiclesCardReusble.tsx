import React, { memo, useMemo } from 'react'
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
}

// Skeleton cards to show while data is loading
const SkeletonCard = memo(() => (
    <div className="bg-[#F8FAFB] rounded-lg p-6 border border-[#B8EFBF] flex-shrink-0 w-80 animate-pulse">
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
    console.log('VehicleCard render:', vehicle.vehicleReg, 'isSelected:', isSelected)

    return (
        <div
            className={` rounded-lg p-6 border cursor-pointer transition-all duration-300 ease-in-out transform  hover:shadow-md flex-shrink-0 w-80 ${isSelected
                ? 'bg-[#DDF7E0] border-[#19CA32] shadow-md'
                : 'bg-[#F8FAFB] border-[#B8EFBF] hover:bg-[#DDF7E0]'
                }`}
            onClick={() => onVehicleClick?.(vehicle)}
        >
            {/* Vehicle Image */}
            <div className="flex justify-center mb-4">
                <div className="rounded-lg flex items-center justify-center transition-transform duration-200">
                    <Image
                        src={vehicle.vehicleImage || ''}
                        alt={`${vehicle.vehicleMake} ${vehicle.vehicleModel}`}
                        width={100}
                        height={100}
                        className="object-contain w-full h-full transition-all duration-200"
                        priority={isSelected}
                    />
                </div>
            </div>

            {/* Registration Number */}
            <div className="text-center mb-4">
                <div className={`text-white px-3 py-1 rounded inline-block text-sm font-bold transition-all duration-200 ${isSelected ? 'bg-[#19CA32] shadow-md' : 'bg-black'
                    }`}>
                    {vehicle.vehicleReg}
                </div>
            </div>
        </div>
    )
})

const VehiclesCardReusble = memo(({
    motReports,
    onVehicleClick,
    selectedRegistration
}: VehiclesCardReusbleProps) => {
    console.log('VehiclesCardReusble render - Reports count:', motReports.length, 'Selected:', selectedRegistration)

    // Memoize the cards to prevent unnecessary re-renders
    const vehicleCards = useMemo(() => {
        if (motReports.length === 0) {
            return (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            )
        }

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
    }, [motReports, selectedRegistration, onVehicleClick])

    return (
        <div className="bg-white rounded-md shadow-sm p-4">
            <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-max p-2">
                    {vehicleCards}
                </div>
            </div>
        </div>
    )
})

// Set display names for better debugging
SkeletonCard.displayName = 'SkeletonCard'
VehicleCard.displayName = 'VehicleCard'
VehiclesCardReusble.displayName = 'VehiclesCardReusble'

export default VehiclesCardReusble
