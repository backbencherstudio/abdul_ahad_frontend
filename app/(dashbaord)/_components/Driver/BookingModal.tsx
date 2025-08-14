"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { X, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns'

// Custom Date Picker Component
interface CustomDatePickerProps {
    selected?: Date
    onSelect: (date: Date) => void
    onClose: () => void
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ selected, onSelect, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [tempSelected, setTempSelected] = useState<Date | undefined>(selected)

    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const years = Array.from({ length: 10 }, (_, i) => currentYear + i)

    const daysInMonth = getDaysInMonth(currentDate)
    const startDate = startOfMonth(currentDate)
    const startDayOfWeek = getDay(startDate)

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day)
        setTempSelected(newDate)
    }

    const handleApply = () => {
        if (tempSelected) {
            onSelect(tempSelected)
        }
        onClose()
    }

    const handleCancel = () => {
        setTempSelected(selected)
        onClose()
    }

    const handleMonthChange = (month: number) => {
        setCurrentDate(new Date(currentYear, month, 1))
    }

    const handleYearChange = (year: number) => {
        setCurrentDate(new Date(year, currentMonth, 1))
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg w-80">
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex items-center space-x-2">
                    {/* Month Dropdown */}
                    <select
                        value={currentMonth}
                        onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                        className="px-2 py-1 border rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#19CA32]"
                    >
                        {months.map((month, index) => (
                            <option key={index} value={index}>
                                {month}
                            </option>
                        ))}
                    </select>

                    {/* Year Dropdown */}
                    <select
                        value={currentYear}
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        className="px-2 py-1 border rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#19CA32]"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Empty cells for days before month start */}
                {Array.from({ length: startDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const isSelected = tempSelected?.getDate() === day &&
                        tempSelected?.getMonth() === currentMonth &&
                        tempSelected?.getFullYear() === currentYear
                    const isToday = new Date().getDate() === day &&
                        new Date().getMonth() === currentMonth &&
                        new Date().getFullYear() === currentYear
                    const isPast = new Date(currentYear, currentMonth, day) < new Date(new Date().setHours(0, 0, 0, 0))

                    return (
                        <button
                            key={day}
                            onClick={() => !isPast && handleDateClick(day)}
                            disabled={isPast}
                            className={cn(
                                "h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors",
                                isSelected && "bg-red-500 text-white",
                                !isSelected && !isPast && "hover:bg-gray-100",
                                isToday && !isSelected && "bg-gray-200",
                                isPast && "text-gray-300 cursor-not-allowed"
                            )}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between space-x-2">
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleApply}
                    className="flex-1 bg-[#19CA32] hover:bg-[#16b82e] text-white"
                >
                    Apply
                </Button>
            </div>
        </div>
    )
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

interface BookingFormData {
    name: string
    email: string
    phone: string
    date: string
    time: 'AM' | 'PM'
    additionalServices: string
}

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    garage: Garage | null
}

export default function BookingModal({ isOpen, onClose, garage }: BookingModalProps) {
    const router = useRouter()
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const [bookingForm, setBookingForm] = useState<BookingFormData>({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: 'AM',
        additionalServices: ''
    })
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [submittedBooking, setSubmittedBooking] = useState<BookingFormData | null>(null)

    const handleInputChange = (field: keyof BookingFormData, value: string) => {
        setBookingForm(prev => ({ ...prev, [field]: value }))
    }

    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.date) {
            alert('Please fill in all required fields')
            return
        }

        setSubmittedBooking(bookingForm)
        onClose()
        setIsSuccessModalOpen(true)

        // Reset form
        setBookingForm({
            name: '',
            email: '',
            phone: '',
            date: '',
            time: 'AM',
            additionalServices: ''
        })
        setSelectedDate(undefined)
    }

    const handleSuccessClose = () => {
        setIsSuccessModalOpen(false)
        setSubmittedBooking(null)
    }

    const handleGoHome = () => {
        setIsSuccessModalOpen(false)
        setSubmittedBooking(null)
        router.push('/driver/book-my-mot')
    }

    return (
        <>
            {/* Booking Modal */}
            <CustomReusableModal
                isOpen={isOpen}
                onClose={onClose}
                title="Garage Booking"
                showHeader={false}
                className="max-w-sm h-auto "
            >
                <div className="bg-white rounded-lg ">
                    {/* Header */}
                    <div className="bg-[#19CA32] text-white p-4">
                        <h2 className="text-lg font-semibold">Garage Booking</h2>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleBookingSubmit} className="p-6 overflow-hidden shadow-lg overflow-y-auto max-h-[90vh] lg:max-h-[85vh] md:max-h-[80vh] sm:max-h-[75vh] max-h-[70vh]">
                        <div className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={bookingForm.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full"
                                    placeholder=""
                                    required
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={bookingForm.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full"
                                    placeholder=""
                                    required
                                />
                            </div>

                            {/* Phone Number Field */}
                            <div>
                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={bookingForm.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full"
                                    placeholder=""
                                    required
                                />
                            </div>

                            {/* Date and Time Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Select Date */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Select Date
                                    </Label>
                                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? (
                                                    format(selectedDate, "dd/MM/yyyy")
                                                ) : (
                                                    <span>DD/MM/YYYY</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CustomDatePicker
                                                selected={selectedDate}
                                                onSelect={(date) => {
                                                    setSelectedDate(date)
                                                    if (date) {
                                                        handleInputChange('date', format(date, 'yyyy-MM-dd'))
                                                    }
                                                }}
                                                onClose={() => {
                                                    setIsDatePickerOpen(false)
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Select Time */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Select Time
                                    </Label>
                                    <div className="flex space-x-2">
                                        <Button
                                            type="button"
                                            onClick={() => handleInputChange('time', 'AM')}
                                            className={cn(
                                                "flex-1 py-2 px-3 text-sm font-medium rounded transition-all",
                                                bookingForm.time === 'AM'
                                                    ? "bg-[#19CA32] text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )}
                                        >
                                            AM
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => handleInputChange('time', 'PM')}
                                            className={cn(
                                                "flex-1 py-2 px-3 text-sm font-medium rounded transition-all",
                                                bookingForm.time === 'PM'
                                                    ? "bg-[#19CA32] text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )}
                                        >
                                            PM
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Services Field */}
                            <div>
                                <Label htmlFor="additionalServices" className="text-sm font-medium text-gray-700 mb-2 block">
                                    Additional Services (If Required)
                                </Label>
                                <Textarea
                                    id="additionalServices"
                                    value={bookingForm.additionalServices}
                                    onChange={(e) => handleInputChange('additionalServices', e.target.value)}
                                    className="w-full resize-none"
                                    rows={4}
                                    placeholder=""
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold py-3 text-sm xl:text-base rounded-lg transition-all duration-200"
                            >
                                Book My MOT
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomReusableModal>

            {/* Success Modal */}
            <CustomReusableModal
                isOpen={isSuccessModalOpen}
                onClose={handleSuccessClose}
                title="Booking Success"
                showHeader={false}
                className="max-w-sm mx-4"
            >
                <div className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg">
                    {/* Header with close button */}
                    <div className="relative p-6">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-[#19CA32] border-3 border-gray-300 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Title and Message */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold mb-2">MOT Booking is Complete!</h2>
                            <p className="text-gray-300">Thank you for booking with us.</p>
                        </div>

                        {/* Booking Details */}
                        {submittedBooking && (
                            <div className="space-y-3 mb-6 text-sm">
                                <div>
                                    <span className="text-gray-400">Date & Time: </span>
                                    <span className="text-white">
                                        {selectedDate ? format(selectedDate, "dd MMMM yyyy") : submittedBooking.date}, {submittedBooking.time}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Garage: </span>
                                    <span className="text-white">{garage?.name}</span>
                                </div>
                                {submittedBooking.additionalServices && (
                                    <div>
                                        <span className="text-gray-400">Additional services: </span>
                                        <span className="text-white">{submittedBooking.additionalServices}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Go To Home Button */}
                        <Button
                            onClick={handleGoHome}
                            className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold py-3 text-base rounded-lg transition-all duration-200"
                        >
                            Go To Home
                        </Button>
                    </div>
                </div>
            </CustomReusableModal>
        </>
    )
} 