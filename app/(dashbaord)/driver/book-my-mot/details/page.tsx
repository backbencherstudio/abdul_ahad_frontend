"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import BookingModal from '../../../_components/Driver/BookingModal'
import { useGetGarageServicesQuery, GarageServicesResponse } from '@/rtk/api/driver/bookMyMotApi'
import { GarageData } from '@/rtk/slices/driver/bookMyMotSlice'



// Helper function to get day name from number
const getDayName = (dayNum: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayNum] || ''
}

const formatTime = (time: string): string => {
    const cleanTime = time.replace(/[^0-9:]/g, '')
    const [hours, minutes] = cleanTime.split(':').map(Number)

    if (isNaN(hours) || isNaN(minutes)) return time

    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const displayMinutes = minutes.toString().padStart(2, '0')

    return `${displayHours}:${displayMinutes} ${period}`
}

function DetailsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const garageId = searchParams.get('id')
    const vehicleId = searchParams.get('vehicle_id')
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

    // Fetch garage services using RTK Query
    const { data: garageData, isLoading, error, refetch } = useGetGarageServicesQuery(
        garageId || '',
        {
            skip: !garageId, // Skip query if no garageId
            refetchOnMountOrArgChange: true, // Refetch when component mounts or argument changes
        }
    )

    // Refetch data when garageId changes to ensure fresh data
    useEffect(() => {
        if (garageId) {
            // Force refetch when garageId changes
            refetch()
        }
    }, [garageId, refetch])


    useEffect(() => {
        if (!garageId) {
            toast.error('No garage ID provided')
            router.push('/driver/book-my-mot')
            return
        }
    }, [garageId, router])

    useEffect(() => {
        if (error) {
            let errorMessage = 'Failed to load garage details'

            if ('data' in error && error.data) {
                const errorData = error.data as any
                if (errorData?.message?.message) {
                    errorMessage = errorData.message.message
                } else if (errorData?.message) {
                    errorMessage = typeof errorData.message === 'string'
                        ? errorData.message
                        : errorData.message.message || errorMessage
                }
            }

            toast.error(errorMessage)
            router.push('/driver/book-my-mot')
        }
    }, [error, router])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-lg text-gray-600">Loading garage details...</div>
            </div>
        )
    }

    if (!garageData || !garageData.garage) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-lg text-red-600">Garage not found</div>
            </div>
        )
    }

    const { garage, services, additionals, schedule } = garageData

    // Transform garage data to match BookingModal's expected structure
    const transformedGarage: GarageData = {
        id: garage.id,
        garage_name: garage.garage_name,
        address: garage.address || '',
        postcode: garage.zip_code,
        vts_number: garage.vts_number,
        primary_contact: garage.primary_contact,
        phone_number: garage.phone_number,
    }

    // Find MOT Test and Retest services
    const motTest = services.find(service => service.type === 'MOT')
    const motRetest = services.find(service => service.type === 'RETEST')

    return (
        <div className="w-full mx-auto">
            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Left Column - Garage Details */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className='space-y-4 bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]'>
                        {/* Garage Title */}
                        <div className="border-b border-gray-200 pb-3 sm:pb-4">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                                Garage: {garage.garage_name}
                            </h1>
                            <div className="mt-2 sm:mt-3 space-y-1 text-gray-600">
                                <div className="text-sm sm:text-base">
                                    <strong>Address :</strong> {garage.address || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-2 text-gray-600 text-sm sm:text-base">
                            <div><strong>Postcode :</strong> {garage.zip_code}</div>
                            <div><strong>Contact :</strong> {garage.primary_contact}</div>
                            <div><strong>Phone :</strong> {garage.phone_number}</div>
                            <div><strong>VTS Number :</strong> {garage.vts_number}</div>
                        </div>
                    </div>

                    {/* MOT Fee and Retest Fee */}
                    {(motTest || motRetest) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 py-4 gap-3 sm:gap-4 bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                            {motTest && (
                                <div className="px-3 sm:px-4 rounded-lg text-center sm:text-left">
                                    <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">MOT Fee</div>
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#19CA32]">£{motTest.price.toFixed(2)}</div>
                                </div>
                            )}
                            {motRetest && (
                                <div className="px-3 sm:px-4 rounded-lg text-center sm:text-left">
                                    <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">Retest Fee</div>
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#19CA32]">£{motRetest.price.toFixed(2)}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Additional Services */}
                    {additionals && additionals.length > 0 && (
                        <div className='bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]'>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 border-b border-[#D2D2D5] pb-2">Additional services</h3>
                            <div className="space-y-0">
                                {additionals.map((additional, index) => (
                                    <div key={additional.id} className="relative">
                                        {index > 0 && <div className="absolute top-0 left-0 right-0 border-t border-gray-200"></div>}
                                        <div className="flex items-center text-gray-700 text-sm sm:text-base py-2 sm:py-3">
                                            <div className="w-5 h-5 mr-3 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M22.7 19.5l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l1.8-1.8c.5-.4.5-1.1.1-1.4z" />
                                                </svg>
                                            </div>
                                            <span>{additional.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Opening Hours */}
                    {schedule && schedule.daily_hours && (
                        <div className="bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Opening Hours</h3>
                            <div className="text-xs sm:text-sm text-gray-500 mb-3">Opening hours may vary due to public holidays.</div>

                            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[400px]">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Day</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Opening</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Closing</th>
                                                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">Slot Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[0, 1, 2, 3, 4, 5, 6].map((dayNum) => {
                                                const dayName = getDayName(dayNum)
                                                const dayHours = schedule.daily_hours[dayNum.toString()]

                                                if (dayHours?.is_closed) {
                                                    return (
                                                        <tr key={dayNum} className="border-t border-gray-200">
                                                            <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap">{dayName}</td>
                                                            <td colSpan={3} className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base">Closed</td>
                                                        </tr>
                                                    )
                                                }

                                                if (dayHours?.intervals && dayHours.intervals.length > 0) {
                                                    return dayHours.intervals.map((interval, idx) => (
                                                        <tr key={`${dayNum}-${idx}`} className="border-t border-gray-200">
                                                            {idx === 0 && (
                                                                <td rowSpan={dayHours.intervals.length} className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap align-top">
                                                                    {dayName}
                                                                </td>
                                                            )}
                                                            <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base whitespace-nowrap">
                                                                {formatTime(interval.start_time)}
                                                            </td>
                                                            <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base whitespace-nowrap">
                                                                {formatTime(interval.end_time)}
                                                            </td>
                                                            {idx === 0 && (
                                                                <td rowSpan={dayHours.intervals.length} className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base whitespace-nowrap align-top">
                                                                    {dayHours.slot_duration || schedule.slot_duration} min
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                }

                                                return (
                                                    <tr key={dayNum} className="border-t border-gray-200">
                                                        <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap">{dayName}</td>
                                                        <td colSpan={3} className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base">Not Available</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Restrictions */}
                            {schedule.restrictions && schedule.restrictions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Restrictions</h4>
                                    <div className="space-y-2">
                                        {schedule.restrictions.map((restriction, index) => (
                                            <div key={index} className="text-xs sm:text-sm text-gray-600 bg-white p-2 rounded">
                                                <div className="font-medium">{restriction.type}: {restriction.description}</div>
                                                <div className="text-gray-500">
                                                    {getDayName(restriction.day_of_week[0])} - {getDayName(restriction.day_of_week[restriction.day_of_week.length - 1])}:
                                                    {formatTime(restriction.start_time)} - {formatTime(restriction.end_time)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Map and Booking */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Map Section */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="relative">
                            <div className="h-64 sm:h-80 lg:h-96 relative">
                                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent((garage.address || '') + ', ' + garage.zip_code)}`, '_blank')}
                                        className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 text-xs shadow-md px-2 sm:px-3 py-1 sm:py-2"
                                    >
                                        <span className="hidden sm:inline">View larger map</span>
                                        <span className="sm:hidden">View map</span>
                                    </Button>
                                </div>

                                <iframe
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent((garage.address || '') + ', ' + garage.zip_code)}&output=embed&z=15`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    className="rounded-t-lg"
                                    title={`Map showing location of ${garage.garage_name}`}
                                ></iframe>
                            </div>

                            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                                <Button
                                    onClick={() => setIsBookingModalOpen(true)}
                                    className="w-full  bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold py-4 sm:py-6 text-sm xl:text-base rounded-lg cursor-pointer transition-all duration-200"
                                >
                                    Book My MOT
                                </Button>

                                {/* Payment Info */}
                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                                    <p className="text-gray-700 font-medium text-sm sm:text-base lg:text-lg leading-relaxed">
                                        No upfront payment required – simply pay at your appointment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                garage={transformedGarage}
            />
        </div>
    )
}

export default function Details() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-96">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        }>
            <DetailsContent />
        </Suspense>
    )
}