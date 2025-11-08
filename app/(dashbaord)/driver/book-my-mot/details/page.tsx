"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import BookingModal from '../../../_components/Driver/BookingModal'



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
    const [garage, setGarage] = useState<Garage | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

    useEffect(() => {
        const fetchGarageDetails = async () => {
            if (!garageId) {
                toast.error('No garage ID provided')
                router.push('/driver/book-my-mot')
                return
            }

            try {
                setIsLoading(true)
                const response = await fetch('/data/garage.json')
                const garages: Garage[] = await response.json()

                const foundGarage = garages.find(g => g.id === parseInt(garageId))

                if (foundGarage) {
                    setGarage(foundGarage)
                } else {
                    toast.error('Garage not found')
                    router.push('/driver/book-my-mot')
                }
            } catch (error) {
                console.error('Error fetching garage details:', error)
                toast.error('Failed to load garage details')
                router.push('/driver/book-my-mot')
            } finally {
                setIsLoading(false)
            }
        }

        fetchGarageDetails()
    }, [garageId, router])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-lg text-gray-600">Loading garage details...</div>
            </div>
        )
    }

    if (!garage) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-lg text-red-600">Garage not found</div>
            </div>
        )
    }

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
                                Garage: {garage.name}
                            </h1>
                            <div className="mt-2 sm:mt-3 space-y-1 text-gray-600">
                                <div className="text-sm sm:text-base"><strong>Address :</strong> {garage.address}</div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-2 text-gray-600 text-sm sm:text-base">
                            <div><strong>Postcode :</strong> {garage.postcode}</div>
                            <div><strong>Contact :</strong> {garage.phone}</div>
                            <div><strong>Email :</strong> {garage.email}</div>
                            <div><strong>VTS Number :</strong> {garage.vstNumber}</div>
                        </div>
                    </div>

                    {/* MOT Fee and Retest Fee */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 py-4 gap-3 sm:gap-4 bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                        <div className="px-3 sm:px-4 rounded-lg text-center sm:text-left">
                            <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">MOT Fee</div>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#19CA32]">£ {garage.motFee}</div>
                        </div>
                        <div className="px-3 sm:px-4 rounded-lg text-center sm:text-left">
                            <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">Retest Fee</div>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#19CA32]">£ {garage.restestFee}</div>
                        </div>
                    </div>

                    {/* Additional Services */}
                    <div className='bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]'>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 border-b border-[#D2D2D5] pb-2">Additional services</h3>
                        <div className="space-y-2 sm:space-y-3">
                            {garage.services.map((service, index) => (
                                <div key={index} className="flex items-center text-gray-700 text-sm sm:text-base">
                                    <div className="w-4 h-4 mr-3 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    {service}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Opening Hours */}
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                            const hours = garage.openingHours.find(h => h.day === day)
                                            return (
                                                <tr key={day} className="border-t border-gray-200">
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap">{day}</td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base whitespace-nowrap">
                                                        {hours ? formatTime(hours.open) : 'Closed'}
                                                    </td>
                                                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base whitespace-nowrap">
                                                        {hours ? formatTime(hours.close) : 'Closed'}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
                                        onClick={() => window.open(garage.location, '_blank')}
                                        className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 text-xs shadow-md px-2 sm:px-3 py-1 sm:py-2"
                                    >
                                        <span className="hidden sm:inline">View larger map</span>
                                        <span className="sm:hidden">View map</span>
                                    </Button>
                                </div>

                                <iframe
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(garage.address + ', ' + garage.postcode)}&output=embed&z=15`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    className="rounded-t-lg"
                                    title={`Map showing location of ${garage.name}`}
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
                garage={garage}
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