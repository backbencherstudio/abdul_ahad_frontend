"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Trash2, Clock, Calendar, RotateCcw } from "lucide-react"
import { apiClient, type ScheduleConfig } from "../../../../../../rtk/api/garage/api"

interface DefaultRoutineModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialConfig?: ScheduleConfig
}

type Restriction = ScheduleConfig["restrictions"][number]

// Default values for new schedule
const DEFAULT_START_TIME = "08:00"
const DEFAULT_END_TIME = "18:00"
const DEFAULT_SLOT_DURATION = 60
const DEFAULT_RESTRICTIONS: Restriction[] = [
  {
    type: "BREAK",
    start_time: "12:00",
    end_time: "13:00",
    description: "Lunch Break",
    is_recurring: true,
    day_of_week: [1, 2, 3, 4, 5, 6], // Monday to Saturday (excluding Sunday which is holiday)
  },
  {
    type: "HOLIDAY",
    day_of_week: 0, // Sunday
    description: "Sunday Closure",
    is_recurring: true,
  },
]

/**
 * Default Routine Configuration Modal
 *
 * This modal handles the initial setup of garage working hours, breaks, and holidays.
 * It's shown when no default schedule is configured and blocks access to the main
 * application until configuration is complete.
 *
 * Features:
 * - Working hours configuration (start/end time, slot duration)
 * - Break time management with recurring schedules
 * - Holiday configuration with day-of-week selection
 * - Form validation and error handling
 * - API integration for schedule creation
 * - Load existing configuration for editing
 * - Restore to default values
 */
