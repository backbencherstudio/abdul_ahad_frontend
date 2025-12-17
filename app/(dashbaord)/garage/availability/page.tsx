"use client"

import { useState, useCallback, useEffect } from "react"
import DefaultRoutineModal from "./_components/modals/default-routine-modal"
import ManageSlotsModal from "./_components/modals/manage-slots-modal"
import WeekView from "./_components/week-view"
import CalendarView from "./_components/calendar-view"
import WeekNavigation from "./_components/week-navigation"
import {
  type ScheduleConfig,
  useGetScheduleQuery,
  useGetCalendarViewQuery,
} from "../../../../rtk/api/garage/api"

/**
 * Main Availability Management Page
 *
 * This page handles the complete availability management system for garage users.
 * It includes default routine setup and comprehensive slot management with API integration.
 *
 * Flow:
 * 1. Check if default schedule is configured on page load
 * 2. Show default routine modal if not configured
 * 3. Display main calendar interface with week/calendar views
 * 4. Provide slot management capabilities through modals
 */
export default function AvailabilityPage() {
  // Schedule configuration state
  const [hasDefaultSchedule, setHasDefaultSchedule] = useState<boolean | null>(null)
  const [showDefaultRoutineModal, setShowDefaultRoutineModal] = useState(false)

  // Slot management state
  const [showManageSlotsModal, setShowManageSlotsModal] = useState(false)
  const [selectedSlotDate, setSelectedSlotDate] = useState<string>("")

  // Calendar state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number | null>(null)

  // Default routine edit state
  const [showEditDefaultRoutine, setShowEditDefaultRoutine] = useState(false)

  /**
   * RTK Query – check if garage has default schedule configured
   */
  const {
    data: scheduleResponse,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    refetch: refetchSchedule,
  } = useGetScheduleQuery()

  /**
   * RTK Query – load calendar data for specified year and month
   * Automatically detects current week if no week number specified
   * Skips fetching when default schedule is not configured yet
   */
  const {
    data: calendarResponse,
    isFetching: isCalendarFetching,
    refetch: refetchCalendar,
  } = useGetCalendarViewQuery(
    {
      year: currentYear,
      month: currentMonth,
      weekNumber: currentWeekNumber ?? undefined,
    },
    {
      skip: hasDefaultSchedule === false || hasDefaultSchedule === null,
    },
  )

  const calendarData = calendarResponse?.data

  /**
   * Derive hasDefaultSchedule + initial default routine modal visibility
   */
  useEffect(() => {
    if (isScheduleLoading) return

    if (scheduleResponse?.success && scheduleResponse.data) {
      setHasDefaultSchedule(true)
      setShowDefaultRoutineModal(false)
      return
    }

    if ((isScheduleError || !scheduleResponse?.success || !scheduleResponse?.data) && hasDefaultSchedule === null) {
      setHasDefaultSchedule(false)
      setShowDefaultRoutineModal(true)
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

  /**
   * Handle successful default routine configuration
   * Closes modal and loads calendar data
   */
  const handleDefaultRoutineSuccess = async () => {
    setShowDefaultRoutineModal(false)
    setHasDefaultSchedule(true)
    // Ensure latest schedule + calendar are fetched immediately
    await Promise.all([refetchSchedule(), refetchCalendar()])
  }

  /**
   * Handle week navigation
   * Updates calendar data for new week without full reload
   */
  const handleWeekChange = useCallback(
    async (newWeekNumber: number) => {
      console.log("[v0] Week change requested:", newWeekNumber)
      setCurrentWeekNumber(newWeekNumber)
    },
    [],
  )

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
   * Handle default routine edit
   * Opens default routine modal for editing existing configuration
   */
  const handleEditDefaultRoutine = () => {
    setShowEditDefaultRoutine(true)
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

  /**
   * Handle default routine edit success
   * Refreshes calendar data after routine changes
   */
  const handleDefaultRoutineEditSuccess = async () => {
    setShowEditDefaultRoutine(false)
    // Refresh schedule + calendar after editing default routine
    await Promise.all([refetchSchedule(), refetchCalendar()])
  }

  return (
    <div className="">
      <div className="">
        {/* Page Header */}
        {/* <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Garage Availability Manager</h1>
          <p className="text-gray-600">Manage your schedule, slots, and availability preferences</p>
        </div> */}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Week View */}
          <div className="space-y-4">
            <WeekNavigation
              currentWeek={currentWeekNumber || 1}
              onWeekChange={handleWeekChange}
              weekData={calendarData?.week_schedule}
              onEditDefaultRoutine={handleEditDefaultRoutine}
            />

            <WeekView weekData={calendarData?.week_schedule} onManageSlots={handleManageSlots} />
          </div>

          {/* Right Panel - Calendar View */}
          <div>
            {/* <CalendarView
              year={currentYear}
              month={currentMonth}
              monthHolidays={calendarData?.month_holidays || []}
              currentWeek={calendarData?.current_week}
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
            /> */}
          </div>
        </div>
      </div>

      {/* Default Routine Configuration Modal */}
      {showDefaultRoutineModal && (
        <DefaultRoutineModal
          isOpen={showDefaultRoutineModal}
          onClose={() => setShowDefaultRoutineModal(false)}
          onSuccess={handleDefaultRoutineSuccess}
          initialConfig={scheduleResponse?.data as ScheduleConfig | undefined}
        />
      )}

      {/* Default Routine Edit Modal */}
      {showEditDefaultRoutine && (
        <DefaultRoutineModal
          isOpen={showEditDefaultRoutine}
          onClose={() => setShowEditDefaultRoutine(false)}
          onSuccess={handleDefaultRoutineEditSuccess}
          initialConfig={scheduleResponse?.data as ScheduleConfig | undefined}
        />
      )}

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
    </div>
  )
}
