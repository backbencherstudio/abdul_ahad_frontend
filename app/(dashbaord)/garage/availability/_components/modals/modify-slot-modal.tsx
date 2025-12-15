"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { X, Clock, AlertTriangle } from "lucide-react"
import { apiClient, type SlotModifyRequest } from "../../../../../../rtk/api/garage/api"

interface Slot {
  id: string
  start_time: string
  end_time: string
  status: "AVAILABLE" | "BOOKED" | "BLOCKED"
  source: "DATABASE" | "TEMPLATE"
}

interface ModifySlotModalProps {
  isOpen: boolean
  onClose: () => void
  slot: Slot
  date: string
  onSuccess: () => void
}

/**
 * Modify Slot Modal
 *
 * Handles individual slot time modification with intelligent overlap detection
 * and conflict resolution. Provides user-friendly interface for changing slot
 * start and end times with proper validation and error handling.
 *
 * Features:
 * - Time modification with validation
 * - Overlap detection and conflict resolution
 * - Reason tracking for modifications
 * - Confirmation dialogs for destructive actions
 * - Real-time validation feedback
 */
export default function ModifySlotModal({ isOpen, onClose, slot, date, onSuccess }: ModifySlotModalProps) {
  // Form state
  const [newStartTime, setNewStartTime] = useState(slot.start_time)
  const [newEndTime, setNewEndTime] = useState(slot.end_time)
  const [reason, setReason] = useState("")
  const [allowOverlap, setAllowOverlap] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const [affectedSlots, setAffectedSlots] = useState<any[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)

  /**
   * Validate form inputs
   */
  const validateForm = (): string | null => {
    if (!newStartTime || !newEndTime) {
      return "Please set both start and end times"
    }

    if (newStartTime >= newEndTime) {
      return "End time must be after start time"
    }

    if (newStartTime === slot.start_time && newEndTime === slot.end_time) {
      return "Please change at least one time to modify the slot"
    }

    return null
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
    setWarning("")

    try {
      const request: SlotModifyRequest = {
        date,
        current_time: slot.start_time,
        new_start_time: newStartTime,
        new_end_time: newEndTime,
        reason: reason.trim() || undefined,
        overlap: allowOverlap,
      }

      const response = await apiClient.modifySlotTime(request)

      if (response.success) {
        onSuccess()
      } else {
        // Check if this is a warning about overlaps
        if ((response as any)?.data?.warning && (response as any)?.data?.affected_slots) {
          setWarning((response as any).data.warning)
          setAffectedSlots((response as any).data.affected_slots)
          setShowConfirmation(true)
        } else {
          setError(response.message || "Failed to modify slot")
        }
      }
    } catch (error) {
      console.error("[v0] Error modifying slot:", error)
      setError("Failed to modify slot. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle confirmation of overlap resolution
   */
  const handleConfirmOverlap = async () => {
    setAllowOverlap(true)
    setShowConfirmation(false)

    // Resubmit with overlap allowed
    const request: SlotModifyRequest = {
      date,
      current_time: slot.start_time,
      new_start_time: newStartTime,
      new_end_time: newEndTime,
      reason: reason.trim() || undefined,
      overlap: true,
    }

    setLoading(true)
    try {
      const response = await apiClient.modifySlotTime(request)

      if (response.success) {
        onSuccess()
      } else {
        setError(response.message || "Failed to modify slot")
      }
    } catch (error) {
      console.error("[v0] Error modifying slot with overlap:", error)
      setError("Failed to modify slot. Please try again.")
    } finally {
      setLoading(false)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-full max-w-md">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Modify Slot Time
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Change the start and end time for this slot
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Current Slot Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Current Slot</h4>
              <p className="text-sm text-gray-600">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Date: {new Date(date).toLocaleDateString()}</p>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && (
              <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="text-yellow-800">{warning}</p>

                    {affectedSlots.length > 0 && (
                      <div>
                        <p className="font-medium text-yellow-800 mb-2">Affected slots:</p>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {affectedSlots.map((affectedSlot, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span>• {affectedSlot.time}</span>
                              <span className="text-xs bg-yellow-200 px-2 py-1 rounded">{affectedSlot.source}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => setShowConfirmation(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleConfirmOverlap} className="bg-yellow-600 hover:bg-yellow-700">
                        Proceed Anyway
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Time Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Start Time</label>
                  <Input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New End Time</label>
                  <Input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Change (Optional)</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for modification..."
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Preview */}
              {(newStartTime !== slot.start_time || newEndTime !== slot.end_time) && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Preview Changes</h4>
                  <div className="text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <span className="line-through text-gray-500">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                      <span>→</span>
                      <span className="font-medium">
                        {formatTime(newStartTime)} - {formatTime(newEndTime)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Modifying...
                    </div>
                  ) : (
                    "Modify Slot"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
