"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon, Wrench, Trash2, Plus, Loader2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import {
  useGetHolidaysQuery,
  useAddHolidayMutation,
  useDeleteHolidayMutation,
  Holiday,
} from '../../../../../rtk/api/garage/scheduleApis'
import { useToast } from '@/hooks/use-toast'
import ConfirmationModal from '@/components/reusable/ConfirmationModal'

interface ManageHolidaysModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ManageHolidaysModal({
  isOpen,
  onClose,
  onSuccess,
}: ManageHolidaysModalProps) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState<string>('')
  const [localHolidays, setLocalHolidays] = useState<Holiday[]>([])
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(null)

  // Fetch holidays from API
  const {
    data: holidaysResponse,
    isLoading: isLoadingHolidays,
    refetch: refetchHolidays,
  } = useGetHolidaysQuery(undefined, {
    skip: !isOpen,
  })

  const [addHoliday, { isLoading: isAdding }] = useAddHolidayMutation()
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation()

  // Update local holidays when API data changes
  useEffect(() => {
    if (holidaysResponse?.success && holidaysResponse.data) {
      // Transform API data to include date string for display and unique key
      const transformedHolidays = holidaysResponse.data.map((holiday, index) => {
        const currentYear = new Date().getFullYear()
        const date = new Date(currentYear, holiday.month - 1, holiday.day)
        return {
          ...holiday,
          date: format(date, 'yyyy-MM-dd'),
          id: `holiday-${holiday.month}-${holiday.day}-${index}`, 
        }
      })
      setLocalHolidays(transformedHolidays)
    } else if (holidaysResponse && !holidaysResponse.success) {
      setLocalHolidays([])
    }
  }, [holidaysResponse])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined)
      setDescription('')
    }
  }, [isOpen])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return format(date, 'dd/MM/yy')
  }

  const handleAddHoliday = () => {
    if (selectedDate && description.trim()) {
      const month = selectedDate.getMonth() + 1
      const day = selectedDate.getDate()
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      // Check if date already exists in local holidays (check by month and day for recurring holidays)
      if (!localHolidays.some((h) => h.month === month && h.day === day)) {
        const newHoliday: Holiday = {
          id: `temp-${Date.now()}`,
          type: 'HOLIDAY',
          month,
          day,
          description: description.trim(),
          is_recurring: true, // Always true by default
          date: dateStr,
        }
        setLocalHolidays([...localHolidays, newHoliday].sort((a, b) => 
          new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
        ))
        setSelectedDate(undefined)
        setDescription('')
      } else {
        toast({
          title: "Error",
          description: "This date is already added as a holiday",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteHoliday = (holiday: Holiday) => {
    if (!holiday) return
    
    // If it's a temporary holiday (starts with 'temp-'), just remove from local state without confirmation
    if (holiday.id?.startsWith('temp-')) {
      setLocalHolidays(localHolidays.filter((h) => h.id !== holiday.id))
      return
    }

    // Show confirmation modal for existing holidays
    setHolidayToDelete(holiday)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return

    const holidayId = holidayToDelete.id || `holiday-${holidayToDelete.month}-${holidayToDelete.day}`
    setDeletingHolidayId(holidayId)

    try {
      await deleteHoliday({ month: holidayToDelete.month, day: holidayToDelete.day }).unwrap()
      toast({
        title: "Success",
        description: "Holiday deleted successfully",
      })
      setShowDeleteConfirm(false)
      setHolidayToDelete(null)
      setDeletingHolidayId(null)
      refetchHolidays()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete holiday",
        variant: "destructive",
      })
      setDeletingHolidayId(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setHolidayToDelete(null)
    setDeletingHolidayId(null)
  }

  const handleSave = async () => {
    // Get only new holidays (those with temp IDs)
    const newHolidays = localHolidays.filter((h) => h.id?.startsWith('temp-'))
    
    if (newHolidays.length === 0) {
      toast({
        title: "Info",
        description: "No new holidays to save",
      })
      return
    }

    try {
      // Add all new holidays
      const promises = newHolidays.map((holiday) =>
        addHoliday({
          type: holiday.type,
          month: holiday.month,
          day: holiday.day,
          description: holiday.description,
          is_recurring: holiday.is_recurring,
        }).unwrap()
      )

      await Promise.all(promises)
      
      toast({
        title: "Success",
        description: "Holidays saved successfully",
      })
      
      refetchHolidays()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to save holidays",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Manage Holidays
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Selection Section */}
          <div className="space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select a MOT holiday date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full cursor-pointer justify-start text-left font-normal ${
                        !selectedDate ? 'text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'dd/MM/yy')
                      ) : (
                        'None Selected'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Description
              </Label>
              <Input
                type="text"
                placeholder="Enter holiday description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddHoliday}
              disabled={!selectedDate || !description.trim()}
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer whitespace-nowrap w-full"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Holiday
            </Button>
          </div>

          {/* Holidays List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Holidays List
            </Label>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {isLoadingHolidays ? (
                <div className="p-8 text-center text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  <p>Loading holidays...</p>
                </div>
              ) : localHolidays.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {localHolidays.map((holiday, index) => (
                    <div
                      key={holiday.id || `holiday-${holiday.month}-${holiday.day}-${index}`}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Wrench className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">
                          {holiday.date ? formatDate(holiday.date) : `${holiday.month}/${holiday.day}`}
                        </span>
                        <span className="text-sm text-gray-600">-</span>
                        <span className="text-sm text-gray-600 flex-1">
                          {holiday.description}
                        </span>
                        {holiday.id?.startsWith('temp-') && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            New
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHoliday(holiday)}
                        disabled={deletingHolidayId === (holiday.id || `holiday-${holiday.month}-${holiday.day}`)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        {deletingHolidayId === (holiday.id || `holiday-${holiday.month}-${holiday.day}`) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No holidays added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isAdding || localHolidays.filter((h) => h.id?.startsWith('temp-')).length === 0}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Holidays'
            )}
          </Button>
        </div>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Holiday"
        description={`Are you sure you want to delete the holiday on ${holidayToDelete?.date ? formatDate(holidayToDelete.date) : `${holidayToDelete?.month}/${holidayToDelete?.day}`} (${holidayToDelete?.description})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </Dialog>
  )
}
