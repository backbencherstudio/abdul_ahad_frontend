"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'

import imgMot from '@/public/Image/admin/cardMot.png'
import VehicleCard from '../../_components/VehicleCard'
import GarageCard from '../../_components/GarageCard'

interface FormData {
    registrationNumber: string
    postcode: string
}

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

export default function BookMyMOT() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
    const [isLoading, setIsLoading] = useState(false)
    const [foundVehicles, setFoundVehicles] = useState<Vehicle[]>([])
    const [foundGarages, setFoundGarages] = useState<Garage[]>([])
    const [showResults, setShowResults] = useState(false)

    const searchVehicles = async (registrationNumber: string) => {
        try {
            const response = await fetch('/data/vehicle.json')
            const vehicles: Vehicle[] = await response.json()

            const matchedVehicles = vehicles.filter(vehicle =>
                vehicle.registrationNumber.toLowerCase().includes(registrationNumber.toLowerCase())
            )

            return matchedVehicles
        } catch (error) {
            console.error('Error fetching vehicle data:', error)
            return []
        }
    }

    const searchGarages = async (postcode: string) => {
        try {
            const response = await fetch('/data/garage.json')
            const garages: Garage[] = await response.json()

            const matchedGarages = garages.filter(garage =>
                garage.postcode.toLowerCase().includes(postcode.toLowerCase())
            )

            return matchedGarages
        } catch (error) {
            console.error('Error fetching garage data:', error)
            return []
        }
    }

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            const [vehicles, garages] = await Promise.all([
                searchVehicles(data.registrationNumber),
                searchGarages(data.postcode)
            ])

            setFoundVehicles(vehicles)
            setFoundGarages(garages)
            setShowResults(true)

            // Smart toast messages
            if (vehicles.length > 0 && garages.length > 0) {
                toast.success(`Found ${vehicles.length} vehicle(s) and ${garages.length} garage(s)!`)
            } else if (vehicles.length > 0 && garages.length === 0) {
                toast.warning(`Found ${vehicles.length} vehicle(s) but no garages in your area`)
            } else if (vehicles.length === 0 && garages.length > 0) {
                toast.warning(`Found ${garages.length} garage(s) but no vehicle with that registration`)
            } else {
                toast.error('No vehicles or garages found with the provided details')
            }
        } catch (error) {
            console.error('Search error:', error)
            toast.error('Failed to search data')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-md shadow-sm p-4 sm:p-6  mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-start bg-[#F8FAFB] p-4 rounded-md">
                    {/* Registration Number */}
                    <div className="space-y-2">
                        <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">
                            Registration Number
                        </Label>
                        <Input
                            id="registrationNumber"
                            type="text"
                            placeholder="XXXXXXX"
                            className="py-5 text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-md"
                            {...register('registrationNumber', {
                                required: 'Registration number is required',
                                pattern: {
                                    value: /^[A-Z0-9\s]{2,8}$/i,
                                    message: 'Invalid registration number format'
                                }
                            })}
                        />
                        <div className="h-5">
                            {errors.registrationNumber && (
                                <p className="text-red-500 text-sm">{errors.registrationNumber.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Postcode */}
                    <div className="space-y-2">
                        <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                            Postcode
                        </Label>
                        <Input
                            id="postcode"
                            type="text"
                            placeholder="XXXXXXX"
                            className="py-5 text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-md"
                            {...register('postcode', {
                                required: 'Postcode is required',
                            })}
                        />
                        <div className="h-5">
                            {errors.postcode && (
                                <p className="text-red-500 text-sm">{errors.postcode.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Find Garage Button */}
                    <div className="sm:col-span-2 lg:col-span-1 space-y-2">
                        <div className="h-6"></div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium text-base rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Searching...' : 'Find Garage'}
                        </Button>
                        <div className="h-5"></div>
                    </div>
                </div>
            </form>

            {/* Search Results Section */}
            {showResults && (
                <div className="w-full mx-auto mt-8">
                    {/* Vehicle Results */}
                    {foundVehicles.length > 0 ? (
                        <VehicleCard foundVehicles={foundVehicles} />
                    ) : (
                        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mb-4">
                            <div className="text-center py-6">
                                <div className="text-red-500 text-lg font-medium mb-2">Vehicle Not Found</div>
                                <p className="text-gray-600">No vehicle found with the registration number you provided. Please check and try again.</p>
                            </div>
                        </div>
                    )}

                    {/* Garages Results */}
                    {foundGarages.length > 0 ? (
                        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mt-8">
                            {/* Payment Message */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-700 text-xl font-medium">
                                    No upfront payment required - simply pay at your appointment.
                                </p>
                            </div>

                            {/* Garage List */}
                            <GarageCard foundGarages={foundGarages} />
                        </div>
                    ) : (
                        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mt-8">
                            <div className="text-center py-6">
                                <div className="text-red-500 text-lg font-medium mb-2">Garage Not Found</div>
                                <p className="text-gray-600">No garage found with the postcode you provided. Please check and try again.</p>
                            </div>
                        </div>
                    )}

                    {/* Search Again Button */}
                    <div className="mt-6 text-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowResults(false)
                                setFoundVehicles([])
                                setFoundGarages([])
                            }}
                            className="px-6 py-2 cursor-pointer border-[#19CA32] text-[#19CA32] hover:bg-[#19CA32] hover:text-white"
                        >
                            Search Again
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content Section - Only show when no search results */}
            {!showResults && (
                <div className=" flex items-center justify-center ">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Text Content */}
                        <div className="my-8">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl  font-medium text-[#19CA32] mb-6 leading-tight font-inder">
                                Input Registration<br />
                                Number & Postcode
                            </h1>
                        </div>

                        {/* Car Illustration */}
                        <div className="flex justify-center">
                            <div className="relative w-full max-w-md lg:max-w-lg">
                                <Image
                                    src={imgMot}
                                    alt="MOT Testing Illustration"
                                    className="w-full h-auto object-contain"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 