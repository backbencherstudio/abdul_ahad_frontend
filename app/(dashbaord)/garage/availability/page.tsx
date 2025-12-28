"use client"

import { useState, useCallback, useEffect } from "react"
import ManageSlotsModal from "./_components/modals/manage-slots-modal"
import CalendarView from "./_components/calendar-view"
import {
  useGetCalendarViewQuery,
  useGetScheduleQuery,
  scheduleApi,
} from "../../../../rtk/api/garage/scheduleApis"
import { useAppDispatch } from "@/rtk/hooks"
import DefultCalanderView from "./_components/DefultCalanderView"
import ManageHolidaysModal from "./_components/ManageHolidaysModal"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function AvailabilityPage() {
  // Schedule configuration state
  const [hasDefaultSchedule, setHasDefaultSchedule] = useState<boolean | null>(null)

  // Slot management state
  const [showManageSlotsModal, setShowManageSlotsModal] = useState(false)
  const [selectedSlotDate, setSelectedSlotDate] = useState<string>("")

  // Calendar state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number | null>(null)

  // Manage holidays modal state
  const [showManageHolidaysModal, setShowManageHolidaysModal] = useState(false)

  /**
   * RTK Query – check if garage has default schedule configured
   */
  const {
    data: scheduleResponse,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    refetch: refetchSchedule,
  } = useGetScheduleQuery()

  const {
    data: calendarResponse,
    isFetching: isCalendarFetching,
    isLoading: isCalendarLoading,
    refetch: refetchCalendar,
  } = useGetCalendarViewQuery(
    {
      year: currentYear,
      month: currentMonth,
      weekNumber: currentWeekNumber ?? undefined,
    },
    {
      skip: hasDefaultSchedule === false || hasDefaultSchedule === null,
      // Keep previous data visible while fetching new data
      refetchOnMountOrArgChange: true,
    },
  )

  const calendarData = calendarResponse?.data

  /**
   * Derive hasDefaultSchedule
   */
  useEffect(() => {
    if (isScheduleLoading) return

    if (scheduleResponse?.success && scheduleResponse.data) {
      setHasDefaultSchedule(true)
      return
    }

    if ((isScheduleError || !scheduleResponse?.success || !scheduleResponse?.data) && hasDefaultSchedule === null) {
      setHasDefaultSchedule(false)
    }
  }, [scheduleResponse, isScheduleLoading, isScheduleError, hasDefaultSchedule])

  /**
   * When calendar data arrives, set current week number from API if not already set
   */
  useEffect(() => {
    if (calendarData?.current_week && !currentWeekNumber) {
      setCurrentWeekNumber(calendarData.current_week.week_number)
    }
  }, [calendarData, currentWeekNumber])


  const dispatch = useAppDispatch()

  /**
   * Prefetch next/previous month data for faster loading
   */
  useEffect(() => {
    if (hasDefaultSchedule === false || hasDefaultSchedule === null) return

    // Prefetch next month
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear
    dispatch(
      scheduleApi.util.prefetch(
        "getCalendarView",
        { year: nextYear, month: nextMonth },
        { force: false }
      )
    )

    // Prefetch previous month
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
    dispatch(
      scheduleApi.util.prefetch(
        "getCalendarView",
        { year: prevYear, month: prevMonth },
        { force: false }
      )
    )
  }, [currentYear, currentMonth, hasDefaultSchedule, dispatch])

  /**
   * Handle month navigation
   * Resets to current week of new month
   */
  const handleMonthChange = useCallback(
    async (newYear: number, newMonth: number) => {
      setCurrentYear(newYear)
      setCurrentMonth(newMonth)
      // Reset week number so that API can determine the appropriate current week
      setCurrentWeekNumber(null)
    },
    [],
  )

  /**
   * Handle manage slots button click
   * Opens slot management modal for specific date
   */
  const handleManageSlots = (date: string) => {
    setSelectedSlotDate(date)
    setShowManageSlotsModal(true)
  }

  /**
   * Handle slot management success
   * Refreshes calendar data after slot operations
   */
  const handleSlotManagementSuccess = async () => {
    setShowManageSlotsModal(false)
    setSelectedSlotDate("")
    // Force refresh of calendar after any slot operation
    await refetchCalendar()
  }

  return (
    <>
      <div className="">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900">Garage Availability Manager</h1>
            <p className="text-gray-600 text-sm">Update your garage's opening hours, breaks and holidays</p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="cursor-pointer flex items-center gap-2"
            onClick={() => setShowManageHolidaysModal(true)}
          >
            <Calendar className="w-4 h-4" />
            Manage Holidays
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            <DefultCalanderView 
              isLoading={isScheduleLoading} 
              onScheduleUpdate={async () => {
                // Ensure hasDefaultSchedule is true so calendar query is enabled
                if (hasDefaultSchedule === false || hasDefaultSchedule === null) {
                  setHasDefaultSchedule(true)
                }
                // Refetch calendar to show updated data immediately
                await refetchCalendar()
              }}
            />
          </div>

          {/* Right Panel - Calendar View */}
          <div>
            <CalendarView
              year={currentYear}
              month={currentMonth}
              monthHolidays={calendarData?.month_holidays || []}
              currentWeek={calendarData?.current_week}
              weekSchedule={calendarData?.week_schedule}
              isLoading={isCalendarFetching && !calendarData}
              onMonthChange={handleMonthChange}
              onDateSelect={(date: string) => {
                console.log("[v0] Date selected:", date)
                if (date) {
                  handleManageSlots(date)
                }
              }}
              onModalClose={() => {
                setShowManageSlotsModal(false)
                setSelectedSlotDate("")
              }}
            />
          </div>
        </div>
      </div>

      {/* Manage Slots Modal */}
      {showManageSlotsModal && selectedSlotDate && (
        <ManageSlotsModal
          isOpen={showManageSlotsModal}
          onClose={() => {
            setShowManageSlotsModal(false)
            setSelectedSlotDate("")
          }}
          date={selectedSlotDate}
          onSuccess={handleSlotManagementSuccess}
        />
      )}

      {/* Manage Holidays Modal */}
      {showManageHolidaysModal && (
        <ManageHolidaysModal
          isOpen={showManageHolidaysModal}
          onClose={() => setShowManageHolidaysModal(false)}
          onSuccess={() => {
            setShowManageHolidaysModal(false)
            // Refresh calendar data if needed
            refetchCalendar()
          }}
        />
      )}
    </>
  )
}
