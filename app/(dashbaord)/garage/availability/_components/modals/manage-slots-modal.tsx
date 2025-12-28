"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { X, Lock, Unlock, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAppDispatch } from "@/rtk/hooks"
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { SerializedError } from "@reduxjs/toolkit"
import {
  type ApiResponse,
  scheduleApi,
  useBulkSlotOperationMutation,
  useGetSlotDetailsQuery,
} from "../../../../../../rtk/api/garage/scheduleApis"

interface Slot {
  id?: string
  time: string
  status: string[]
  source: "DATABASE" | "TEMPLATE"
  description?: string
  modification_reason?: string
  modification_type?: string
}

interface SlotData {
  garage_id: string
  date: string
  working_hours: {
    start: string
    end: string
  }
  slots: Slot[]
  summary: {
    total_slots: number
    by_status: {
      available: number
      booked: number
      blocked: number
      breaks: number
      modified: number
      holiday: number
      dual_status: number
    }
    by_source: {
      template: number
      database: number
    }
    modifications: number
  }
}

interface ManageSlotsModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  onSuccess: () => void
}

const recalcSummary = (slots: Slot[]): SlotData["summary"] => {
  const byStatus = {
    available: 0,
    booked: 0,
    blocked: 0,
    breaks: 0,
    modified: 0,
    holiday: 0,
    dual_status: 0,
  }
  const bySource = {
    template: 0,
    database: 0,
  }
  let modifications = 0

  slots.forEach((slot) => {
    const statuses = slot.status || []

    if (statuses.includes("BOOKED")) {
      byStatus.booked += 1
    } else if (statuses.includes("BLOCKED")) {
      byStatus.blocked += 1
    } else if (statuses.includes("BREAK")) {
      byStatus.breaks += 1
    } else if (statuses.includes("HOLIDAY")) {
      byStatus.holiday += 1
    } else if (statuses.includes("MODIFIED")) {
      byStatus.modified += 1
    } else {
      byStatus.available += 1
    }

    if (statuses.length > 1) {
      byStatus.dual_status += 1
    }

    if (slot.source === "TEMPLATE") {
      bySource.template += 1
    } else {
      bySource.database += 1
    }

    if (slot.modification_reason || slot.modification_type) {
      modifications += 1
    }
  })

  return {
    total_slots: slots.length,
    by_status: byStatus,
    by_source: bySource,
    modifications,
  }
}

const slotsMatch = (slot: Slot, identifier: { id?: string; time: string }) => {
  if (slot.id && identifier.id) {
    return slot.id === identifier.id
  }
  return slot.time === identifier.time
}

const getQueryErrorMessage = (error: FetchBaseQueryError | SerializedError | undefined): string => {
  if (!error) return ""

  if ("status" in error) {
    const data = (error as FetchBaseQueryError).data as { message?: unknown }
    return normalizeApiMessage(data?.message, "Failed to load slots. Please try again.")
  }

  return (error as SerializedError).message || "Something went wrong. Please try again."
}

const getMutationErrorMessage = (error: unknown): string => {
  if (!error) return "Operation failed. Please try again."
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null) {
    const data = (error as { data?: { message?: unknown }; message?: unknown }).data
    if (data?.message) return normalizeApiMessage(data.message, "Operation failed. Please try again.")

    const directMessage = (error as { message?: unknown }).message
    if (directMessage) return normalizeApiMessage(directMessage, "Operation failed. Please try again.")
  }
  return "Operation failed. Please try again."
}

const normalizeApiMessage = (raw: unknown, fallback: string): string => {
  if (!raw) return fallback
  if (typeof raw === "string") return raw
  if (typeof raw === "object" && raw !== null && "message" in raw && typeof (raw as { message?: string }).message === "string") {
    return (raw as { message?: string }).message as string
  }
  return fallback
}

/**
 * Manage Slots Modal with Redux-backed cache updates to prevent full reloads.
 */
