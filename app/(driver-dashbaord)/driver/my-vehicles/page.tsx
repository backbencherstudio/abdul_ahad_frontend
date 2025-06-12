'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { toast } from 'react-toastify'

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

interface AddVehicleForm {
    registrationNumber: string
}

export default function MyVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([
        {
            id: 1,
            registrationNumber: "LS51DMV",
            expiryDate: "2025-01-01",
            roadTax: "2025-01-01",
            make: "Ford",
            model: "Focus",
            year: 2020,
            image: "https://i.ibb.co/PGwBJx13/pngegg-2-1.png"
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddVehicleForm>()

    const searchVehicle = async (registrationNumber: string) => {
        try {
            const response = await fetch('/data/vehicle.json')
            const vehicleData: Vehicle[] = await response.json()
            return vehicleData.find(vehicle =>
                vehicle.registrationNumber.toLowerCase() === registrationNumber.toLowerCase()
            )
        } catch (error) {
            console.error('Error fetching vehicle data:', error)
            return null
        }
    }

    const onSubmit = async (data: AddVehicleForm) => {
        setIsLoading(true)

        try {
            // Check if vehicle already exists in user's list
            const existingVehicle = vehicles.find(v =>
                v.registrationNumber.toLowerCase() === data.registrationNumber.toLowerCase()
            )

            if (existingVehicle) {
                alert('Vehicle already exists in your list!')
                setIsLoading(false)
                return
            }

            // Search for vehicle in database
            const foundVehicle = await searchVehicle(data.registrationNumber)

            if (foundVehicle) {
                // Add vehicle to user's list with new ID
                const newVehicle = {
                    ...foundVehicle,
                    id: vehicles.length + 1
                }
                setVehicles(prev => [...prev, newVehicle])
                toast.success('Vehicle added successfully!')
                setIsModalOpen(false)
                reset()
            } else {
                toast.error('Vehicle not found! Please check the registration number.')
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.')
            console.error('Error adding vehicle:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        reset()
    }

    const removeVehicle = (vehicleId: number) => {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId))
        toast.success('Vehicle removed successfully!')
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Vehicles</h1>
                <p className="text-gray-600">Manage your registered vehicles</p>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Existing Vehicles */}
                {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative group hover:shadow-md transition-shadow">
                        {/* Remove Button */}
                        <button
                            onClick={() => removeVehicle(vehicle.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Vehicle Image */}
                        <div className="flex justify-center mb-4 bg-gray-50 rounded-lg p-4">
                            <Image
                                src={vehicle.image}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                width={120}
                                height={80}
                                className="object-contain"
                            />
                        </div>

                        {/* Registration Number */}
                        <div className="text-center mb-3">
                            <div className="bg-black text-white px-3 py-1 rounded inline-block text-sm font-bold">
                                {vehicle.registrationNumber}
                            </div>
                        </div>

                       
                    </div>
                ))}

                {/* Add Vehicle Card */}
                <div
                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#19CA32] hover:bg-green-50 transition-colors min-h-[280px]"
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className="w-12 h-12 bg-[#19CA32] rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Add Vehicle</h3>
                    <p className="text-gray-500 text-center text-sm">Click to add a new vehicle to your collection</p>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            <CustomReusableModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Add Another Vehicle"
                showHeader={false}
                className="max-w-sm"
            >
                <div className="bg-white rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#19CA32] text-white p-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Add Another Vehicle</h2>
                        <button
                            onClick={handleCloseModal}
                            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                        <div className="space-y-4">
                            {/* Registration Number Input */}
                            <div className="space-y-2">
                                <Label htmlFor="registrationNumber" className="text-sm font-medium text-gray-700">
                                    Registration Number
                                </Label>
                                <Input
                                    id="registrationNumber"
                                    type="text"
                                    placeholder="XXXXXXX"
                                    className="w-full py-3 text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-md"
                                    {...register('registrationNumber', {
                                        required: 'Registration number is required',
                                        pattern: {
                                            value: /^[A-Z0-9\s]{2,8}$/i,
                                            message: 'Invalid registration number format'
                                        }
                                    })}
                                />
                                {errors.registrationNumber && (
                                    <p className="text-red-500 text-sm">{errors.registrationNumber.message}</p>
                                )}
                            </div>

                            {/* Add Vehicle Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium py-3 text-base rounded-md transition-all duration-200 cursor-pointer disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Adding Vehicle...' : 'Add Vehicle'}
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomReusableModal>
        </div>
    )
}
