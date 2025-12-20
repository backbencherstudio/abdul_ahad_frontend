"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MonthHoliday {
  date: string
  description: string
  type?: string
  day_of_week?: number
}

interface CurrentWeek {
  week_number: number
  start_date: string
  end_date: string
}

interface CalendarViewProps {
  year: number
  month: number
  monthHolidays: MonthHoliday[]
  currentWeek: CurrentWeek | null
  onMonthChange: (year: number, month: number) => void
  onDateSelect: (date: string) => void
  onModalClose?: () => void
}

export default function CalendarView({
  year,
  month,
  monthHolidays,
  currentWeek,
  onMonthChange,
  onDateSelect,
  onModalClose,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)

  // Month names for display
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  React.useEffect(() => {
    const handleModalClose = () => {
      setSelectedDate(null)
    }

    if (onModalClose) {
      // Listen for modal close events
      window.addEventListener("modalClosed", handleModalClose)
      return () => window.removeEventListener("modalClosed", handleModalClose)
    }
  }, [onModalClose])

  /**
   * Handle month navigation
   */
  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (month === 1) {
        onMonthChange(year - 1, 12)
      } else {
        onMonthChange(year, month - 1)
      }
    } else {
      if (month === 12) {
        onMonthChange(year + 1, 1)
      } else {
        onMonthChange(year, month + 1)
      }
    }
  }

  /**
   * Handle date selection
   */
  const handleDateClick = (dateStr: string, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      setSelectedDate(dateStr)
      onDateSelect(dateStr)
    }
  }

  /**
   * Check if date is a holiday based on API response
   */
  const isHoliday = (dateStr: string): MonthHoliday | null => {
    return monthHolidays.find((holiday) => holiday.date === dateStr) || null
  }

  /**
   * Check if date is in current week
   */
  const isInCurrentWeek = (dateStr: string): boolean => {
    if (!currentWeek) return false
    return dateStr >= currentWeek.start_date && dateStr <= currentWeek.end_date
  }

  /**
   * Format a Date into local YYYY-MM-DD (no timezone shift)
   */
  const formatLocalISO = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  /**
   * Generate calendar days
   */
  const generateCalendarDays = () => {
    const firstDay = new Date(year, month - 1, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const today = new Date()
    const todayStr = formatLocalISO(today)

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      const dateStr = formatLocalISO(currentDate)

      const isCurrentMonth = currentDate.getMonth() === month - 1
      const isToday = dateStr === todayStr
      const isSelected = selectedDate === dateStr
      const holiday = isHoliday(dateStr)
      const inCurrentWeek = isInCurrentWeek(dateStr)

      days.push({
        date: currentDate.getDate(),
        dateStr,
        isCurrentMonth,
        isToday,
        isSelected,
        holiday,
        inCurrentWeek,
        dayOfWeek: currentDate.getDay(),
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <Card className="bg-white rounded-lg p-5">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 text-center">Calendar & Availability</CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <select
              value={month - 1}
              onChange={(e) => onMonthChange(year, Number.parseInt(e.target.value) + 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((monthName, index) => (
                <option key={index} value={index}>
                  {monthName}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => onMonthChange(Number.parseInt(e.target.value), month)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 5).map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" className="cursor-pointer"  onClick={() => navigateMonth("next")}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={`${day.dateStr}-${index}`}
                onClick={() => handleDateClick(day.dateStr, day.isCurrentMonth)}
                className={`
                  h-10 w-full flex items-center justify-center text-sm cursor-pointer transition-all relative
                  ${!day.isCurrentMonth ? "text-gray-300" : "text-gray-700 hover:bg-gray-100"}
                  ${day.inCurrentWeek && day.isCurrentMonth ? "bg-green-100" : ""}
                  ${day.isToday ? "bg-red-500 text-white font-bold rounded-lg" : ""}
                  ${day.isSelected && !day.isToday ? "bg-blue-500 text-white font-bold rounded-lg" : ""}
                `}
              >
                {day.date}
                {day.holiday && day.isCurrentMonth && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
