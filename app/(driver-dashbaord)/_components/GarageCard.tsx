import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface Garage {
    id: number
    name: string
    address: string
    phone: string
    email: string
    vstNumber: string
    postcode: string
    motFee: string
    restestFee: string
    location: string
    services: string[]
    openingHours: Array<{
        day: string
        open: string
        close: string
    }>
    image: string
}

interface GarageCardProps {
    foundGarages: Garage[]
}

export default function GarageCard({ foundGarages }: GarageCardProps) {
    return (
        <div className="space-y-4">
            {foundGarages.map((garage) => (
                <div key={garage.id} className="bg-[#F8FAFB] rounded-lg p-4 flex flex-col lg:flex-row gap-4 items-start">
                    {/* Garage Image */}
                    <div className="w-full lg:w-40 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Image
                            src={garage.image}
                            alt={garage.name}
                            width={160}
                            height={112}
                            className="object-cover w-full h-full rounded-lg"
                        />
                    </div>

                    {/* Garage Details */}
                    <div className="flex-1">
                        <div className='border-b border-gray-200 pb-3 mb-3'>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                Garage: {garage.name}
                            </h3>
                            <p className="text-gray-600">Address : {garage.address}</p>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            <div>Postcode : {garage.postcode}</div>
                            <div>Contact : {garage.phone}</div>
                            <div>Email : {garage.email}</div>
                            <div>VTS Number : {garage.vstNumber}</div>
                        </div>
                    </div>

                    {/* Action Buttons and Price */}
                    <div className="flex flex-col items-end gap-3 w-full lg:w-48">
                        <div className="text-3xl font-bold text-[#19CA32]">
                            £ {garage.motFee}.25
                        </div>

                        <div className="w-full space-y-2">
                            <Button className="w-full bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium py-3 text-sm rounded-lg">
                                Book My MOT
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full border-[#19CA32] text-[#19CA32] hover:bg-[#19CA32] hover:text-white py-3 text-sm rounded-lg"
                            >
                                More Details
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
