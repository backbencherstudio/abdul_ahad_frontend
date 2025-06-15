'use client'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface TimeSlot {
    start: string
    end: string
}

interface DayAvailability {
    type: 'working' | 'weekend' | 'holiday'
    timeSlots?: TimeSlot[]
}

interface WeekDay {
    day: string
    date: string
    availability: DayAvailability
    isCurrentMonth?: boolean
}

export default function Availability() {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [showTimeModal, setShowTimeModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [selectedDayType, setSelectedDayType] = useState<'working' | 'weekend' | 'holiday'>('working')
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ start: '10:00', end: '18:00' }])
    const [currentWeekData, setCurrentWeekData] = useState<WeekDay[]>([])
    const [availabilityData, setAvailabilityData] = useState<{ [key: string]: DayAvailability }>({})
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const getWeeksInMonth = (month: number, year: number) => {
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        // Get the first Sunday of the month (or before if month doesn't start on Sunday)
        const firstSunday = new Date(firstDay)
        firstSunday.setDate(firstDay.getDate() - firstDay.getDay())

        // Calculate weeks
        const weeks = []
        let currentWeekStart = new Date(firstSunday)

        while (currentWeekStart <= lastDay) {
            const weekData: WeekDay[] = []
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(currentWeekStart)
                currentDate.setDate(currentWeekStart.getDate() + i)

                const dateString = currentDate.toISOString().split('T')[0]
                const dayAvailability = availabilityData[dateString] || { type: 'working', timeSlots: [{ start: '10:00', end: '18:00' }] }

                weekData.push({
                    day: days[currentDate.getDay()],
                    date: dateString,
                    availability: dayAvailability,
                    isCurrentMonth: currentDate.getMonth() === month
                })
            }

            weeks.push(weekData)
            currentWeekStart.setDate(currentWeekStart.getDate() + 7)
        }

        return weeks
    }

    const generateWeekData = (weekIndex: number, month: number, year: number) => {
        const allWeeks = getWeeksInMonth(month, year)
        return allWeeks[weekIndex] || []
    }

    const getTotalWeeksInMonth = (month: number, year: number) => {
        return getWeeksInMonth(month, year).length
    }

    const findCurrentWeek = () => {
        const today = new Date()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        const todayString = today.toISOString().split('T')[0]

        // Get all weeks in current month
        const allWeeks = getWeeksInMonth(currentMonth, currentYear)

        // Find which week contains today's date
        const weekIndex = allWeeks.findIndex(week =>
            week.some(day => day.date === todayString)
        )

        return {
            month: currentMonth,
            year: currentYear,
            weekIndex: weekIndex !== -1 ? weekIndex : 0
        }
    }

    const navigateToPreviousWeek = () => {
        if (currentWeekIndex > 0) {
            setCurrentWeekIndex(prev => prev - 1)
        } else {
            // Go to previous month's last week
            let newMonth = selectedMonth - 1
            let newYear = selectedYear

            if (newMonth < 0) {
                newMonth = 11
                newYear = selectedYear - 1
            }

            setSelectedMonth(newMonth)
            setSelectedYear(newYear)
            setCurrentWeekIndex(getTotalWeeksInMonth(newMonth, newYear) - 1)
        }
    }

    const navigateToNextWeek = () => {
        const totalWeeks = getTotalWeeksInMonth(selectedMonth, selectedYear)

        if (currentWeekIndex < totalWeeks - 1) {
            setCurrentWeekIndex(prev => prev + 1)
        } else {
            // Go to next month's first week
            let newMonth = selectedMonth + 1
            let newYear = selectedYear

            if (newMonth > 11) {
                newMonth = 0
                newYear = selectedYear + 1
            }

            setSelectedMonth(newMonth)
            setSelectedYear(newYear)
            setCurrentWeekIndex(0)
        }
    }

    // Initialize to current week on component mount
    useEffect(() => {
        if (!isInitialized) {
            const currentWeek = findCurrentWeek()
            setSelectedMonth(currentWeek.month)
            setSelectedYear(currentWeek.year)
            setCurrentWeekIndex(currentWeek.weekIndex)
            setIsInitialized(true)
        }
    }, [isInitialized])

    useEffect(() => {
        if (isInitialized) {
            const weekData = generateWeekData(currentWeekIndex, selectedMonth, selectedYear)
            setCurrentWeekData(weekData)
        }
    }, [currentWeekIndex, selectedMonth, selectedYear, availabilityData, isInitialized])


    const handleDateClick = (date: string, type: 'working' | 'weekend' | 'holiday') => {
        setSelectedDate(date)
        setSelectedDayType(type)

        const existingData = availabilityData[date]
        if (existingData && existingData.timeSlots) {
            setTimeSlots(existingData.timeSlots)
        } else {
            setTimeSlots([{ start: '10:00', end: '18:00' }])
        }

        if (type === 'working') {
            setShowTimeModal(true)
        } else {
            setAvailabilityData(prev => ({
                ...prev,
                [date]: { type, timeSlots: [] }
            }))
            setSelectedCalendarDate(null)
        }
    }

    const handleSaveTime = () => {
        if (selectedDate) {
            setAvailabilityData(prev => ({
                ...prev,
                [selectedDate]: {
                    type: selectedDayType,
                    timeSlots: timeSlots
                }
            }))
        }
        setShowTimeModal(false)
        setSelectedDate(null)
        setSelectedCalendarDate(null)
    }

    // Simplified time handling - single time slot only

    const formatTimeToAmPm = (time24: string) => {
        const [hours, minutes] = time24.split(':').map(Number)
        const period = hours >= 12 ? 'PM' : 'AM'
        const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
        return `${hours12}:${minutes.toString().padStart(2, '0')}${period}`
    }

    const getDayStyle = (availability: DayAvailability) => {
        switch (availability.type) {
            case 'working':
                return 'bg-green-100 border-green-300 text-green-800'
            case 'weekend':
                return 'bg-red-100 border-red-300 text-red-800'
            case 'holiday':
                return 'bg-yellow-100 border-yellow-300 text-yellow-800'
            default:
                return 'bg-gray-100 border-gray-300 text-gray-800'
        }
    }

    const getCurrentWeekDateRange = () => {
        if (currentWeekData.length === 0) return { start: '', end: '' }

        const startDate = currentWeekData[0].date
        const endDate = currentWeekData[6].date

        return {
            start: new Date(startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            end: new Date(endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        }
    }


    return (
        <>
            <div className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Section - Week View */}
                    <div >
                        {/* Week Header */}
                        <div className="flex items-center gap-5 mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Week {String(currentWeekIndex + 1).padStart(2, '0')}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={navigateToPreviousWeek}
                                    className="p-1 rounded-md  cursor-pointer hover:bg-gray-200 transition-colors bg-white"
                                    title="Previous Week"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={navigateToNextWeek}
                                    className="p-1 rounded-md cursor-pointer bg-white hover:bg-gray-200 transition-colors"
                                    title="Next Week"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Days List */}
                        <div className="space-y-3 bg-white rounded-lg  p-5">
                            {currentWeekData.map((day, index) => (
                                <div key={index} className="bg-white">
                                    <div className="flex items-center gap-2 mb-3">
                                        {/* Day Icon */}
                                        <div className="flex-shrink-0">
                                            {day.availability.type === 'working' ? (
                                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            ) : day.availability.type === 'weekend' ? (
                                                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                    <X className="w-4 h-4 text-white" />
                                                </div>
                                            ) : day.availability.type === 'holiday' ? (
                                                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-medium">H</span>
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Day Name */}
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-800">{day.day}</h3>
                                        </div>
                                    </div>

                                    {/* Time Display */}
                                    <div>
                                        {day.availability.type === 'working' && day.availability.timeSlots && day.availability.timeSlots.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-4 w-full">
                                                {day.availability.timeSlots.map((slot, i) => (
                                                    <React.Fragment key={i}>
                                                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                                                            <div className="text-sm font-medium text-gray-800">
                                                                {formatTimeToAmPm(slot.start)}
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                                                            <div className="text-sm font-medium text-gray-800">
                                                                {formatTimeToAmPm(slot.end)}
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        ) : day.availability.type === 'weekend' ? (
                                            <div className="grid grid-cols-2 gap-4 w-full">
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                                                    <div className="text-sm font-medium text-gray-400">
                                                        ---
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                                                    <div className="text-sm font-medium text-gray-400">
                                                        ---
                                                    </div>
                                                </div>
                                            </div>
                                        ) : day.availability.type === 'holiday' ? (
                                            <div className="grid grid-cols-2 gap-4 w-full">
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
                                                    <div className="text-sm font-medium text-yellow-600">
                                                        Holiday
                                                    </div>
                                                </div>
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
                                                    <div className="text-sm font-medium text-yellow-600">
                                                        Holiday
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4 w-full">
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                                                    <div className="text-base font-semibold text-gray-800">
                                                        {formatTimeToAmPm('10:00')}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                                                    <div className="text-base font-semibold text-gray-800">
                                                        {formatTimeToAmPm('18:00')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={() => {
                                setAvailabilityData(prev => {
                                    const newData = { ...prev }
                                    currentWeekData.forEach(day => {
                                        if (!newData[day.date]) {
                                            newData[day.date] = day.availability
                                        }
                                    })
                                    return newData
                                })
                            }}
                            className="w-full mt-6 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm cursor-pointer"
                        >
                            Save
                        </button>
                    </div>

                    {/* Right Section - Calendar */}
                    <div className="h-fit">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Calendar & Availability</h2>

                            {/* Week Date Range Display */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    Selected Week: <span className="font-semibold text-gray-800">
                                        {getCurrentWeekDateRange().start} - {getCurrentWeekDateRange().end}
                                    </span>
                                </p>
                            </div>

                            <div className='bg-white rounded-lg p-5 '>
                                {/* Month/Year Controls */}
                                <div className="flex items-center justify-center gap-4 mb-6 ">
                                    <button
                                        onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => {
                                                setSelectedMonth(parseInt(e.target.value))
                                                setCurrentWeekIndex(0)
                                            }}
                                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg  font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {months.map((month, index) => (
                                                <option key={index} value={index}>{month}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedYear}
                                            onChange={(e) => {
                                                setSelectedYear(parseInt(e.target.value))
                                                setCurrentWeekIndex(0)
                                            }}
                                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 5).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Custom Calendar Grid */}
                                <div className="mb-6">
                                    {/* Calendar Header */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-1 relative">
                                        {(() => {
                                            const firstDay = new Date(selectedYear, selectedMonth, 1)
                                            const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
                                            const startDate = new Date(firstDay)
                                            startDate.setDate(startDate.getDate() - firstDay.getDay())

                                            const days = []
                                            let weekHighlightInfo = null

                                            for (let i = 0; i < 42; i++) {
                                                const currentDate = new Date(startDate)
                                                currentDate.setDate(startDate.getDate() + i)

                                                const dateStr = currentDate.toISOString().split('T')[0]
                                                const isCurrentMonth = currentDate.getMonth() === selectedMonth
                                                const isInCurrentWeek = currentWeekData.some(day => day.date === dateStr)
                                                const availability = availabilityData[dateStr]
                                                const isSelected = selectedCalendarDate === dateStr
                                                const isToday = dateStr === new Date().toISOString().split('T')[0]

                                                // Calculate week highlight position
                                                if (isInCurrentWeek && isCurrentMonth && !weekHighlightInfo) {
                                                    const row = Math.floor(i / 7)
                                                    weekHighlightInfo = {
                                                        top: `${row * 2.75}rem`,
                                                        startCol: i % 7,
                                                        length: currentWeekData.filter(day => {
                                                            const dayDate = new Date(day.date)
                                                            return dayDate.getMonth() === selectedMonth
                                                        }).length
                                                    }
                                                }

                                                days.push(
                                                    <div
                                                        key={i}
                                                        onClick={() => {
                                                            if (isCurrentMonth) {
                                                                // Set selected date for availability setting
                                                                setSelectedCalendarDate(dateStr)

                                                                // Also find which week this date belongs to and switch to that week
                                                                const allWeeks = getWeeksInMonth(selectedMonth, selectedYear)
                                                                const weekIndex = allWeeks.findIndex(week =>
                                                                    week.some(day => day.date === dateStr)
                                                                )
                                                                if (weekIndex !== -1) {
                                                                    setCurrentWeekIndex(weekIndex)
                                                                }
                                                            }
                                                        }}
                                                        className={`
                           h-10 w-10 flex items-center justify-center text-sm cursor-pointer transition-all relative z-10
                           ${isSelected ? 'rounded-full bg-red-500 text-white font-bold' : 'rounded-full'}
                           ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-red-400'}
                           ${!isSelected && isToday ? 'ring ring-green-500 bg-green-200 text-green-900 font-bold' : ''}
                           ${!isSelected && isInCurrentWeek && isCurrentMonth && !isToday ? 'text-green-800 font-semibold' : ''}
                           ${!isSelected && availability?.type === 'working' && !isToday && !isInCurrentWeek ? 'bg-green-200 text-green-800' : ''}
                           ${!isSelected && availability?.type === 'weekend' && !isToday && !isInCurrentWeek ? 'bg-red-200 text-red-800' : ''}
                           ${!isSelected && availability?.type === 'holiday' && !isToday && !isInCurrentWeek ? 'bg-yellow-200 text-yellow-800' : ''}
                         `}
                                                    >
                                                        {currentDate.getDate()}
                                                    </div>
                                                )
                                            }

                                            return (
                                                <>
                                                    {/* Week Highlight Bar */}
                                                    {weekHighlightInfo && (
                                                        <div
                                                            className="absolute bg-green-100 border border-green-200 rounded-lg z-0"
                                                            style={{
                                                                top: weekHighlightInfo.top,
                                                                left: `${weekHighlightInfo.startCol * 14.285714}%`,
                                                                width: `${weekHighlightInfo.length * 14.285714}%`,
                                                                height: '2.5rem',
                                                            }}
                                                        />
                                                    )}
                                                    {days}
                                                </>
                                            )
                                        })()}
                                    </div>
                                </div>



                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            if (selectedCalendarDate) {
                                                handleDateClick(selectedCalendarDate, 'working')
                                            }
                                        }}
                                        disabled={!selectedCalendarDate}
                                        className={`
                  w-full py-3 px-4 rounded-lg transition-colors text-sm font-medium
                  ${selectedCalendarDate
                                                ? 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                                                : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                            }
                `}
                                    >
                                        Working Day {!selectedCalendarDate && '(Select a date first)'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (selectedCalendarDate) {
                                                handleDateClick(selectedCalendarDate, 'weekend')
                                            }
                                        }}
                                        disabled={!selectedCalendarDate}
                                        className={`
                  w-full py-3 px-4 rounded-lg transition-colors text-sm font-medium
                  ${selectedCalendarDate
                                                ? 'bg-red-50 border-2 border-red-200 text-red-700 hover:bg-red-100 cursor-pointer'
                                                : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                            }
                `}
                                    >
                                        Weekend {!selectedCalendarDate && '(Select a date first)'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (selectedCalendarDate) {
                                                handleDateClick(selectedCalendarDate, 'holiday')
                                            }
                                        }}
                                        disabled={!selectedCalendarDate}
                                        className={`
                  w-full py-3 px-4 rounded-lg transition-colors text-sm font-medium
                  ${selectedCalendarDate
                                                ? 'bg-yellow-50 border-2 border-yellow-200 text-yellow-700 hover:bg-yellow-100 cursor-pointer'
                                                : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                            }
                `}
                                    >
                                        Holiday {!selectedCalendarDate && '(Select a date first)'}
                                    </button>
                                </div>

                                {/* Clear Selection */}
                                {selectedCalendarDate && (
                                    <button
                                        onClick={() => setSelectedCalendarDate(null)}
                                        className="w-full mt-3 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                                    >
                                        Clear Selection
                                    </button>
                                )}
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            {/* Time Setting Modal */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">Set Working Hours</h3>
                            <button
                                onClick={() => setShowTimeModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        value={timeSlots[0]?.start || '10:00'}
                                        onChange={(e) => setTimeSlots([{ start: e.target.value, end: timeSlots[0]?.end || '18:00' }])}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                    <input
                                        type="time"
                                        value={timeSlots[0]?.end || '18:00'}
                                        onChange={(e) => setTimeSlots([{ start: timeSlots[0]?.start || '10:00', end: e.target.value }])}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowTimeModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTime}
                                className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                                Save Working Hours
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
