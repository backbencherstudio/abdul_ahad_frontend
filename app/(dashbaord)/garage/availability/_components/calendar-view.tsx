"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

interface WeekDay {
  date: string
  day_name: string
  is_today: boolean
  is_holiday: boolean
  day_of_week?: number
  start_time?: string
  end_time?: string
  breaks: Array<{
    start_time: string
    end_time: string
    description: string
  }>
  description?: string
}

interface WeekSchedule {
  days: WeekDay[]
}

interface CalendarViewProps {
  year: number
  month: number
  monthHolidays: MonthHoliday[]
  currentWeek: CurrentWeek | null
  weekSchedule?: WeekSchedule
  isLoading?: boolean
  onMonthChange: (year: number, month: number) => void
  onDateSelect: (date: string) => void
  onModalClose?: () => void
}

export default function CalendarView({
  year,
  month,
  monthHolidays,
  currentWeek,
  weekSchedule,
  isLoading = false,
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
   * Check if date is a special holiday (month_holidays)
   */
  const isSpecialHoliday = (dateStr: string): MonthHoliday | null => {
    return monthHolidays.find((holiday) => holiday.date === dateStr) || null
  }

  /**
   * Check if date is an office holiday (is_holiday: true)
   */
  const isOfficeHoliday = (dateStr: string): boolean => {
    if (!weekSchedule?.days) return false
    const day = weekSchedule.days.find((d) => d.date === dateStr)
    return day?.is_holiday === true
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
      const specialHoliday = isSpecialHoliday(dateStr)
      const officeHoliday = isOfficeHoliday(dateStr)
      const inCurrentWeek = isInCurrentWeek(dateStr)

      days.push({
        date: currentDate.getDate(),
        dateStr,
        isCurrentMonth,
        isToday,
        isSelected,
        specialHoliday,
        officeHoliday,
        inCurrentWeek,
        dayOfWeek: currentDate.getDay(),
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <>
      <Card className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 pt-4">
          <CardTitle className="text-xl font-bold text-gray-900 text-center">
            Calendar & Availability
          </CardTitle>
        </CardHeader>

        <CardContent className="">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="cursor-pointer hover:bg-gray-50 border-gray-300  transition-all disabled:opacity-50" 
              onClick={() => navigateMonth("prev")}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-3">
              <Select
                value={String(month - 1)}
                onValueChange={(value) => onMonthChange(year, Number.parseInt(value) + 1)}
              >
                <SelectTrigger className="w-[140px] px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg  hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((monthName, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {monthName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(year)}
                onValueChange={(value) => onMonthChange(Number.parseInt(value), month)}
              >
                <SelectTrigger className="w-[100px] px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg  hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 5).map((yearOption) => (
                    <SelectItem key={yearOption} value={String(yearOption)}>
                      {yearOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="cursor-pointer hover:bg-gray-50 border-gray-300 transition-all disabled:opacity-50" 
              onClick={() => navigateMonth("next")}
              disabled={isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-4">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div 
                  key={day} 
                  className="text-center text-xs font-semibold text-gray-600 py-2 uppercase tracking-wide"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                // Office holiday (is_holiday: true) - red circle
                const isOfficeOff = day.officeHoliday && day.isCurrentMonth
                // Special holiday (month_holidays) - blue circle
                const isSpecial = day.specialHoliday && day.isCurrentMonth
                
                return (
                  <div
                    key={`${day.dateStr}-${index}`}
                    onClick={() => handleDateClick(day.dateStr, day.isCurrentMonth)}
                    className={`
                      h-12 w-full flex items-center justify-center text-sm cursor-pointer transition-all relative rounded-lg
                      ${!day.isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                      ${day.isCurrentMonth && !day.isToday && !day.isSelected && !isOfficeOff && !isSpecial ? " rounded-lg" : ""}
                      ${day.inCurrentWeek && day.isCurrentMonth && !day.isToday && !day.isSelected && !isOfficeOff && !isSpecial ? "bg-green-50" : ""}
                    `}
                  >
                    {/* Date number with circle background */}
                    <div
                      className={`
                        w-9 h-9 flex items-center justify-center rounded-full transition-all relative font-medium
                        ${day.isToday ? "border-2 border-green-500 text-green-600 bg-green-50 font-bold shadow-sm" : ""}
                        ${day.isSelected && !day.isToday ? "bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600" : ""}
                        ${isOfficeOff && !day.isToday && !day.isSelected ? "border-2 border-red-500 bg-red-50 text-red-600 font-medium" : ""}
                        ${isSpecial && !day.isToday && !day.isSelected && !isOfficeOff ? "border-2 border-blue-500 bg-transparent text-blue-600 font-medium" : ""}
                        ${!day.isToday && !day.isSelected && !isOfficeOff && !isSpecial && day.isCurrentMonth ? "hover:bg-gray-200 hover:scale-105" : ""}
                      `}
                    >
                      {day.date}
                      {/* Special holiday dot indicator - inside circle, top right */}
                      {isSpecial && day.isCurrentMonth && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