export default function DefaultRoutineModal({ isOpen, onClose, onSuccess, initialConfig }: DefaultRoutineModalProps) {
  // Basic schedule configuration
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME)
  const [endTime, setEndTime] = useState(DEFAULT_END_TIME)
  const [slotDuration, setSlotDuration] = useState(DEFAULT_SLOT_DURATION)

  // Restrictions (breaks and holidays)
  const [restrictions, setRestrictions] = useState<Restriction[]>(DEFAULT_RESTRICTIONS)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Day names for display
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  /**
   * Load initial configuration when modal opens
   */
  useEffect(() => {
    if (!isOpen) return
    if (initialConfig) {
      // Populate form with existing configuration
      setStartTime(initialConfig.start_time || DEFAULT_START_TIME)
      setEndTime(initialConfig.end_time || DEFAULT_END_TIME)
      setSlotDuration(initialConfig.slot_duration || DEFAULT_SLOT_DURATION)

      // Base restrictions coming directly from API (if any)
      const baseRestrictions: Restriction[] = Array.isArray(initialConfig.restrictions)
        ? (initialConfig.restrictions as Restriction[])
        : []

      // Collect holiday days from existing HOLIDAY restrictions
      const existingHolidayRestrictions = baseRestrictions.filter((r) => r.type === "HOLIDAY")
      const existingHolidayDesc = existingHolidayRestrictions[0]?.description || "Holiday"
      const holidayDaysFromRestrictions: number[] = existingHolidayRestrictions.flatMap((r) =>
        Array.isArray(r.day_of_week) ? r.day_of_week : [r.day_of_week],
      )

      // Collect holiday days from daily_hours (days marked as closed)
      const dailyHours = (initialConfig as any).daily_hours as
        | Record<
            string,
            {
              is_closed?: boolean
            }
          >
        | undefined

      const holidayDaysFromDailyHours: number[] = []
      if (dailyHours) {
        Object.entries(dailyHours).forEach(([dayKey, value]) => {
          const dayIndex = Number(dayKey)
          if (Number.isNaN(dayIndex)) return
          if (value && value.is_closed) {
            holidayDaysFromDailyHours.push(dayIndex)
          }
        })
      }

      // Merge and de-duplicate all holiday days
      const allHolidayDays = Array.from(
        new Set([...holidayDaysFromRestrictions, ...holidayDaysFromDailyHours]),
      ).sort((a, b) => a - b)

      // Keep all non-holiday restrictions as-is (BREAK etc.)
      const nonHolidayRestrictions = baseRestrictions.filter((r) => r.type !== "HOLIDAY")

      // Build a single HOLIDAY restriction that represents all holiday days
      const mergedRestrictions: Restriction[] =
        nonHolidayRestrictions.length === 0 && allHolidayDays.length === 0
          ? DEFAULT_RESTRICTIONS
          : [
              ...nonHolidayRestrictions,
              ...(allHolidayDays.length > 0
                ? [
                    {
                      type: "HOLIDAY",
                      day_of_week: allHolidayDays,
                      description: existingHolidayDesc,
                      is_recurring: true,
                    } as Restriction,
                  ]
                : []),
            ]

      setRestrictions(mergedRestrictions)
      setError("")
    } else {
      // Reset to defaults for new configuration
      handleRestoreDefaults()
    }
  }, [initialConfig, isOpen])

  /**
   * Restore form to default values
   */
  const handleRestoreDefaults = () => {
    setStartTime(DEFAULT_START_TIME)
    setEndTime(DEFAULT_END_TIME)
    setSlotDuration(DEFAULT_SLOT_DURATION)
    setRestrictions(DEFAULT_RESTRICTIONS)
    setError("")
  }

  /**
   * Add new break restriction
   */
  const addBreak = () => {
    // Filter out holiday days from the default break days
    const availableDays = [1, 2, 3, 4, 5, 6].filter(day => !isDayHoliday(day))

    if (availableDays.length === 0) {
      setError("All weekdays are already marked as holidays. Please remove some holidays before adding breaks.")
      return
    }

    setRestrictions([
      ...restrictions,
      {
        type: "BREAK",
        start_time: "15:00",
        end_time: "15:30",
        description: "Afternoon Break",
        is_recurring: true,
        day_of_week: availableDays,
      },
    ])
  }

  /**
   * Add new holiday restriction
   */
  const addHoliday = () => {
    setRestrictions([
      ...restrictions,
      {
        type: "HOLIDAY",
        day_of_week: 0,
        description: "Holiday",
        is_recurring: true,
      },
    ])
  }

  /**
   * Remove restriction by index
   */
  const removeRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index))
  }

  /**
   * Update restriction at specific index
   */
  const updateRestriction = (index: number, updates: Partial<Restriction>) => {
    setRestrictions(restrictions.map((restriction, i) => (i === index ? { ...restriction, ...updates } : restriction)))
  }

  /**
   * Check if a specific day is already marked as a holiday
   */
  const isDayHoliday = (dayIndex: number): boolean => {
    return restrictions.some(
      (restriction) =>
        restriction.type === "HOLIDAY" &&
        (Array.isArray(restriction.day_of_week)
          ? restriction.day_of_week.includes(dayIndex)
          : restriction.day_of_week === dayIndex)
    )
  }

  /**
   * Toggle day selection for restriction
   */
  const toggleDay = (restrictionIndex: number, dayIndex: number) => {
    const restriction = restrictions[restrictionIndex]
    let newDayOfWeek: number | number[]

    if (Array.isArray(restriction.day_of_week)) {
      const currentDays = restriction.day_of_week
      if (currentDays.includes(dayIndex)) {
        newDayOfWeek = currentDays.filter((day) => day !== dayIndex)
      } else {
        newDayOfWeek = [...currentDays, dayIndex].sort()
      }
    } else {
      newDayOfWeek = restriction.day_of_week === dayIndex ? [] : [dayIndex]
    }

    updateRestriction(restrictionIndex, { day_of_week: newDayOfWeek })

    // Smart behavior: If this is a HOLIDAY being added, remove BREAK restrictions for the same day
    if (restriction.type === "HOLIDAY" && newDayOfWeek !== restriction.day_of_week) {
      // Check if we're adding a new holiday day
      const isAddingHoliday = Array.isArray(newDayOfWeek)
        ? newDayOfWeek.length > (Array.isArray(restriction.day_of_week) ? restriction.day_of_week.length : 1)
        : newDayOfWeek !== undefined

      if (isAddingHoliday) {
        console.log(`[Smart Behavior] Adding holiday for day ${dayIndex} (${dayNames[dayIndex]}), removing breaks for this day`)

        // Remove BREAK restrictions for this day
        setRestrictions(prevRestrictions => {
          const updated = prevRestrictions.map(r => {
            if (r.type === "BREAK") {
              if (Array.isArray(r.day_of_week)) {
                const filtered = r.day_of_week.filter(day => day !== dayIndex)
                if (filtered.length !== r.day_of_week.length) {
                  console.log(`[Smart Behavior] Removed day ${dayIndex} from break: ${r.description}`)
                }
                return {
                  ...r,
                  day_of_week: filtered
                }
              } else if (r.day_of_week === dayIndex) {
                console.log(`[Smart Behavior] Removed single day break: ${r.description}`)
                return {
                  ...r,
                  day_of_week: []
                }
              }
            }
            return r
          })
          return updated
        })
      }
    }
  }

  /**
   * Validate form data before submission
   */
  const validateForm = (): string | null => {
    if (!startTime || !endTime) {
      return "Please set both start and end times"
    }

    if (startTime >= endTime) {
      return "End time must be after start time"
    }

    if (slotDuration < 15 || slotDuration > 480) {
      return "Slot duration must be between 15 and 480 minutes"
    }

    // Validate breaks
    for (const restriction of restrictions) {
      if (restriction.type === "BREAK") {
        if (!restriction.start_time || !restriction.end_time) {
          return "All breaks must have start and end times"
        }
        if (restriction.start_time >= restriction.end_time) {
          return "Break end time must be after start time"
        }
      }

      if (!restriction.description.trim()) {
        return "All restrictions must have descriptions"
      }

    }

    return null
  }

  /**
   * Clean up restrictions before submission (remove breaks from holiday days)
   */
  const cleanupRestrictions = () => {
    const cleanedRestrictions = restrictions.map(restriction => {
      if (restriction.type === "BREAK") {
        // Remove holiday days from break restrictions
        const cleanedDays = Array.isArray(restriction.day_of_week)
          ? restriction.day_of_week.filter(day => !isDayHoliday(day))
          : isDayHoliday(restriction.day_of_week) ? [] : restriction.day_of_week

        return {
          ...restriction,
          day_of_week: cleanedDays
        }
      }
      return restriction
    }).filter(restriction => {
      // Remove restrictions with no days selected
      if (Array.isArray(restriction.day_of_week)) {
        return restriction.day_of_week.length > 0
      }
      return restriction.day_of_week !== undefined
    })

    return cleanedRestrictions
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      // Clean up restrictions before submission
      const cleanedRestrictions = cleanupRestrictions()

      const config: ScheduleConfig = {
        start_time: startTime,
        end_time: endTime,
        slot_duration: slotDuration,
        restrictions: cleanedRestrictions,
      }

      const response = await apiClient.createSchedule(config)

      if (response.success) {
        onSuccess()
      } else {
        const message =
          typeof response.message === "string"
            ? response.message
            : (response as any)?.message?.message || "Failed to create schedule"
        setError(message)
      }
    } catch (error) {
      console.error("[v0] Error creating schedule:", error)
      setError("Failed to create schedule. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full !max-w-3xl max-h-[90vh] overflow-y-auto ">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="flex items-center justify-between py-5">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {initialConfig ? "Edit Default Routine" : "Setup Default Routine"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="cursor-pointer" onClick={onClose} disabled={loading}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="text-gray-600 mt-1">
                  {initialConfig
                    ? "Update your garage's working hours, breaks, and holidays"
                    : "Configure your garage's working hours, breaks, and holidays to get started"
                  }
                </CardDescription>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Smart Behavior:</strong> When you select a day as a holiday, any breaks for that day will be automatically removed since they're not needed.
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Working Hours Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Working Hours</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={loading}
                        className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={loading}
                        className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                      <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slot Duration (minutes)</label>
                    <Input
                      type="number"
                      min="15"
                      max="480"
                      step="15"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number.parseInt(e.target.value))}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Restrictions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Breaks & Holidays</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={addBreak} disabled={loading}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Break
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={addHoliday} disabled={loading}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Holiday
                    </Button>
                  </div>
                </div>

                {/* Smart Behavior Info */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>💡 Smart Tip:</strong> When you mark a day as a holiday, any breaks for that day are automatically removed.
                    This prevents scheduling conflicts and makes your routine more logical.
                  </p>
                </div>

                <div className="space-y-4">
                  {restrictions.map((restriction, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={restriction.type === "BREAK" ? "secondary" : "destructive"}>
                            {restriction.type}
                          </Badge>
                          {restriction.type === "BREAK" && (
                            <span className="text-xs text-gray-500">
                              (Days: {Array.isArray(restriction.day_of_week)
                                ? restriction.day_of_week.map(day => dayNames[day].slice(0, 3)).join(", ")
                                : dayNames[restriction.day_of_week].slice(0, 3)
                              })
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => removeRestriction(index)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <Input
                            value={restriction.description}
                            onChange={(e) => updateRestriction(index, { description: e.target.value })}
                            placeholder="Enter description..."
                            disabled={loading}
                          />
                        </div>

                        {restriction.type === "BREAK" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                              <div className="relative">
                                <Input
                                  type="time"
                                  value={restriction.start_time || ""}
                                  onChange={(e) => updateRestriction(index, { start_time: e.target.value })}
                                  disabled={loading}
                                  className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                />
                                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                              <div className="relative">
                                <Input
                                  type="time"
                                  value={restriction.end_time || ""}
                                  onChange={(e) => updateRestriction(index, { end_time: e.target.value })}
                                  disabled={loading}
                                  className="pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                />
                                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Day Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                        <div className="flex flex-wrap gap-2">
                          {dayNames.map((dayName, dayIndex) => {
                            const isSelected = Array.isArray(restriction.day_of_week)
                              ? restriction.day_of_week.includes(dayIndex)
                              : restriction.day_of_week === dayIndex

                            const isHoliday = isDayHoliday(dayIndex)
                            const isBreakType = restriction.type === "BREAK"

                            return (
                              <Button
                                key={dayIndex}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"

                                onClick={() => toggleDay(index, dayIndex)}
                                disabled={loading || (isBreakType && isHoliday)}
                                className={`text-xs cursor-pointer ${isBreakType && isHoliday
                                  ? "opacity-50 cursor-not-allowed bg-gray-100"
                                  : ""
                                  }`}
                                title={
                                  isBreakType && isHoliday
                                    ? `${dayName} is already a holiday - no breaks needed`
                                    : ""
                                }
                              >
                                {dayName.slice(0, 3)}
                                {isHoliday && !isSelected && (
                                  <span className="ml-1 text-xs text-red-500">(H)</span>
                                )}
                              </Button>
                            )
                          })}
                        </div>
                        {restriction.type === "BREAK" && (
                          <p className="text-xs text-gray-500 mt-2">
                            Note: Days marked as holidays will automatically exclude breaks
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Summary */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">Schedule Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Working Hours:</span>
                    <span className="ml-2 text-gray-600">{startTime} - {endTime}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Slot Duration:</span>
                    <span className="ml-2 text-gray-600">{slotDuration} minutes</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Breaks:</span>
                    <span className="ml-2 text-gray-600">
                      {restrictions.filter(r => r.type === "BREAK").length} configured
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Holidays:</span>
                    <span className="ml-2 text-gray-600">
                      {restrictions.filter(r => r.type === "HOLIDAY").length} configured
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer text-orange-600 border-orange-300 hover:bg-orange-50"
                  onClick={handleRestoreDefaults}
                  disabled={loading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore to Default
                </Button>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="cursor-pointer" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 cursor-pointer" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {initialConfig ? "Updating..." : "Creating Schedule..."}
                      </div>
                    ) : (
                      initialConfig ? "Update Default Routine" : "Create Default Routine"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
