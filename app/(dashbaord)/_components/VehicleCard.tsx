import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'

// Types
interface Vehicle {
    id: number
    registrationNumber: string
    expiryDate: string
    roadTax: string
    make: string
    model: string
    year: number
    image: string
}

interface VehicleCardProps {
    foundVehicles: Vehicle[]
}

// Utility function
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

export default function VehicleCard({ foundVehicles }: VehicleCardProps) {
    const router = useRouter()
    
    // State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

    // Event handlers
    const handleVehicleClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedVehicle(null)
    }

    const handleMotReports = () => {
        if (selectedVehicle) {
            router.push(`/driver/mot-reports/${selectedVehicle.registrationNumber}`)
        }
    }

    return (
        <>
            {/* Vehicle Cards */}
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-6">
                {foundVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {foundVehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="bg-[#DDF7E0] rounded-lg p-6 border border-[#B8EFBF] cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                                onClick={() => handleVehicleClick(vehicle)}
                            >
                                {/* Vehicle Image */}
                                <div className="flex justify-center mb-4">
                                    <div className="bg-green-100 rounded-lg flex items-center justify-center">
                                        <Image
                                            src={vehicle.image}
                                            alt={`${vehicle.make} ${vehicle.model}`}
                                            width={100}
                                            height={100}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                </div>

                                {/* Registration Number */}
                                <div className="text-center mb-4">
                                    <div className="bg-black text-white px-3 py-1 rounded inline-block text-sm font-bold">
                                        {vehicle.registrationNumber}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-lg mb-2">No vehicles found</div>
                        <p className="text-gray-600">Please check your registration number and postcode and try again.</p>
                    </div>
                )}
            </div>

            {/* Vehicle Details Modal */}
            <CustomReusableModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedVehicle ? `MOT Details for ${selectedVehicle.registrationNumber}` : "Vehicle Details"}
                showHeader={false}
                className="max-w-sm"
            >
                {selectedVehicle && (
                    <div className="bg-white rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#19CA32] text-white p-4 text-center">
                            <h2 className="text-lg font-semibold">MOT check</h2>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* MOT Status */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">MOT</span>
                                <span className="text-sm text-gray-600">
                                    Expired {formatDate(selectedVehicle.expiryDate)}
                                </span>
                            </div>

                            {/* Road Tax Status */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Road Tax</span>
                                <span className="text-sm text-gray-600">
                                    Expired {formatDate(selectedVehicle.roadTax)}
                                </span>
                            </div>

                            {/* Model Variant */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Model variant</span>
                                <span className="text-sm text-gray-600">
                                    {selectedVehicle.make} {selectedVehicle.model}
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
