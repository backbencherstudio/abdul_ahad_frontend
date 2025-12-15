"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, X } from "lucide-react"

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

interface WeekViewProps {
  weekData: WeekSchedule | null
  onManageSlots: (date: string) => void
}

/**
 * Week View Component
 *
 * Displays the 7-day week schedule with working hours, breaks, and holidays.
 * Each day shows its availability status and includes a "Manage Slots" button
 * for detailed slot management operations.
 *
 * Features:
 * - Visual indicators for working days, holidays, and today's date
 * - Working hours and break time display
 * - Manage slots button for each day (as required by the report)
 * - Responsive design maintaining original styling
 */
export default function WeekView({ weekData, onManageSlots }: WeekViewProps) {
  /**
   * Format time from 24-hour to 12-hour format with AM/PM
   */
  const formatTimeToAmPm = (time24: string): string => {
    const [hours, minutes] = time24.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${hours12}:${minutes.toString().padStart(2, "0")}${period}`
  }

  /**
   * Parse a YYYY-MM-DD date string as a UTC date to avoid timezone shifts
   */
  const parseDateUtc = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number)
    return new Date(Date.UTC(year, month - 1, day))
  }

  /**
   * Shift date to match provided day_of_week if backend date is off-by-one
   */
  const getCorrectedDate = (dateStr: string, backendDayOfWeek?: number): Date => {
    const date = parseDateUtc(dateStr)
    if (backendDayOfWeek === undefined || backendDayOfWeek === null) return date
    const utcDow = date.getUTCDay()
    if (utcDow === backendDayOfWeek) return date
    const deltaDays = (backendDayOfWeek - utcDow + 7) % 7
    const corrected = new Date(date)
    corrected.setUTCDate(date.getUTCDate() + deltaDays)
    return corrected
  }

  /**
   * Format YYYY-MM-DD into DD/MM/YYYY for display
   */
  const formatDateDdMmYyyy = (dateStr: string): string => {
    const [y, m, d] = dateStr.split("-")
    return `${d}/${m}/${y}`
  }

  const getCorrectDayName = (dateStr: string): string => {
    const date = parseDateUtc(dateStr)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return dayNames[date.getUTCDay()]
  }

  /**
   * Get appropriate icon for day status based on API response
   */
  const getDayIcon = (day: WeekDay) => {
    if (day.is_holiday) {
      return (
        <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">H</span>
        </div>
      )
    }

    return (
      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    )
  }

  if (!weekData || !weekData.days) {
    // Shimmer skeleton while week schedule is loading
    return (
      <Card className="bg-white rounded-lg p-5">
        <div className="space-y-4">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="h-2 w-16 rounded bg-gray-100" />
                </div>
                <div className="h-7 w-24 rounded bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-9 rounded-lg bg-gray-100" />
                <div className="h-9 rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // Normalize days with corrected dates and ensure order Sunday (0) to Saturday (6)
  const todayUtcStr = new Date().toISOString().split("T")[0]
  const normalizedDays = weekData.days.map((day) => {
    const correctedDate = getCorrectedDate(day.date, day.day_of_week as number | undefined)
    const correctedDateIso = correctedDate.toISOString()
    const correctedDateStr = correctedDateIso.split("T")[0]
    const correctedDow = correctedDate.getUTCDay()
    const isToday = correctedDateStr === todayUtcStr
    return {
      ...day,
      date: correctedDateStr,
      _iso: correctedDateIso,
      _dow: correctedDow,
      is_today: isToday,
    }
  })

  const sortedDays = normalizedDays.sort((a, b) => a._dow - b._dow)

  return (
    <Card className="bg-white rounded-lg p-5">
      <div className="space-y-3">
        {sortedDays.map((day) => (
          <div key={day.date} className="bg-white border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
            <div className="flex items-center gap-2 mb-3">
              {/* Day Icon */}
              <div className="flex-shrink-0">{getDayIcon(day)}</div>

              {/* Day Name and Date */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-800">{getCorrectDayName(day.date)}</h3>
                  {day.is_today && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Today
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">{formatDateDdMmYyyy((day as any).date)}</p>
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageSlots((day as any).date)}
                  className="text-xs px-2 py-1 h-7"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Manage Slots
                </Button>
              </div>
            </div>

            {/* Time Display */}
            <div>
              {day.is_holiday ? (
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
                    <div className="text-sm font-medium text-yellow-600">Holiday</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
                    <div className="text-sm font-medium text-yellow-600">Holiday</div>
                  </div>
                </div>
              ) : day.start_time && day.end_time ? (
                <div className="space-y-2">
                  {/* Working Hours */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                      <div className="text-sm font-medium text-gray-800">{formatTimeToAmPm(day.start_time)}</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                      <div className="text-sm font-medium text-gray-800">{formatTimeToAmPm(day.end_time)}</div>
                    </div>
                  </div>

                  {/* Break Times */}
                  {day.breaks && day.breaks.length > 0 && (
                    <div className="space-y-1">
                      {day.breaks.map((breakTime, breakIndex) => (
                        <div key={breakIndex} className="flex items-center gap-2 text-xs text-gray-600">
                          <X className="w-3 h-3" />
                          <span>
                            Break: {formatTimeToAmPm(breakTime.start_time)} - {formatTimeToAmPm(breakTime.end_time)}
                          </span>
                          <span className="text-gray-500">({breakTime.description})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                    <div className="text-sm font-medium text-gray-400">---</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-center">
                    <div className="text-sm font-medium text-gray-400">---</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
