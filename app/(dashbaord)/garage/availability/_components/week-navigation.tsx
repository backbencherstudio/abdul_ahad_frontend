"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"

interface WeekSchedule {
  days: Array<{
    date: string
    day_name: string
    is_today: boolean
    is_holiday: boolean
    start_time?: string
    end_time?: string
  }>
}

interface WeekNavigationProps {
  currentWeek: number
  onWeekChange: (weekNumber: number) => void
  weekData: WeekSchedule | null
  onEditDefaultRoutine?: () => void
}

export default function WeekNavigation({
  currentWeek,
  onWeekChange,
  weekData,
  onEditDefaultRoutine,
}: WeekNavigationProps) {
  /**
   * Get current week date range for display
   */
  const getCurrentWeekDateRange = () => {
    if (!weekData || !weekData.days || weekData.days.length === 0) {
      return { start: "", end: "" }
    }

    const startDate = weekData.days[0].date
    const endDate = weekData.days[6].date

    const startDateObj = new Date(startDate + "T00:00:00")
    const endDateObj = new Date(endDate + "T00:00:00")

    return {
      start: startDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      end: endDateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }
  }

  /**
   * Handle week navigation
   */
  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      onWeekChange(currentWeek - 1)
    }
  }

  const handleNextWeek = () => {
    // Allow navigation up to week 6 (maximum weeks in a month)
    if (currentWeek < 6) {
      onWeekChange(currentWeek + 1)
    }
  }

  /**
   * Handle default routine button click
   */
  const handleDefaultRoutine = () => {
    console.log("[v0] Set default routine clicked")
    if (onEditDefaultRoutine) {
      onEditDefaultRoutine()
    }
  }

  const dateRange = getCurrentWeekDateRange()

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Week Info and Navigation */}
      <div className="flex items-center gap-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Week {String(currentWeek).padStart(2, "0")}</h2>
          {dateRange.start && dateRange.end && (
            <p className="text-sm text-gray-600">
              {dateRange.start} - {dateRange.end}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            disabled={currentWeek <= 1}
            className="p-1 h-8 w-8 bg-transparent cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            disabled={currentWeek >= 6}
            className="p-1 h-8 w-8 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <Button variant="outline" size="sm" onClick={handleDefaultRoutine} className="text-sm bg-transparent cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Set Default Routine
        </Button>
      </div>
    </div>
  )
}
