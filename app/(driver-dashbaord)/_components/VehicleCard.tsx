import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

export default function VehicleCard({ foundVehicles }: { foundVehicles: any }) {
    return (
        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6">
            {foundVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {foundVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-[#DDF7E0] rounded-lg p-6 border border-[#B8EFBF]">
                            {/* Vehicle Image */}
                            <div className="flex justify-center mb-4">
                                <div className=" bg-green-100 rounded-lg flex items-center justify-center">
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
    )
}
