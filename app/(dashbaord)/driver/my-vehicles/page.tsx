'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, X, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import ConfirmationModal from '@/components/reusable/ConfirmationModal'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useGetVehiclesQuery, useDeleteVehicleMutation, useAddVehicleMutation } from '@/rtk/api/driver/vehiclesApis'
import { getBrandLogo } from '@/helper/vehicle.helper'
import {
    openAddModal,
    closeAddModal,
    openDetailsModal,
    closeDetailsModal,
    setImageError,
    openDeleteConfirm,
    closeDeleteConfirm,
    selectIsModalOpen,
    selectIsDetailsModalOpen,
    selectSelectedVehicle,
    selectImageErrors,
    selectDeleteConfirmOpen,
    selectVehicleToDelete,
} from '@/rtk/slices/driver/vehiclesSlice'
import type { AppDispatch } from '@/rtk/store'

// ========================= TYPES =========================
interface ApiVehicle {
    id: string
    created_at: string
    updated_at: string
    user_id: string
    registration_number: string
    make: string
    model: string
    color: string
    fuel_type: string
    year_of_manufacture: number
    engine_capacity: number
    co2_emissions: number
    mot_expiry_date: string
    dvla_data: string
    mot_data: string
    mot_reports: any[]
}

interface Vehicle {
    id: string
    registrationNumber: string
    expiryDate: string
    roadTax: string
    make: string
    model: string
    year: number
    image: string
}

interface AddVehicleForm {
    registration_number: string
}

// ========================= CONSTANTS =========================
const BRAND_COLOR = '#19CA32'
const BRAND_COLOR_HOVER = '#16b82e'
const REGISTRATION_PATTERN = /^[A-Z0-9\s]{2,8}$/i

