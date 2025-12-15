"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Calendar, AlertTriangle } from "lucide-react"
import { apiClient } from "../../../../../../rtk/api/garage/api"

interface BulkModifyModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  onSuccess: () => void
}

/**
 * Bulk Modify Modal
 *
 * Handles bulk slot operations including blocking and unblocking
 * slots across date ranges with time range specifications. Provides advanced
 * filtering options and conflict resolution.
 *
 * Features:
 * - Date range selection for bulk operations
 * - Time range specification
 * - Operation type selection (block, unblock)
 * - Reason tracking for audit purposes
 * - Preview of affected slots
 */
export default function BulkModifyModal({ isOpen, onClose, date, onSuccess }: BulkModifyModalProps) {
  // Form state
  const [operation, setOperation] = useState<"BLOCK" | "UNBLOCK">("BLOCK")
  const [startDate, setStartDate] = useState(date)
  const [endDate, setEndDate] = useState(date)
  const [startTime, setStartTime] = useState("12:00")
  const [endTime, setEndTime] = useState("13:00")
  const [reason, setReason] = useState("")

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<any>(null)

  /**
   * Validate form inputs
   */
  const validateForm = (): string | null => {
    if (!startDate || !endDate) {
      return "Please select both start and end dates"
    }

    if (startDate > endDate) {
      return "End date must be after or equal to start date"
    }

    if (!startTime || !endTime) {
      return "Please set both start and end times"
    }

    if (startTime >= endTime) {
      return "End time must be after start time"
    }

    return null
  }

  /**
   * Generate preview of bulk operation
   */
  const generatePreview = () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    setPreview({
      dateRange: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      timeRange: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      daysAffected: daysDiff,
      operation: operation.toLowerCase(),
    })

    setError("")
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

    if (!preview) {
      setError("Please generate a preview first")
      return
    }

    const confirmMessage = `Are you sure you want to ${operation.toLowerCase()} slots from ${formatTime(startTime)} to ${formatTime(endTime)} for ${preview.daysAffected} day(s)?`

    if (!confirm(confirmMessage)) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const request = {
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        action: operation,
        reason: reason.trim() || undefined,
      }

      const response = await apiClient.bulkSlotOperation(request)

      if (response.success) {
        onSuccess()
      } else {
        const message =
          typeof response.message === "string"
            ? response.message
            : (response as any)?.message?.message || "Failed to perform bulk operation"
        setError(message)
      }
    } catch (error) {
      console.error("[v0] Error performing bulk operation:", error)
      setError("Failed to perform bulk operation. Please try again.")
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

  /**
   * Get operation badge
   */
  const getOperationBadge = (op: string) => {
    switch (op) {
      case "BLOCK":
        return <Badge className="bg-red-100 text-red-800">Block</Badge>
      case "UNBLOCK":
        return <Badge className="bg-green-100 text-green-800">Unblock</Badge>
      default:
        return <Badge variant="outline">{op}</Badge>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Bulk Slot Operations
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Perform operations on multiple slots across date and time ranges
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Operation Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Operation Type</label>
                <div className="flex gap-3">
                  {(["BLOCK", "UNBLOCK"] as const).map((op) => (
                    <Button
                      key={op}
                      type="button"
                      variant={operation === op ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOperation(op)}
                      disabled={loading}
                    >
                      {getOperationBadge(op)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Time Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for bulk operation..."
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Preview Button */}
              <div className="flex justify-center">
                <Button type="button" variant="outline" onClick={generatePreview} disabled={loading}>
                  Generate Preview
                </Button>
              </div>

              {/* Preview Display */}
              {preview && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Operation Preview</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Operation:</span>
                      {getOperationBadge(operation)}
                    </div>
                    <div>
                      <span className="font-medium">Date Range:</span> {preview.dateRange}
                    </div>
                    <div>
                      <span className="font-medium">Time Range:</span> {preview.timeRange}
                    </div>
                    <div>
                      <span className="font-medium">Days Affected:</span> {preview.daysAffected}
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
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !preview}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    `Execute ${operation.toLowerCase()} Operation`
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
