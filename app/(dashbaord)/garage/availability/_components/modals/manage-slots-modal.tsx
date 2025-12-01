"use client"
import { useState, useEffect } from "react"
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
import { apiClient } from "../../../../../../rtk/api/garage/api"
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

// Shape expected by ModifySlotModal
interface SelectedSlotForModify {
  id: string
  start_time: string
  end_time: string
  status: "AVAILABLE" | "BOOKED" | "BLOCKED"
  source: "DATABASE" | "TEMPLATE"
}

/**
 * Manage Slots Modal
 *
 * Main slot management interface for a specific date. Provides comprehensive
 * slot operations including modify, block, unblock, delete individual slots,
 * and bulk operations for all manual slots.
 *
 * Features:
 * - View all slots for selected date via API
 * - Individual slot operations (modify, block, unblock, delete)
 * - Bulk operations (remove all manual slots)
 * - Real-time slot status updates
 * - Booking protection (cannot modify booked slots)
 * - Template vs manual slot distinction
 */
export default function ManageSlotsModal({ isOpen, onClose, date, onSuccess }: ManageSlotsModalProps) {
  // Slot data state
  const [slotData, setSlotData] = useState<SlotData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Modal state
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotForModify | null>(null)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)
  const [manualSlotsCount, setManualSlotsCount] = useState(0)
  const [bookedSlotsCount, setBookedSlotsCount] = useState(0)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [slotToClear, setSlotToClear] = useState<Slot | null>(null)

  /**
   * Load slots for the selected date
   * Calls the actual API endpoint to get slot data
   */
  const loadSlots = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await apiClient.getSlotDetails(date)

      if (response.success && response.data) {
        setSlotData(response.data)
      } else {
        setError(response.message || "Failed to load slots")
      }
    } catch (error) {
      console.error("Error loading slots:", error)
      setError("Failed to load slots. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle individual slot deletion
   */
  const handleDeleteSlot = async (slotId: string) => {
    if (!slotId) {
      setError("Cannot delete template slots - no ID available")
      return
    }

    const slot = slotData?.slots.find((s) => s.id === slotId)
    if (!slot) return

    if (slot.status.includes("BOOKED")) {
      setError("Cannot delete booked slots")
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await apiClient.deleteSlot(slotId)

      if (response.success) {
        await loadSlots() // Refresh slots (keep modal open)
        const [s, e] = slot.time.split("-")
        toast({ title: "Cleared slot", description: `${formatTime(s)} - ${formatTime(e)} cleared successfully.` })
      } else {
        setError(response.message || "Failed to delete slot")
        toast({ title: "Failed to clear slot", description: response.message || "Please try again.", variant: "destructive" })
      }
    } catch (error) {
      console.error(" Error deleting slot:", error)
      setError("Failed to delete slot. Please try again.")
      toast({ title: "Error", description: "Failed to clear slot. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
      setShowConfirmClear(false)
      setSlotToClear(null)
    }
  }

  /**
   * Handle slot blocking/unblocking
   */
  const handleToggleBlock = async (slot: Slot) => {
    if (slot.status.includes("BOOKED")) {
      setError("Cannot modify booked slots")
      return
    }

    const [startTime, endTime] = slot.time.split("-")
    const isBlocked = slot.status.includes("BLOCKED")
    const action = isBlocked ? "UNBLOCK" : "BLOCK"

    try {
      setLoading(true)
      setError("")

      const response = await apiClient.bulkSlotOperation({
        start_date: date,
        end_date: date,
        start_time: startTime,
        end_time: endTime,
        action: action,
        reason: `${action.toLowerCase()} slot via manage slots modal`,
      })

      if (response.success) {
        await loadSlots() // Refresh slots (keep modal open)
      } else {
        setError(response.message || `Failed to ${action.toLowerCase()} slot`)
      }
    } catch (error) {
      console.error(` Error ${action.toLowerCase()}ing slot:`, error)
      setError(`Failed to ${action.toLowerCase()} slot. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle remove all manual slots
   */
  const handleRemoveAllManual = async () => {
    if (!slotData) return

    const manualSlots = slotData.slots.filter((slot) => slot.source === "DATABASE" && !slot.status.includes("BOOKED"))

    if (manualSlots.length === 0) {
      setError("No manual slots to remove")
      toast({ title: "Nothing to remove", description: "No removable manual slots for this date." })
      setShowConfirmRemove(false)
      return
    }

    try {
      setLoading(true)
      setError("")

      const response = await apiClient.removeAllManualSlots(date)

      if (response.success) {
        await loadSlots() // Refresh slots (keep modal open)
        toast({
          title: "Removed manual slots",
          description: `${manualSlots.length} manual slots removed for ${new Date(date).toLocaleDateString()}.`,
        })
      } else {
        setError(response.message || "Failed to remove manual slots")
        toast({ title: "Failed to remove manual slots", description: response.message || "Please try again.", variant: "destructive" })
      }
    } catch (error) {
      console.error(" Error removing manual slots:", error)
      setError("Failed to remove manual slots. Please try again.")
      toast({ title: "Error", description: "Failed to remove manual slots. Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
      setShowConfirmRemove(false)
    }
  }

  /**
   * Format time to display format
   */
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`
  }

  /**
   * Get status badge variant
   */
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

  /**
   * Get source badge
   */
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

  // Load slots when modal opens
  useEffect(() => {
    if (isOpen && date) {
      loadSlots()
    }
  }, [isOpen, date])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                        Working Hours: {formatTime(slotData.working_hours.start)} -{" "}
                        {formatTime(slotData.working_hours.end)}
                      </span>
                      <span>Total Slots: {slotData.summary.total_slots}</span>
                      <span>Modifications: {slotData.summary.modifications}</span>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading slots...</p>
                </div>
              )}

              {/* Slots List */}
              {!loading && slotData && (
                <div className="space-y-6">
                  {/* Bulk Actions */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Bulk Operations</h3>
                      <p className="text-sm text-gray-600">Perform operations on multiple slots</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowBulkModal(true)} disabled={loading}>
                        Bulk Modify
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (!slotData) return
                          const manualSlots = slotData.slots.filter(
                            (slot) => slot.source === "DATABASE" && !slot.status.includes("BOOKED"),
                          )
                          const bookedSlots = slotData.slots.filter((slot) => slot.status.includes("BOOKED"))
                          setManualSlotsCount(manualSlots.length)
                          setBookedSlotsCount(bookedSlots.length)
                          setShowConfirmRemove(true)
                        }}
                        disabled={loading}
                      >
                        Remove All Manual
                      </Button>
                    </div>
                  </div>

                  {/* Individual Slots */}
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
                                {/* Modify Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const [startTime, endTime] = slot.time.split("-")
                                    const status: "AVAILABLE" | "BOOKED" | "BLOCKED" = slot.status.includes("BOOKED")
                                      ? "BOOKED"
                                      : slot.status.includes("BLOCKED")
                                        ? "BLOCKED"
                                        : "AVAILABLE"
                                    setSelectedSlot({
                                      id: slot.id as string,
                                      start_time: startTime,
                                      end_time: endTime,
                                      status,
                                      source: slot.source,
                                    })
                                    setShowModifyModal(true)
                                  }}
                                  disabled={slot.status.includes("BOOKED") || !slot.id || loading}
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

                                {/* Block/Unblock Button */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleBlock(slot)}
                                  disabled={slot.status.includes("BOOKED") || slot.status.includes("BREAK") || loading}
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

                                {/* Clear Button */}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    if (!slot.id) return
                                    setSlotToClear(slot)
                                    setShowConfirmClear(true)
                                  }}
                                  disabled={
                                    slot.status.includes("BOOKED") || slot.source === "TEMPLATE" || !slot.id || loading
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

              {/* Close Button */}
              <div className="flex justify-end pt-6 border-t mt-6">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modify Slot Modal */}
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
            loadSlots()
            onSuccess()
          }}
        />
      )}

      {/* Bulk Modify Modal */}
      {showBulkModal && (
        <BulkModifyModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          date={date}
          onSuccess={() => {
            setShowBulkModal(false)
            loadSlots()
            onSuccess()
          }}
        />
      )}

      {/* Confirm Remove All Manual */}
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
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAllManual} disabled={loading}>
              {loading ? "Removing..." : "Yes, remove all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Clear Single Slot */}
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
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => slotToClear?.id && handleDeleteSlot(slotToClear.id)}
              disabled={loading}
            >
              {loading ? "Clearing..." : "Yes, clear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
