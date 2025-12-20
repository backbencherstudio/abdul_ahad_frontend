"use client"

import React, { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Slot } from '@/rtk/api/driver/bookMyMotApi'

interface BookingDetailsSectionProps {
    selectedDate: Date | undefined
    date: string
    onDateChange: (date: string) => void
    slots: Slot[] | undefined
    slotsLoading: boolean
    selectedSlotId: string | null
    onSlotSelect: (slot: Slot, e?: React.MouseEvent) => void
    isBooking: boolean
    formatTime: (time: string) => string
}

export default function BookingDetailsSection({
    selectedDate,
    date,
    onDateChange,
    slots,
    slotsLoading,
    selectedSlotId,
    onSlotSelect,
    isBooking,
    formatTime
}: BookingDetailsSectionProps) {
    const dateInputRef = useRef<HTMLInputElement | null>(null)

    const openNativePicker = () => {
        if (dateInputRef.current) {
            // showPicker is supported in modern Chromium; fallback to focus otherwise
            (dateInputRef.current as any).showPicker?.()
            dateInputRef.current.focus()
        }
    }

    return (
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#19CA32] rounded-full"></div>
                Booking Details
            </h3>
            <div className="space-y-4">
                {/* Select Date */}
                <div>
                    <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 block">
                        Select Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="date"
                            ref={dateInputRef}
                            type="date"
                            value={date}
                            onChange={(e) => {
                                const dateValue = e.target.value
                                onDateChange(dateValue)
                            }}
                            onClick={openNativePicker}
                            className="w-full h-11 border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Available Slots */}
                {date && (
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                            Available Time Slots <span className="text-red-500">*</span>
                        </Label>
                        {slotsLoading ? (
                            <div className="text-center py-10 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
                                <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#19CA32] border-t-transparent mx-auto mb-3"></div>
                                <p className="font-medium">Loading available slots...</p>
                            </div>
                        ) : slots && Array.isArray(slots) && slots.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 scrollbar-hide">
                                {slots.map((slot) => (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        onClick={(e) => onSlotSelect(slot, e)}
                                        disabled={isBooking}
                                        className={cn(
                                            "group relative px-4 py-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-2.5 min-h-[100px]",
                                            "hover:border-[#19CA32] hover:bg-[#19CA32]/10 hover:shadow-md hover:scale-105",
                                            "active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:ring-offset-2",
                                            selectedSlotId === slot.id
                                                ? "border-[#19CA32] bg-[#19CA32] text-white shadow-lg ring-2 ring-[#19CA32]/30 scale-105"
                                                : "border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-[#19CA32]/5",
                                            isBooking && "opacity-50 cursor-not-allowed hover:scale-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            selectedSlotId === slot.id
                                                ? "bg-white/25"
                                                : "bg-[#19CA32]/10 group-hover:bg-[#19CA32]/20"
                                        )}>
                                            <Clock className={cn(
                                                "h-5 w-5 transition-colors",
                                                selectedSlotId === slot.id ? "text-white" : "text-[#19CA32]"
                                            )} />
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span className={cn(
                                                    "font-semibold text-sm",
                                                    selectedSlotId === slot.id ? "text-white" : "text-gray-800"
                                                )}>
                                                    {formatTime(slot.start_time)}
                                                </span>
                                                <span className={cn(
                                                    "text-xs",
                                                    selectedSlotId === slot.id ? "text-white/70" : "text-gray-400"
                                                )}>-</span>
                                                <span className={cn(
                                                    "font-semibold text-sm",
                                                    selectedSlotId === slot.id ? "text-white" : "text-gray-800"
                                                )}>
                                                    {formatTime(slot.end_time)}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedSlotId === slot.id && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                    <svg className="w-3 h-3 text-[#19CA32]" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
                                <Clock className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                                <p className="font-medium text-base">{slots ? 'No slots available for this date' : 'Select a date to view available slots'}</p>
                                {slots && (
                                    <p className="text-sm text-gray-400 mt-1">Please try selecting another date</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
