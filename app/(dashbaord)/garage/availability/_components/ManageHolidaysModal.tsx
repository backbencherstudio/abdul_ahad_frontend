"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar as CalendarIcon, Wrench, Trash2, Plus } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'

interface Holiday {
  id: string
  date: string
  description: string
}

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [holidays, setHolidays] = useState<Holiday[]>([
    {
      id: '1',
      date: '2025-12-23',
      description: 'Your Holiday',
    },
    {
      id: '2',
      date: '2025-12-24',
      description: 'Your Holiday',
    },
    {
      id: '3',
      date: '2025-12-25',
      description: 'Your Holiday',
    },
    {
      id: '4',
      date: '2025-12-26',
      description: 'Your Holiday',
    },
    {
      id: '5',
      date: '2025-12-27',
      description: 'Your Holiday',
    },
    {
      id: '6',
      date: '2025-12-30',
      description: 'Your Holiday',
    },
  ])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return format(date, 'dd/MM/yy')
  }

  const handleAddHoliday = () => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      // Check if date already exists
      if (!holidays.some((h) => h.date === dateStr)) {
        const newHoliday: Holiday = {
          id: `holiday-${Date.now()}`,
          date: dateStr,
          description: 'Your Holiday',
        }
        setHolidays([...holidays, newHoliday].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ))
        setSelectedDate(undefined)
      }
    }
  }

  const handleDeleteHoliday = (id: string) => {
    setHolidays(holidays.filter((h) => h.id !== id))
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

            <Button
              type="button"
              onClick={handleAddHoliday}
              disabled={!selectedDate}
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Holiday
            </Button>
          </div>

          {/* Holidays List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Holidays List
            </Label>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {holidays.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {holidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Wrench className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(holiday.date)}
                        </span>
                        <span className="text-sm text-gray-600">-</span>
                        <span className="text-sm text-gray-600">
                          {holiday.description}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