export default function MyVehicles() {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    
    // Redux state
    const isModalOpen = useSelector(selectIsModalOpen)
    const isDetailsModalOpen = useSelector(selectIsDetailsModalOpen)
    const selectedVehicle = useSelector(selectSelectedVehicle)
    const imageErrors = useSelector(selectImageErrors)
    const deleteConfirmOpen = useSelector(selectDeleteConfirmOpen)
    const vehicleToDelete = useSelector(selectVehicleToDelete)

    // API Hooks
    const { data: vehiclesResponse, isLoading: isLoadingVehicles, refetch } = useGetVehiclesQuery()
    const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation()
    const [addVehicle, { isLoading: isAdding }] = useAddVehicleMutation()

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AddVehicleForm>()

    // Handle image error
    const handleImageError = (vehicleId: string) => {
        dispatch(setImageError(vehicleId))
    }

    // ========================= UTILITIES =========================
    // Check if image URL is valid (not a placeholder)
    const isValidImageUrl = (url: string): boolean => {
        if (!url || url.includes('example') || url === '') return false
        return true
    }

    // Transform API vehicle data to component format
    const transformVehicle = (apiVehicle: ApiVehicle): Vehicle => {
        let roadTax = 'N/A'
        try {
            const dvlaData = JSON.parse(apiVehicle.dvla_data || '{}')
            roadTax = dvlaData.taxDueDate || apiVehicle.mot_expiry_date || 'N/A'
        } catch (e) {
            roadTax = apiVehicle.mot_expiry_date || 'N/A'
        }

        const imageUrl = getBrandLogo(apiVehicle.make)
        
        return {
            id: apiVehicle.id,
            registrationNumber: apiVehicle.registration_number,
            expiryDate: apiVehicle.mot_expiry_date || '',
            roadTax: roadTax,
            make: apiVehicle.make,
            model: apiVehicle.model,
            year: apiVehicle.year_of_manufacture,
            image: imageUrl
        }
    }

    const vehicles: Vehicle[] = vehiclesResponse?.data?.map(transformVehicle) || []

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    // ========================= EVENT HANDLERS =========================
    const onSubmit = async (data: AddVehicleForm) => {
        try {
            // Check if vehicle already exists
            const existingVehicle = vehicles.find(v =>
                v.registrationNumber.toLowerCase() === data.registration_number.toLowerCase()
            )

            if (existingVehicle) {
                toast.error('Vehicle already exists in your list!')
                return
            }

            // Add vehicle via API
            const response = await addVehicle({ registration_number: data.registration_number }).unwrap()
            
            // Check if response has success message
            if (response?.success) {
                toast.success(response?.message || 'Vehicle added successfully!')
                handleCloseModal()
                refetch() // Refresh the list
            } else {
                // If success is false, show error message
                const errorMessage = response?.message?.message || response?.message || 'Failed to add vehicle. Please try again.'
                toast.error(errorMessage)
            }
        } catch (error: any) {
            // Handle API error response
            let errorMessage = 'Something went wrong. Please try again.'
            
            if (error?.data) {
                // Check for nested message structure
                if (error.data?.message?.message) {
                    errorMessage = error.data.message.message
                } else if (error.data?.message) {
                    errorMessage = typeof error.data.message === 'string' 
                        ? error.data.message 
                        : error.data.message.message || 'Failed to add vehicle'
                } else if (error.data?.error) {
                    errorMessage = error.data.error
                }
            } else if (error?.message) {
                errorMessage = error.message
            }
            
            toast.error(errorMessage)
            console.error('Error adding vehicle:', error)
        }
    }

    const handleCloseModal = () => {
        dispatch(closeAddModal())
        reset()
    }

    const handleVehicleClick = (vehicle: Vehicle) => {
        dispatch(openDetailsModal(vehicle))
    }

    const handleCloseDetailsModal = () => {
        dispatch(closeDetailsModal())
    }

    const handleDeleteClick = (vehicleId: string, event: React.MouseEvent) => {
        event.stopPropagation()
        dispatch(openDeleteConfirm(vehicleId))
    }

    const handleDeleteConfirm = async () => {
        if (!vehicleToDelete) return

        try {
            await deleteVehicle(vehicleToDelete).unwrap()
            toast.success('Vehicle removed successfully!')
            dispatch(closeDeleteConfirm())
            refetch() // Refresh the list
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete vehicle. Please try again.')
            console.error('Error deleting vehicle:', error)
        }
    }

    const handleDeleteCancel = () => {
        dispatch(closeDeleteConfirm())
    }

    const handleMotReports = () => {
        if (selectedVehicle) {
            // Close the modal before navigating
            dispatch(closeDetailsModal())
            router.push(`/driver/mot-reports/${selectedVehicle.registrationNumber}`)
        }
    }

    return (
        <div className="w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Vehicles</h1>
                <p className="text-gray-600">Manage your registered vehicles</p>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 bg-[#F8FAFB] p-4 rounded-[16px]">
                {isLoadingVehicles ? (
                    // Shimmer loading skeleton
                    <>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={`skeleton-${index}`}
                                className="bg-[#F8FAFB] rounded-lg p-6 border border-[#B8EFBF]"
                            >
                                {/* Skeleton Image */}
                                <div className="flex justify-center mb-4">
                                    <Skeleton className="w-[100px] h-[100px] rounded-lg" />
                                </div>
                                {/* Skeleton Registration Number */}
                                <div className="text-center mb-4">
                                    <Skeleton className="h-6 w-24 mx-auto rounded" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : vehicles.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-600">No vehicles found. Add your first vehicle!</p>
                    </div>
                ) : (
                    <>
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="bg-[#F8FAFB] relative rounded-lg p-6 border border-[#B8EFBF] cursor-pointer hover:shadow-md transition-all duration-200 group"
                                onClick={() => handleVehicleClick(vehicle)}
                            >
                                {/* Delete Button - Shows on hover */}
                                <button
                                    onClick={(e) => handleDeleteClick(vehicle.id, e)}
                                    disabled={isDeleting}
                                    className="absolute cursor-pointer top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Remove Vehicle"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* Vehicle Image or Brand Name */}
                                <div className="flex justify-center mb-4">
                                    <div className="rounded-lg flex items-center justify-center min-h-[100px]">
                                        {imageErrors[vehicle.id] || !isValidImageUrl(vehicle.image) ? (
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
                                                src={vehicle.image}
                                                alt={`${vehicle.make} ${vehicle.model}`}
                                                width={100}
                                                height={100}
                                                className="object-contain w-full h-full"
                                                onError={() => handleImageError(vehicle.id)}
                                            />
                                        )}
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

                        {/* Add Vehicle Card - Only show when not loading */}
                        <div
                            className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[${BRAND_COLOR}] hover:bg-green-50 transition-colors`}
                            onClick={() => dispatch(openAddModal())}
                        >
                            <div className={`w-12 h-12 bg-[${BRAND_COLOR}] rounded-full flex items-center justify-center mb-4`}>
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Add Vehicle</h3>
                            <p className="text-gray-500 text-center text-sm">Click to add a new vehicle to your collection</p>
                        </div>
                    </>
                )}
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
                                <Label htmlFor="registration_number" className="text-sm font-medium text-gray-700">
                                    Registration Number
                                </Label>
                                <Input
                                    id="registration_number"
                                    type="text"
                                    placeholder="XXXXXXX"
                                    className={`w-full py-3 text-base border-gray-300 focus:border-[${BRAND_COLOR}] focus:ring-[${BRAND_COLOR}] rounded-md`}
                                    {...register('registration_number', {
                                        required: 'Registration number is required',
                                        pattern: {
                                            value: REGISTRATION_PATTERN,
                                            message: 'Invalid registration number format'
                                        }
                                    })}
                                />
                                {errors.registration_number && (
                                    <p className="text-red-500 text-sm">{errors.registration_number.message}</p>
                                )}
                            </div>

                            {/* Add Vehicle Button */}
                            <Button
                                type="submit"
                                disabled={isAdding}
                                className={`w-full bg-[${BRAND_COLOR}] hover:bg-[${BRAND_COLOR_HOVER}] text-white font-medium py-3 text-base rounded-md transition-all duration-200 cursor-pointer disabled:bg-[${BRAND_COLOR}]/70 disabled:cursor-not-allowed`}
                            >
                                {isAdding ? 'Adding Vehicle...' : 'Add Vehicle'}
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

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Vehicle"
                description={`Are you sure you want to delete this vehicle? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    )
}
