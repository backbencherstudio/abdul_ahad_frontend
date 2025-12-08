"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { X, Edit, Trash2, Lock, Unlock, AlertTriangle, Eraser } from "lucide-react"
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
  garageAvailabilityApi,
  useBulkSlotOperationMutation,
  useDeleteSlotMutation,
  useGetSlotDetailsQuery,
  useRemoveAllManualSlotsMutation,
} from "../../../../../../rtk/api/garage/api"
import ModifySlotModal from "./modify-slot-modal"
import BulkModifyModal from "./bulk-modify-modal"

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

interface SelectedSlotForModify {
  id: string
  start_time: string
  end_time: string
  status: "AVAILABLE" | "BOOKED" | "BLOCKED"
  source: "DATABASE" | "TEMPLATE"
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

  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotForModify | null>(null)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [slotToClear, setSlotToClear] = useState<Slot | null>(null)

  const {
    data: slotResponse,
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
    error: slotQueryError,
    refetch: refetchSlots,
  } = useGetSlotDetailsQuery(date, { skip: !isOpen })

  const slotData = slotResponse?.success ? (slotResponse.data as SlotData) : null
  const responseError =
    slotResponse && !slotResponse.success
      ? normalizeApiMessage(slotResponse.message, "Failed to load slots")
      : ""
  const fetchErrorMessage = getQueryErrorMessage(slotQueryError as FetchBaseQueryError | SerializedError | undefined)
  const displayError = actionError || responseError || fetchErrorMessage

  const [bulkSlotOperation, { isLoading: isBulkLoading }] = useBulkSlotOperationMutation()
  const [deleteSlotMutation, { isLoading: isDeleteLoading }] = useDeleteSlotMutation()
  const [removeManualSlotsMutation, { isLoading: isRemoveManualLoading }] = useRemoveAllManualSlotsMutation()

  const actionLoading = isBulkLoading || isDeleteLoading || isRemoveManualLoading

  const updateSlotsCache = (updateFn: (draft: ApiResponse<SlotData>) => void) => {
    dispatch(
      garageAvailabilityApi.util.updateQueryData("getSlotDetails", date, (draft: ApiResponse<SlotData>) => {
        if (!draft.data) return
        updateFn(draft)
        draft.data.summary = recalcSummary(draft.data.slots)
      }),
    )
  }

  const handleDeleteSlot = async (slot: Slot) => {
    if (!slot.id) {
      setActionError("Cannot delete template slots - no ID available")
      return
    }

    if (slot.status.includes("BOOKED")) {
      setActionError("Cannot delete booked slots")
      return
    }

    try {
      setActionError("")
      const response = await deleteSlotMutation(slot.id).unwrap()

      if (response.success) {
        updateSlotsCache((draft) => {
          if (!draft.data) return
          draft.data.slots = draft.data.slots.filter((s) => !slotsMatch(s, slot))
        })

        const [s, e] = slot.time.split("-")
        toast({ title: "Cleared slot", description: `${formatTime(s)} - ${formatTime(e)} cleared successfully.` })
        onSuccess()
      } else {
        const message = normalizeApiMessage(response.message, "Failed to delete slot")
        setActionError(message)
        toast({ title: "Failed to clear slot", description: message, variant: "destructive" })
      }
    } catch (error) {
      const message = getMutationErrorMessage(error)
      setActionError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setShowConfirmClear(false)
      setSlotToClear(null)
    }
  }

