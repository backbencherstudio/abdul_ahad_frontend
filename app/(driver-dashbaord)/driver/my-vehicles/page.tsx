'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

// ========================= TYPES =========================
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

// ========================= CONSTANTS =========================
const BRAND_COLOR = '#19CA32'
const BRAND_COLOR_HOVER = '#16b82e'
const REGISTRATION_PATTERN = /^[A-Z0-9\s]{2,8}$/i

export default function MyVehicles() {
    const router = useRouter()
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
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddVehicleForm>()

    // ========================= UTILITIES =========================
    const searchVehicle = async (registrationNumber: string): Promise<Vehicle | null> => {
        try {
            const response = await fetch('/data/vehicle.json')
            if (!response.ok) throw new Error('Failed to fetch vehicle data')

            const vehicleData: Vehicle[] = await response.json()
            return vehicleData.find(vehicle =>
                vehicle.registrationNumber.toLowerCase() === registrationNumber.toLowerCase()
            ) || null
        } catch (error) {
            console.error('Error fetching vehicle data:', error)
            return null
        }
    }

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // ========================= EVENT HANDLERS =========================
    const onSubmit = async (data: AddVehicleForm) => {
        setIsLoading(true)

        try {
            const existingVehicle = vehicles.find(v =>
                v.registrationNumber.toLowerCase() === data.registrationNumber.toLowerCase()
            )

            if (existingVehicle) {
                toast.error('Vehicle already exists in your list!')
                return
            }

            const foundVehicle = await searchVehicle(data.registrationNumber)

            if (foundVehicle) {
                const newVehicle = { ...foundVehicle, id: vehicles.length + 1 }
                setVehicles(prev => [...prev, newVehicle])
                toast.success('Vehicle added successfully!')
                handleCloseModal()
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

    const handleVehicleClick = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle)
        setIsDetailsModalOpen(true)
    }

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false)
        setSelectedVehicle(null)
    }

    const removeVehicle = (vehicleId: number, event: React.MouseEvent) => {
        event.stopPropagation()
        setVehicles(prev => prev.filter(v => v.id !== vehicleId))
        toast.success('Vehicle removed successfully!')
    }

    const handleMotReports = () => {
        if (selectedVehicle) {
            router.push(`/driver/mot-reports/${selectedVehicle.registrationNumber}`)
        }
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Vehicles</h1>
                <p className="text-gray-600">Manage your registered vehicles</p>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-[#F8FAFB] p-4 rounded-[16px]">
                {vehicles.map((vehicle) => (
                    <div
                        key={vehicle.id}
                        className="bg-[#F8FAFB] relative rounded-lg p-6 border border-[#B8EFBF] cursor-pointer hover:shadow-md transition-all duration-200 group"
                        onClick={() => handleVehicleClick(vehicle)}
                    >
                        {/* Delete Button - Shows on hover */}
                        <button
                            onClick={(e) => removeVehicle(vehicle.id, e)}
                            className="absolute cursor-pointer top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                            title="Remove Vehicle"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Vehicle Image */}
                        <div className="flex justify-center mb-4">
                            <div className=" rounded-lg flex items-center justify-center">
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

                {/* Add Vehicle Card */}
                <div
                    className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[${BRAND_COLOR}] hover:bg-green-50 transition-colors`}
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className={`w-12 h-12 bg-[${BRAND_COLOR}] rounded-full flex items-center justify-center mb-4`}>
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
                    <div className={`bg-[${BRAND_COLOR}] text-white p-4 flex items-center justify-between`}>
                        <h2 className="text-lg font-semibold">Add Another Vehicle</h2>
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
                                    className={`w-full py-3 text-base border-gray-300 focus:border-[${BRAND_COLOR}] focus:ring-[${BRAND_COLOR}] rounded-md`}
                                    {...register('registrationNumber', {
                                        required: 'Registration number is required',
                                        pattern: {
                                            value: REGISTRATION_PATTERN,
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
                                className={`w-full bg-[${BRAND_COLOR}] hover:bg-[${BRAND_COLOR_HOVER}] text-white font-medium py-3 text-base rounded-md transition-all duration-200 cursor-pointer disabled:bg-[${BRAND_COLOR}]/70 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? 'Adding Vehicle...' : 'Add Vehicle'}
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomReusableModal>

            {/* Vehicle Details Modal */}
            <CustomReusableModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseDetailsModal}
                title={selectedVehicle ? `MOT Details for ${selectedVehicle.registrationNumber}` : "Vehicle Details"}
                showHeader={false}
                className="max-w-sm"
            >
                {selectedVehicle && (
                    <div className="bg-white rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className={`bg-[${BRAND_COLOR}] text-white p-4 text-center`}>
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
                                className={`w-full cursor-pointer bg-[${BRAND_COLOR}] hover:bg-[${BRAND_COLOR_HOVER}] text-white font-medium py-3 mt-6 rounded-lg`}
                            >
                                MOT Reports
                            </Button>
                        </div>
                    </div>
                )}
            </CustomReusableModal>
        </div>
    )
}
