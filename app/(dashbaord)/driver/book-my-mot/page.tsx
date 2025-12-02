"use client"

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'

import imgMot from '@/public/Image/admin/cardMot.png'
import VehicleCard from '../../_components/Driver/VehicleCard'
import GarageCard from '../../_components/Driver/GarageCard'
import { useSearchVehiclesAndGaragesQuery } from '@/rtk/api/driver/bookMyMotApi'
import { 
    setSearchResults, 
    setLoading, 
    setError, 
    clearSearchResults,
    selectVehicle,
    selectGarages,
    selectIsLoading,
    selectError
} from '@/rtk/slices/driver/bookMyMotSlice'

interface FormData {
    registrationNumber: string
    postcode: string
}

export default function BookMyMOT() {
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
    
    // State to control when to trigger the search
    const [searchParams, setSearchParams] = useState<{ registration_number: string; postcode: string } | null>(null)
    
    // Get state from Redux
    const vehicle = useSelector(selectVehicle)
    const garages = useSelector(selectGarages)
    const isLoading = useSelector(selectIsLoading)
    const error = useSelector(selectError)
    
    // Query will execute when searchParams is set
    const { data, isLoading: queryLoading, error: queryError } = useSearchVehiclesAndGaragesQuery(
        searchParams!,
        {
            skip: !searchParams, // Skip until searchParams is set
        }
    )

    // Handle search results
    useEffect(() => {
        if (data) {
            dispatch(setSearchResults(data))
            dispatch(setLoading(false))
            
            // Show success toast
            if (data.vehicle && data.garages.length > 0) {
                toast.success(`Found vehicle and ${data.garages.length} garage(s)!`)
            } else if (data.vehicle && data.garages.length === 0) {
                toast.warning(`Found vehicle but no garages in your area`)
            } else {
                toast.error('No results found with the provided details')
            }
        }
    }, [data, dispatch])

    // Handle loading state
    useEffect(() => {
        dispatch(setLoading(queryLoading))
    }, [queryLoading, dispatch])

    // Handle errors
    useEffect(() => {
        if (queryError) {
            let errorMessage = 'Failed to search data. Please try again.'
            
            // RTK Query error structure
            if ('data' in queryError && queryError.data) {
                const errorData = queryError.data as any
                
                // Check for nested message structure: { success: false, message: { message: "...", error: "...", statusCode: 404 } }
                if (errorData?.message?.message) {
                    errorMessage = errorData.message.message
                } else if (errorData?.message) {
                    // Handle if message is a string
                    errorMessage = typeof errorData.message === 'string' 
                        ? errorData.message 
                        : errorData.message.message || errorMessage
                } else if (errorData?.error) {
                    errorMessage = errorData.error
                }
            } else if ('message' in queryError && queryError.message) {
                errorMessage = queryError.message as string
            }
            
            dispatch(setError(errorMessage))
            dispatch(setLoading(false))
            toast.error(errorMessage)
        }
    }, [queryError, dispatch])

    const onSubmit = async (data: FormData) => {
        // Clear previous results
        dispatch(clearSearchResults())
        dispatch(setLoading(true))
        dispatch(setError(null))
        
        // Set search params to trigger the query
        setSearchParams({
            registration_number: data.registrationNumber,
            postcode: data.postcode
        })
    }

    const showResults = vehicle !== null || garages.length > 0

    return (
        <div className="w-full mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-md shadow-sm p-4 sm:p-6  mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4  bg-[#F8FAFB] p-4 rounded-md items-center">
                    {/* Registration Number */}
                    <div>
                        <Label htmlFor="registrationNumber" className="text-sm mb-2 font-medium text-gray-700">
                            Registration Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="registrationNumber"
                            type="text"
                            placeholder=""
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
                    <div>
                        <Label htmlFor="postcode" className="text-sm mb-2 font-medium text-gray-700">
                            Postcode <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="postcode"
                            type="text"
                            placeholder=""
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
                    <div className="sm:col-span-2 lg:col-span-1 mt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5  bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium text-sm xl:text-base rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Searching...' : 'Find Garage'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Search Results Section */}
            {showResults && (
                <div className="w-full mx-auto mt-8">
                    {/* Vehicle Results */}
                    {vehicle ? (
                        <VehicleCard vehicle={vehicle} />
                    ) : (
                        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mb-4">
                            <div className="text-center py-6">
                                <div className="text-red-500 text-lg font-medium mb-2">Vehicle Not Found</div>
                                <p className="text-gray-600">No vehicle found with the registration number you provided. Please check and try again.</p>
                            </div>
                        </div>
                    )}

                    {/* Garages Results */}
                    {garages.length > 0 ? (
                        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mt-8">
                            {/* Payment Message */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-700 text-base xl:text-xl font-medium">
                                    No upfront payment required - simply pay at your appointment.
                                </p>
                            </div>

                            {/* Garage List */}
                            <GarageCard foundGarages={garages} />
                        </div>
                    ) : vehicle && garages.length === 0 ? (
                        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mt-8">
                            <div className="text-center py-6">
                                <div className="text-red-500 text-lg font-medium mb-2">Garage Not Found</div>
                                <p className="text-gray-600">No garage found with the postcode you provided. Please check and try again.</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Search Again Button */}
                    <div className="mt-6 text-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                dispatch(clearSearchResults())
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