  const handleToggleBlock = async (slot: Slot) => {
    if (slot.status.includes("BOOKED")) {
      setActionError("Cannot modify booked slots")
      return
    }

    const [startTime, endTime] = slot.time.split("-")
    const isBlocked = slot.status.includes("BLOCKED")
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
      console.error(` Error ${action.toLowerCase()}ing slot:`, error)
      const message = getMutationErrorMessage(error)
      setActionError(message)
      toast({
        title: `Failed to ${action.toLowerCase()} slot`,
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleRemoveAllManual = async () => {
    if (!slotData) return

    const manualSlots = slotData.slots.filter((slot) => slot.source === "DATABASE" && !slot.status.includes("BOOKED"))

    if (manualSlots.length === 0) {
      setActionError("No manual slots to remove")
      toast({ title: "Nothing to remove", description: "No removable manual slots for this date." })
      setShowConfirmRemove(false)
      return
    }

    try {
      setActionError("")

      const response = await removeManualSlotsMutation(date).unwrap()

      if (response.success) {
        updateSlotsCache((draft) => {
          if (!draft.data) return
          draft.data.slots = draft.data.slots.filter(
            (slot) => !(slot.source === "DATABASE" && !slot.status.includes("BOOKED")),
          )
        })
        toast({
          title: "Removed manual slots",
          description: `${manualSlots.length} manual slots removed for ${new Date(date).toLocaleDateString()}.`,
        })
        onSuccess()
      } else {
        const message = normalizeApiMessage(response.message, "Failed to remove manual slots")
        setActionError(message)
        toast({ title: "Failed to remove manual slots", description: message, variant: "destructive" })
      }
    } catch (error) {
      console.error(" Error removing manual slots:", error)
      const message = getMutationErrorMessage(error)
      setActionError(message)
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setShowConfirmRemove(false)
    }
  }

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`
  }

  const getStatusBadge = (status: string[]) => {
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

  const getSourceBadge = (source: string) => {
    return source === "TEMPLATE" ? (
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
        Template
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
        Manual
      </Badge>
    )
  }

  if (!isOpen) return null

  const manualSlots =
    slotData?.slots.filter((slot) => slot.source === "DATABASE" && !slot.status.includes("BOOKED")) || []
  const manualSlotsCount = manualSlots.length
  const bookedSlotsCount = slotData?.slots.filter((slot) => slot.status.includes("BOOKED")).length || 0

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4">
          <Card className="border-0 shadow-none">
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Manage Slots - {new Date(date).toLocaleDateString()}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Modify, block, unblock, or delete individual slots for this date
                  </CardDescription>
                  {slotData && (
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        Working Hours: {formatTime(slotData.working_hours.start)} - {formatTime(slotData.working_hours.end)}
                      </span>
                      <span>Total Slots: {slotData.summary.total_slots}</span>
                      <span>Modifications: {slotData.summary.modifications}</span>
                    </div>
                  )}
                  {isSlotsFetching && !isSlotsLoading && (
                    <p className="text-xs text-blue-600 mt-2">Refreshing slots…</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} disabled={actionLoading}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {displayError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{displayError}</AlertDescription>
                </Alert>
              )}

              {isSlotsLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading slots...</p>
                </div>
              )}

              {!isSlotsLoading && slotData && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Bulk Operations</h3>
                      <p className="text-sm text-gray-600">Perform operations on multiple slots</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowBulkModal(true)} disabled={actionLoading}>
                        Bulk Modify
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (!slotData) return
                          setShowConfirmRemove(true)
                        }}
                        disabled={actionLoading}
                      >
                        Remove All Manual
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Individual Slots</h3>

                    {slotData.slots.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No slots found for this date</div>
                    ) : (
                      <div className="space-y-2">
                        {slotData.slots.map((slot, index) => {
                          const [startTime, endTime] = slot.time.split("-")
                          return (
                            <div
                              key={slot.id || `slot-${index}`}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {formatTime(startTime)} - {formatTime(endTime)}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(slot.status)}
                                    {getSourceBadge(slot.source)}
                                  </div>
                                  {slot.description && (
                                    <div className="text-xs text-gray-500 mt-1">{slot.description}</div>
                                  )}
                                  {slot.modification_reason && (
                                    <div className="text-xs text-blue-600 mt-1">Reason: {slot.modification_reason}</div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const [start, end] = slot.time.split("-")
                                    const status: "AVAILABLE" | "BOOKED" | "BLOCKED" = slot.status.includes("BOOKED")
                                      ? "BOOKED"
                                      : slot.status.includes("BLOCKED")
                                        ? "BLOCKED"
                                        : "AVAILABLE"
                                    setSelectedSlot({
                                      id: slot.id as string,
                                      start_time: start,
                                      end_time: end,
                                      status,
                                      source: slot.source,
                                    })
                                    setShowModifyModal(true)
                                  }}
                                  disabled={slot.status.includes("BOOKED") || !slot.id || actionLoading}
                                  title={
                                    slot.status.includes("BOOKED")
                                      ? "Cannot modify booked slots"
                                      : !slot.id
                                        ? "Cannot modify template slots"
                                        : "Modify slot time"
                                  }
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleBlock(slot)}
                                  disabled={
                                    slot.status.includes("BOOKED") ||
                                    slot.status.includes("BREAK") ||
                                    actionLoading
                                  }
                                  title={
                                    slot.status.includes("BOOKED")
                                      ? "Cannot modify booked slots"
                                      : slot.status.includes("BREAK")
                                        ? "Cannot modify break slots"
                                        : slot.status.includes("BLOCKED")
                                          ? "Unblock slot"
                                          : "Block slot"
                                  }
                                >
                                  {slot.status.includes("BLOCKED") ? (
                                    <Lock className="w-4 h-4" />
                                  ) : (
                                    <Unlock className="w-4 h-4" />
                                  )}
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (!slot.id) return
                                    setSlotToClear(slot)
                                    setShowConfirmClear(true)
                                  }}
                                  disabled={
                                    slot.status.includes("BOOKED") ||
                                    slot.source === "TEMPLATE" ||
                                    !slot.id ||
                                    actionLoading
                                  }
                                  title={
                                    slot.status.includes("BOOKED")
                                      ? "Cannot clear booked slots"
                                      : slot.source === "TEMPLATE" || !slot.id
                                        ? "Cannot clear template slots"
                                        : "Clear"
                                  }
                                >
                                  <Eraser className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t mt-6">
                <Button variant="outline" onClick={onClose} disabled={actionLoading}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showModifyModal && selectedSlot && (
        <ModifySlotModal
          isOpen={showModifyModal}
          onClose={() => {
            setShowModifyModal(false)
            setSelectedSlot(null)
          }}
          slot={selectedSlot}
          date={date}
          onSuccess={() => {
            setShowModifyModal(false)
            setSelectedSlot(null)
            refetchSlots()
            onSuccess()
          }}
        />
      )}

      {showBulkModal && (
        <BulkModifyModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          date={date}
          onSuccess={() => {
            setShowBulkModal(false)
            refetchSlots()
            onSuccess()
          }}
        />
      )}

      <AlertDialog open={showConfirmRemove} onOpenChange={setShowConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove all manual slots?</AlertDialogTitle>
            <AlertDialogDescription>
              {manualSlotsCount > 0
                ? `This will remove ${manualSlotsCount} manual slots${
                    bookedSlotsCount > 0 ? `; ${bookedSlotsCount} booked slots will remain.` : "."
                  }`
                : "There are no removable manual slots for this date."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAllManual} disabled={actionLoading}>
              {actionLoading ? "Removing..." : "Yes, remove all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this slot?</AlertDialogTitle>
            <AlertDialogDescription>
              {slotToClear
                ? (() => {
                    const [s, e] = slotToClear.time.split("-")
                    return `${formatTime(s)} - ${formatTime(e)} will be cleared. This cannot be undone.`
                  })()
                : "Are you sure you want to clear this slot?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => slotToClear && handleDeleteSlot(slotToClear)}
              disabled={actionLoading}
            >
              {actionLoading ? "Clearing..." : "Yes, clear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
