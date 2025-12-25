"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Clock } from 'lucide-react'

interface Break {
  id: string
  fromTime: string
  toTime: string
  description?: string
}

interface BreaksModalProps {
  isOpen: boolean
  onClose: () => void
  dayName: string
  breaks: Break[]
  onBreaksChange: (breaks: Break[]) => void
}

export default function BreaksModal({
  isOpen,
  onClose,
  dayName,
  breaks,
  onBreaksChange,
}: BreaksModalProps) {
  const handleAddBreak = () => {
    const newBreak: Break = {
      id: `break-${Date.now()}`,
      fromTime: '12:00',
      toTime: '13:00',
      description: '',
    }
    onBreaksChange([...breaks, newBreak])
  }

  const handleBreakTimeChange = (
    breakId: string,
    field: 'fromTime' | 'toTime',
    value: string
  ) => {
    onBreaksChange(
      breaks.map((breakItem) =>
        breakItem.id === breakId
          ? { ...breakItem, [field]: value }
          : breakItem
      )
    )
  }

  const handleDescriptionChange = (
    breakId: string,
    value: string
  ) => {
    onBreaksChange(
      breaks.map((breakItem) =>
        breakItem.id === breakId
          ? { ...breakItem, description: value }
          : breakItem
      )
    )
  }

  const handleRemoveBreak = (breakId: string) => {
    onBreaksChange(breaks.filter((b) => b.id !== breakId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Manage Breaks - {dayName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Breaks List */}
          {breaks.length > 0 ? (
            <div className="space-y-3">
              {breaks.map((breakItem) => (
                <div
                  key={breakItem.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Description Field */}
                    <div className="md:col-span-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g., Lunch Break"
                        value={breakItem.description || ''}
                        onChange={(e) =>
                          handleDescriptionChange(
                            breakItem.id,
                            e.target.value
                          )
                        }
                        className="w-full"
                      />
                    </div>

                    {/* From Time */}
                    <div className="md:col-span-3">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Start Time
                      </Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={breakItem.fromTime}
                          onChange={(e) =>
                            handleBreakTimeChange(
                              breakItem.id,
                              'fromTime',
                              e.target.value
                            )
                          }
                          onClick={(e) => {
                            e.currentTarget.showPicker?.()
                          }}
                          className="w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* To Time */}
                    <div className="md:col-span-3">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        End Time
                      </Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={breakItem.toTime}
                          onChange={(e) =>
                            handleBreakTimeChange(
                              breakItem.id,
                              'toTime',
                              e.target.value
                            )
                          }
                          onClick={(e) => {
                            e.currentTarget.showPicker?.()
                          }}
                          className="w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="md:col-span-2 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBreak(breakItem.id)}
                        className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 w-full text-xs h-9"
                      >
                        <Trash2 className="w-3.5 h-3.5 " />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No breaks added yet</p>
              <p className="text-sm mt-1">Click "Add Break" to create one</p>
            </div>
          )}

          {/* Add Break Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddBreak}
            className="w-full cursor-pointer border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Break
          </Button>
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

