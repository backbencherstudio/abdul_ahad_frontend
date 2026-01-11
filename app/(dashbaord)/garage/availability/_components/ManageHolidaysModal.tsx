"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  Wrench,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  useGetHolidaysQuery,
  useAddHolidayMutation,
  useDeleteHolidayMutation,
  Holiday,
} from "../../../../../rtk/api/garage/scheduleApis";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";

interface ManageHolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ManageHolidaysModal({
  isOpen,
  onClose,
  onSuccess,
}: ManageHolidaysModalProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState<string>("");
  const [localHolidays, setLocalHolidays] = useState<Holiday[]>([]);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(
    null
  );

  // Fetch holidays from API
  const {
    data: holidaysResponse,
    isLoading: isLoadingHolidays,
    refetch: refetchHolidays,
  } = useGetHolidaysQuery(undefined, {
    skip: !isOpen,
  });

  const [addHoliday, { isLoading: isAdding }] = useAddHolidayMutation();
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation();

  // Update local holidays when API data changes
  useEffect(() => {
    if (holidaysResponse?.success && holidaysResponse.data) {
      // Transform API data to include date string for display and unique key
      const transformedHolidays = holidaysResponse.data.map(
        (holiday, index) => {
          const currentYear = new Date().getFullYear();
          const date = new Date(currentYear, holiday.month - 1, holiday.day);
          return {
            ...holiday,
            date: format(date, "yyyy-MM-dd"),
            id: `holiday-${holiday.month}-${holiday.day}-${index}`,
          };
        }
      );
      setLocalHolidays(transformedHolidays);
    } else if (holidaysResponse && !holidaysResponse.success) {
      setLocalHolidays([]);
    }
  }, [holidaysResponse]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined);
      setDescription("");
    }
  }, [isOpen]);

  const formatDate = (month: number, day: number): string => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[month - 1]} ${day}`;
  };

  const handleAddHoliday = async () => {
    if (!selectedDate) return;

    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();

    // Check if date already exists
    if (localHolidays.some((h) => h.month === month && h.day === day)) {
      toast({
        title: "Error",
        description: "This date is already added as a holiday",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save immediately to API
      await addHoliday({
        type: "HOLIDAY",
        month,
        day,
        description: description.trim(),
        is_recurring: true,
      }).unwrap();

      toast({
        title: "Success",
        description: "Holiday added successfully",
      });

      // Reset form
      setSelectedDate(undefined);
      setDescription("");

      // Refetch holidays to update the list
      await refetchHolidays();
      // Don't call onSuccess to prevent modal from closing
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to add holiday",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHoliday = (holiday: Holiday) => {
    if (!holiday) return;

    // Show confirmation modal for all holidays
    setHolidayToDelete(holiday);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;

    const holidayId =
      holidayToDelete.id ||
      `holiday-${holidayToDelete.month}-${holidayToDelete.day}`;
    setDeletingHolidayId(holidayId);

    try {
      await deleteHoliday({
        month: holidayToDelete.month,
        day: holidayToDelete.day,
      }).unwrap();
      toast({
        title: "Success",
        description: "Holiday deleted successfully",
      });
      setShowDeleteConfirm(false);
      setHolidayToDelete(null);
      setDeletingHolidayId(null);
      await refetchHolidays();
      // Don't call onSuccess to keep modal open
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete holiday",
        variant: "destructive",
      });
      setDeletingHolidayId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setHolidayToDelete(null);
    setDeletingHolidayId(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only close when explicitly closing, not on outside click during operations
        if (!open && !isAdding && !isDeleting) {
          onClose();
        }
      }}
    >
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
                        !selectedDate ? "text-gray-500" : "text-gray-900"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? formatDate(
                            selectedDate.getMonth() + 1,
                            selectedDate.getDate()
                          )
                        : "None Selected"}
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
                Description (optional)
              </Label>
              <Input
                type="text"
                placeholder="Enter holiday description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selectedDate && description.trim()) {
                    e.preventDefault();
                    handleAddHoliday();
                  }
                }}
                className="w-full"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddHoliday}
              disabled={!selectedDate || isAdding}
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer whitespace-nowrap w-full"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Holiday
                </>
              )}
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
                      key={
                        holiday.id ||
                        `holiday-${holiday.month}-${holiday.day}-${index}`
                      }
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Wrench className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(holiday.month, holiday.day)}
                        </span>
                        <span className="text-sm text-gray-600">-</span>
                        <span className="text-sm text-gray-600 flex-1">
                          {holiday.description}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHoliday(holiday)}
                        disabled={
                          deletingHolidayId ===
                          (holiday.id ||
                            `holiday-${holiday.month}-${holiday.day}`)
                        }
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        {deletingHolidayId ===
                        (holiday.id ||
                          `holiday-${holiday.month}-${holiday.day}`) ? (
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
        </div>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Holiday"
        description={`Are you sure you want to delete the holiday on ${
          holidayToDelete
            ? formatDate(holidayToDelete.month, holidayToDelete.day)
            : ""
        } (${holidayToDelete?.description})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </Dialog>
  );
}
