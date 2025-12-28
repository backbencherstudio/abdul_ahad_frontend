"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Clock, Save } from 'lucide-react'
import { useGetScheduleQuery, useCreateScheduleMutation, type ScheduleRequest } from '@/rtk/api/garage/scheduleApis'
import { useToast } from '@/hooks/use-toast'

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
  dayIndex: number
  breaks: Break[]
  onBreaksChange: (breaks: Break[]) => void
  onSaveSuccess?: () => void
}

export default function BreaksModal({
  isOpen,
  onClose,
  dayName,
  dayIndex,
  breaks,
  onBreaksChange,
  onSaveSuccess,
}: BreaksModalProps) {
  const { toast } = useToast()
  const [localBreaks, setLocalBreaks] = useState<Break[]>(breaks)
  const [initialBreaks, setInitialBreaks] = useState<Break[]>(breaks)
  const { data: scheduleResponse, refetch: refetchSchedule } = useGetScheduleQuery()
  const [createSchedule, { isLoading: isSaving }] = useCreateScheduleMutation()

  useEffect(() => {
    if (isOpen) {
      setLocalBreaks([...breaks])
      setInitialBreaks([...breaks])
    }
  }, [isOpen, breaks])

  const handleAddBreak = () => {
    setLocalBreaks([
      ...localBreaks,
      {
        id: `break-${Date.now()}`,
        fromTime: '12:00',
        toTime: '13:00',
        description: '',
      }
    ])
  }

  const handleUpdateBreak = (breakId: string, updates: Partial<Break>) => {
    setLocalBreaks(localBreaks.map(b => 
      b.id === breakId ? { ...b, ...updates } : b
    ))
  }

  const handleRemoveBreak = (breakId: string) => {
    setLocalBreaks(localBreaks.filter(b => b.id !== breakId))
  }

  const handleSave = async () => {
    try {
      if (!scheduleResponse?.success || !scheduleResponse.data) {
        toast({
          title: "Error",
          description: "Unable to load current schedule data",
          variant: "destructive",
        })
        return
      }

      const { daily_hours = {}, restrictions = [] } = scheduleResponse.data
      
      const otherRestrictions = restrictions.filter(
        r => !(r.type === "BREAK" && Array.isArray(r.day_of_week) && r.day_of_week.includes(dayIndex))
      )

      const newRestrictions = localBreaks.map(b => ({
        type: "BREAK" as const,
        day_of_week: [dayIndex],
        start_time: b.fromTime,
        end_time: b.toTime,
        description: b.description || "Break",
      }))

      const result = await createSchedule({
        daily_hours,
        restrictions: [...otherRestrictions, ...newRestrictions],
      }).unwrap()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Breaks saved successfully",
        })
        await refetchSchedule()
        onBreaksChange(localBreaks)
        onSaveSuccess?.()
        onClose()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save breaks",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || error?.message || "Failed to save breaks",
        variant: "destructive",
      })
    }
  }

  const hasChanges = JSON.stringify(localBreaks) !== JSON.stringify(initialBreaks)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Manage Breaks - {dayName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {localBreaks.length > 0 ? (
            <div className="space-y-3">
              {localBreaks.map((breakItem) => (
                <div key={breakItem.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g., Lunch Break"
                        value={breakItem.description || ''}
                        onChange={(e) => handleUpdateBreak(breakItem.id, { description: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Start Time
                      </Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={breakItem.fromTime}
                          onChange={(e) => handleUpdateBreak(breakItem.id, { fromTime: e.target.value })}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          className="w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                        />
                        <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        End Time
                      </Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={breakItem.toTime}
                          onChange={(e) => handleUpdateBreak(breakItem.id, { toTime: e.target.value })}
                          onClick={(e) => e.currentTarget.showPicker?.()}
                          className="w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                        />
                        <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBreak(breakItem.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full text-xs h-9"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
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

          <Button
            type="button"
            variant="outline"
            onClick={handleAddBreak}
            className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Break
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {hasChanges && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

