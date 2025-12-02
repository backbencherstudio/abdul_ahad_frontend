import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import BookingModal from './BookingModal'
import { GarageData } from '@/rtk/slices/driver/bookMyMotSlice'

interface GarageCardProps {
    foundGarages: GarageData[]
}

export default function GarageCard({ foundGarages }: GarageCardProps) {
    const router = useRouter()
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [selectedGarage, setSelectedGarage] = useState<GarageData | null>(null)

    const handleMoreDetails = (garageId: string) => {
        router.push(`/driver/book-my-mot/details?id=${garageId}`)
    }

    const handleBookNow = (garage: GarageData) => {
        setSelectedGarage(garage)
        setIsBookingModalOpen(true)
    }
    return (
        <div className="space-y-4">
            {foundGarages.map((garage) => (
                <div key={garage.id} className="bg-[#F8FAFB] rounded-lg p-4 flex flex-col lg:flex-row gap-4 items-start">
                    {/* Garage Image */}
                    <div className="w-full lg:w-40 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="text-5xl">🏢</span>
                    </div>

                    {/* Garage Details */}
                    <div className="flex-1">
                        <div className='border-b border-gray-200 pb-3 mb-3'>
                            <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-1">
                                Garage: {garage.garage_name}
                            </h3>
                            <p className="text-gray-600 text-sm xl:text-base">Address : {garage.address}</p>
                        </div>

                        <div className="space-y-1 text-sm xl:text-base text-gray-600">
                            <div>Postcode : {garage.postcode}</div>
                            <div>Contact : {garage.primary_contact}</div>
                            <div>Phone : {garage.phone_number}</div>
                            <div>VTS Number : {garage.vts_number}</div>
                        </div>
                    </div>

                    {/* Action Buttons and Price */}
                    <div className="flex flex-col items-end gap-3 w-full lg:w-48">
                        {/* Price can be added later if available in API response */}

                        <div className="w-full space-y-2">
                            <Button
                                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium py-3 text-sm rounded-lg"
                                onClick={() => handleBookNow(garage)}
                            >
                                Book My MOT
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full cursor-pointer border-[#19CA32] text-[#19CA32] hover:bg-[#19CA32] hover:text-white py-3 text-sm rounded-lg"
                                onClick={() => handleMoreDetails(garage.id)}
                            >
                                More Details
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                garage={selectedGarage}
            />
        </div>
    )
}