export default function ManageSlotsModal({ isOpen, onClose, date, onSuccess }: ManageSlotsModalProps) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [actionError, setActionError] = useState("")


  const {
    data: slotResponse,
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
    error: slotQueryError,
    refetch: refetchSlots,
  } = useGetSlotDetailsQuery(date, { skip: !isOpen })

  const safeRefetchSlots = () => {
    // RTK Query throws if refetch called when the query was never started (skip=true)
    if (!isOpen) return
    refetchSlots()
  }

  const slotData = slotResponse?.success ? (slotResponse.data as SlotData) : null
  const responseError =
    slotResponse && !slotResponse.success
      ? normalizeApiMessage(slotResponse.message, "Failed to load slots")
      : ""
  const fetchErrorMessage = getQueryErrorMessage(slotQueryError as FetchBaseQueryError | SerializedError | undefined)
  const displayError = actionError || responseError || fetchErrorMessage

  const [bulkSlotOperation, { isLoading: isBulkLoading }] = useBulkSlotOperationMutation()

  const actionLoading = isBulkLoading

  const updateSlotsCache = (updateFn: (draft: ApiResponse<SlotData>) => void) => {
    dispatch(
      scheduleApi.util.updateQueryData("getSlotDetails", date, (draft: ApiResponse<SlotData>) => {
        if (!draft.data) return
        updateFn(draft)
        draft.data.summary = recalcSummary(draft.data.slots)
      }),
    )
  }


  const handleToggleBlock = async (slot: Slot) => {
    if (!slot.time) {
      setActionError("Invalid slot time")
      return
    }

    if (slot.status?.includes("BOOKED")) {
      setActionError("Cannot modify booked slots")
      return
    }

    const timeParts = slot.time.split("-")
    const startTime = timeParts[0]
    const endTime = timeParts[1]

    if (!startTime || !endTime) {
      setActionError("Invalid slot time format")
      return
    }

    const isBlocked = slot.status?.includes("BLOCKED") || false
    const action = isBlocked ? "UNBLOCK" : "BLOCK"

    try {
      setActionError("")

      const response = await bulkSlotOperation({
        start_date: date,
        end_date: date,
        start_time: startTime,
        end_time: endTime,
        action,
        reason: `${action.toLowerCase()} slot via manage slots modal`,
      }).unwrap()

      if (response.success) {
        updateSlotsCache((draft) => {
          const target = draft.data?.slots.find((s) => slotsMatch(s, slot))
          if (!target) return

          if (action === "BLOCK") {
            target.status = ["BLOCKED"]
            target.description = slot.description || "Manually blocked slot"
          } else {
            const cleanedStatus = target.status.filter((status) => status !== "BLOCKED")
            target.status = cleanedStatus.length > 0 ? cleanedStatus : ["AVAILABLE"]
          }
        })

        const successMessage = normalizeApiMessage(
          (response as { message?: unknown }).message,
          `Successfully ${action === "BLOCK" ? "blocked" : "unblocked"} slot`,
        )
        toast({
          title: action === "BLOCK" ? "Slot blocked" : "Slot unblocked",
          description: successMessage,
        })
      } else {
        const message = normalizeApiMessage(
          response.message,
          `Failed to ${action.toLowerCase()} slot`,
        )
        setActionError(message)
        toast({
          title: `Cannot ${action.toLowerCase()} slot`,
          description: message,
          variant: "destructive",
        })
      }
    } catch (error) {
      const message = getMutationErrorMessage(error)
      console.error(`Error ${action.toLowerCase()}ing slot: ${message}`, error)
      setActionError(message)
      toast({
        title: `Failed to ${action.toLowerCase()} slot`,
        description: message,
        variant: "destructive",
      })
    }
  }

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return "--:--"
    try {
      const [hours, minutes] = time.split(":").map(Number)
      if (isNaN(hours) || isNaN(minutes)) return "--:--"
      const period = hours >= 12 ? "PM" : "AM"
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`
    } catch (error) {
      return "--:--"
    }
  }

  const getStatusBadge = (status: string[] | null | undefined) => {
    if (!status || status.length === 0) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Unknown
        </Badge>
      )
    }
    const primaryStatus = status[0]
    switch (primaryStatus) {
      case "AVAILABLE":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Available
          </Badge>
        )
      case "BOOKED":
        return <Badge variant="destructive">Booked</Badge>
      case "BLOCKED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Blocked
          </Badge>
        )
      case "BREAK":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Break
          </Badge>
        )
      case "MODIFIED":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Modified
          </Badge>
        )
      default:
        return <Badge variant="outline">{primaryStatus}</Badge>
    }
  }


  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="border-b bg-gradient-to-r from-gray-50 to-white px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  Manage Slots
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {slotData && (
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Working Hours:</span>
                      <span className="font-medium text-gray-900">
                        {formatTime(slotData.working_hours?.start)} - {formatTime(slotData.working_hours?.end)}
                      </span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Total Slots:</span>
                      <span className="font-semibold text-gray-900">{slotData.summary.total_slots}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Available:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {slotData.summary.by_status.available}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Booked:</span>
                      <Badge variant="destructive">
                        {slotData.summary.by_status.booked}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Blocked:</span>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {slotData.summary.by_status.blocked}
                      </Badge>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Breaks:</span>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        {slotData.summary.by_status.breaks}
                      </Badge>
                    </div>
                  </div>
                )}
                {isSlotsFetching && !isSlotsLoading && (
                  <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                    <span className="animate-spin">⟳</span>
                    Refreshing slots…
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                disabled={actionLoading}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {displayError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            {isSlotsLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading slots...</p>
              </div>
            )}

            {!isSlotsLoading && slotData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Time Slots</h3>
                  <span className="text-sm text-gray-500">
                    {slotData.slots.length} {slotData.slots.length === 1 ? 'slot' : 'slots'}
                  </span>
                </div>

                {slotData.slots.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 font-medium">No slots found for this date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slotData.slots.map((slot, index) => {
                      const timeParts = slot.time?.split("-") || []
                      const startTime = timeParts[0] || null
                      const endTime = timeParts[1] || null
                      const isBlocked = slot.status?.includes("BLOCKED") || false
                      const isBooked = slot.status?.includes("BOOKED") || false
                      const isBreak = slot.status?.includes("BREAK") || false
                      
                      return (
                        <div
                          key={slot.id || `slot-${index}`}
                          className={`group relative p-4 border rounded-lg transition-all duration-200 ${
                            isBlocked 
                              ? 'bg-red-50 border-red-200 hover:border-red-300' 
                              : isBooked
                              ? 'bg-orange-50 border-orange-200 hover:border-orange-300'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="font-semibold text-gray-900 text-base">
                                  {formatTime(startTime)} - {formatTime(endTime)}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {getStatusBadge(slot.status)}
                              </div>

                              {slot.description && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-1">
                                  {slot.description}
                                </p>
                              )}
                              
                              {slot.modification_reason && (
                                <p className="text-xs text-blue-600 mt-1 line-clamp-1">
                                  <span className="font-medium">Reason:</span> {slot.modification_reason}
                                </p>
                              )}
                            </div>

                            <div className="flex-shrink-0">
                              <Button
                                variant={isBlocked ? "destructive" : "outline"}
                                size="sm"
                                className={`cursor-pointer transition-all ${
                                  isBlocked 
                                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleToggleBlock(slot)}
                                disabled={isBooked || isBreak || actionLoading}
                                title={
                                  isBooked
                                    ? "Cannot modify booked slots"
                                    : isBreak
                                    ? "Cannot modify break slots"
                                    : isBlocked
                                    ? "Unblock slot"
                                    : "Block slot"
                                }
                              >
                                {isBlocked ? (
                                  <Lock className="w-4 h-4" />
                                ) : (
                                  <Unlock className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={actionLoading}
                className="min-w-[100px]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
