"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Clock } from 'lucide-react'
import BreaksModal from './BreaksModal'

interface DaySchedule {
    day: string
    isClosed: boolean
    fromTime: string
    toTime: string
    duration: number
    breaks: Array<{
        id: string
        fromTime: string
        toTime: string
    }>
}

const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
]

// Helper function to format time for display (HH:mm -> HH : mm)
const formatTimeDisplay = (time: string): string => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    return `${hours} : ${minutes}`
}

// Helper function to parse time from display format
const parseTimeDisplay = (display: string): string => {
    return display.replace(/\s/g, '')
}

export default function DefultCalanderView() {
    const [openBreaksModalIndex, setOpenBreaksModalIndex] = useState<number | null>(null)

    const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
        // Initialize with default values matching the image
        return DAYS.map((day, index) => {
            if (index === 6) {
                // Sunday - closed
                return {
                    day,
                    isClosed: true,
                    fromTime: '08:00',
                    toTime: '17:00',
                    duration: 60,
                    breaks: []
                }
            } else if (index === 5) {
                // Saturday
                return {
                    day,
                    isClosed: false,
                    fromTime: '09:00',
                    toTime: '16:30',
                    duration: 60,
                    breaks: []
                }
            } else {
                // Monday to Friday
                return {
                    day,
                    isClosed: false,
                    fromTime: '08:30',
                    toTime: '17:30',
                    duration: 60,
                    breaks: []
                }
            }
        })
    })

    const handleClosedToggle = (index: number, checked: boolean) => {
        setSchedules(prev =>
            prev.map((schedule, i) =>
                i === index ? { ...schedule, isClosed: checked } : schedule
            )
        )
    }

    const handleTimeChange = (index: number, field: 'fromTime' | 'toTime', value: string) => {
        setSchedules(prev =>
            prev.map((schedule, i) =>
                i === index ? { ...schedule, [field]: value } : schedule
            )
        )
    }

    const handleDurationChange = (index: number, value: number) => {
        setSchedules(prev =>
            prev.map((schedule, i) =>
                i === index ? { ...schedule, duration: value } : schedule
            )
        )
    }

    const handleBreaksChange = (index: number, breaks: DaySchedule['breaks']) => {
        setSchedules(prev =>
            prev.map((schedule, i) =>
                i === index ? { ...schedule, breaks } : schedule
            )
        )
    }

    const handleOpenBreaksModal = (index: number) => {
        setOpenBreaksModalIndex(index)
    }

    const handleCloseBreaksModal = () => {
        setOpenBreaksModalIndex(null)
    }

    return (
        <div className="w-full">


            <Card className="w-full">
                <CardContent className="p-4 sm:p-5">
                    <div className="space-y-2">
                        {schedules.map((schedule, index) => (
                            <div
                                key={schedule.day}
                                className={`pb-3 ${index !== schedules.length - 1 ? 'border-b border-gray-200' : ''}`}
                            >
                                {/* Day Name and Closed Switch */}
                                <div className="mb-3 flex justify-between items-center">
                                    {/* Day Name */}
                                    <h3 className="text-base font-medium text-gray-900">
                                        {schedule.day}
                                    </h3>

                                    {/* Closed Switch */}
                                    <div className="flex items-center gap-3">
                                        <Label
                                            htmlFor={`closed-${index}`}
                                            className="text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap"
                                        >
                                            Closed
                                        </Label>
                                        <Switch
                                            id={`closed-${index}`}
                                            checked={schedule.isClosed}
                                            onCheckedChange={(checked) => handleClosedToggle(index, checked)}
                                        />
                                    </div>
                                </div>

                                {/* Main Row - From/To Times, Duration, Add Break Button */}
                                <div className="flex flex-col 2xl:flex-row 2xl:items-start gap-3">
                                    {/* From Time */}
                                    <div className="flex-1 min-w-0">
                                        <Label
                                            htmlFor={`from-${index}`}
                                            className="text-xs text-gray-600 mb-1 block"
                                        >
                                            From
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id={`from-${index}`}
                                                type="time"
                                                value={schedule.fromTime}
                                                onChange={(e) => handleTimeChange(index, 'fromTime', e.target.value)}
                                                onClick={(e) => {
                                                    if (!schedule.isClosed) {
                                                        e.currentTarget.showPicker?.()
                                                    }
                                                }}
                                                disabled={schedule.isClosed}
                                                className={`w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none ${schedule.isClosed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                                                    }`}
                                            />
                                            <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* To Time */}
                                    <div className="flex-1 min-w-0">
                                        <Label
                                            htmlFor={`to-${index}`}
                                            className="text-xs text-gray-600 mb-1 block"
                                        >
                                            To
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id={`to-${index}`}
                                                type="time"
                                                value={schedule.toTime}
                                                onChange={(e) => handleTimeChange(index, 'toTime', e.target.value)}
                                                onClick={(e) => {
                                                    if (!schedule.isClosed) {
                                                        e.currentTarget.showPicker?.()
                                                    }
                                                }}
                                                disabled={schedule.isClosed}
                                                className={`w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none ${schedule.isClosed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                                                    }`}
                                            />
                                            <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className='flex sm:flex-row flex-col justify-between gap-3'>
                                        {/* Duration Input */}
                                        <div className="flex-shrink-0 w-full sm:w-6/12">
                                            <Label
                                                htmlFor={`duration-${index}`}
                                                className="text-xs text-gray-600 mb-1 block"
                                            >
                                                Duration (min)
                                            </Label>
                                            <Input
                                                id={`duration-${index}`}
                                                type="number"
                                                min="15"
                                                max="480"
                                                step="15"
                                                value={schedule.duration}
                                                onChange={(e) => handleDurationChange(index, parseInt(e.target.value) || 60)}
                                                disabled={schedule.isClosed}
                                                className={`w-full ${schedule.isClosed ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                                                    }`}
                                            />
                                        </div>

                                        {/* Manage Breaks Button */}
                                        <div className="flex-shrink-0 w-full sm:w-6/12 pr-3">
                                            <Label className="text-xs text-gray-600 mb-1 block opacity-0 pointer-events-none h-4">
                                                Action
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenBreaksModal(index)}
                                                disabled={schedule.isClosed}
                                                className={`w-full cursor-pointer whitespace-nowrap h-9 ${schedule.isClosed
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'border-gray-300 hover:bg-gray-50 text-xs'
                                                    }`}
                                            >
                                                <Clock className="w-4 h-4 " />
                                                {schedule.breaks.length > 0
                                                    ? `Breaks (${schedule.breaks.length})`
                                                    : 'Add Break'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Breaks Modal */}
            {openBreaksModalIndex !== null && (
                <BreaksModal
                    isOpen={openBreaksModalIndex !== null}
                    onClose={handleCloseBreaksModal}
                    dayName={schedules[openBreaksModalIndex]?.day || ''}
                    breaks={schedules[openBreaksModalIndex]?.breaks || []}
                    onBreaksChange={(breaks) => handleBreaksChange(openBreaksModalIndex, breaks)}
                />
            )}
        </div>
    )
}
