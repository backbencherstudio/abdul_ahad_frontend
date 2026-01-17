"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Save } from "lucide-react";
import BreaksModal from "./BreaksModal";
import DefultCalanderViewShimmer from "./DefultCalanderViewShimmer";
import {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  type ScheduleRequest,
} from "@/rtk/api/garage/scheduleApis";
import { useToast } from "@/hooks/use-toast";

interface DaySchedule {
  day: string;
  isClosed: boolean;
  fromTime: string;
  toTime: string;
  duration: number;
  breaks: Array<{
    id: string;
    fromTime: string;
    toTime: string;
    description?: string;
  }>;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getApiDayOfWeek = (componentIndex: number): number => {
  // componentIndex: 0=Monday, 1=Tuesday, ..., 5=Saturday, 6=Sunday
  // API: 0=Sunday, 1=Monday, ..., 6=Saturday
  return (componentIndex + 1) % 7;
};

interface DefultCalanderViewProps {
  isLoading?: boolean;
  onScheduleUpdate?: () => void;
}

export default function DefultCalanderView({
  isLoading = false,
  onScheduleUpdate,
}: DefultCalanderViewProps) {
  const { toast } = useToast();
  const [openBreaksModalIndex, setOpenBreaksModalIndex] = useState<
    number | null
  >(null);
  const originalSchedulesRef = useRef<DaySchedule[] | null>(null);

  // Fetch schedule data from API
  const {
    data: scheduleResponse,
    isLoading: isFetching,
    refetch: refetchSchedule,
  } = useGetScheduleQuery();
  const [createSchedule, { isLoading: isSaving }] = useCreateScheduleMutation();

  // Initialize schedules state
  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
    return DAYS.map((day) => ({
      day,
      isClosed: false,
      fromTime: "09:00",
      toTime: "17:00",
      duration: 60,
      breaks: [],
    }));
  });

  // Load data from API when it's available
  useEffect(() => {
    if (scheduleResponse?.success && scheduleResponse.data) {
      const apiData = scheduleResponse.data;
      const dailyHours = apiData.daily_hours || {};
      const restrictions = apiData.restrictions || [];

      // Transform API data to component state
      const newSchedules: DaySchedule[] = DAYS.map((day, componentIndex) => {
        const apiDay = getApiDayOfWeek(componentIndex).toString();
        const dayConfig = dailyHours[apiDay];

        if (dayConfig?.is_closed) {
          return {
            day,
            isClosed: true,
            fromTime: dayConfig.intervals?.[0]?.start_time || "09:00",
            toTime: dayConfig.intervals?.[0]?.end_time || "17:00",
            duration: dayConfig.slot_duration || 60,
            breaks: [],
          };
        }

        // Get breaks for this day
        const dayBreaks = restrictions
          .filter(
            (restriction) =>
              restriction.type === "BREAK" &&
              Array.isArray(restriction.day_of_week) &&
              restriction.day_of_week.includes(getApiDayOfWeek(componentIndex)),
          )
          .map((restriction, idx) => ({
            id: `break-${componentIndex}-${idx}`,
            fromTime: restriction.start_time || "",
            toTime: restriction.end_time || "",
            description: restriction.description || "",
          }));

        return {
          day,
          isClosed: false,
          fromTime: dayConfig?.intervals?.[0]?.start_time || "09:00",
          toTime: dayConfig?.intervals?.[0]?.end_time || "17:00",
          duration: dayConfig?.slot_duration || 60,
          breaks: dayBreaks,
        };
      });

      setSchedules(newSchedules);
      // Store original data for change detection
      originalSchedulesRef.current = JSON.parse(JSON.stringify(newSchedules));
    }
  }, [scheduleResponse]);

  // Check if there are any changes
  const hasChanges = () => {
    if (!originalSchedulesRef.current) return false;
    return (
      JSON.stringify(schedules) !== JSON.stringify(originalSchedulesRef.current)
    );
  };

  const handleClosedToggle = (index: number, checked: boolean) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, isClosed: checked } : schedule,
      ),
    );
  };

  const handleTimeChange = (
    index: number,
    field: "fromTime" | "toTime",
    value: string,
  ) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, [field]: value } : schedule,
      ),
    );
  };

  const handleDurationChange = (index: number, value: number) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, duration: value } : schedule,
      ),
    );
  };

  const handleBreaksChange = (index: number, breaks: DaySchedule["breaks"]) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, breaks } : schedule,
      ),
    );
  };

  const handleOpenBreaksModal = (index: number) => {
    setOpenBreaksModalIndex(index);
  };

  const handleCloseBreaksModal = () => {
    setOpenBreaksModalIndex(null);
  };

  // Transform form data to API format
  const transformToApiFormat = (): ScheduleRequest => {
    const daily_hours: Record<string, any> = {};
    const restrictions: any[] = [];

    schedules.forEach((schedule, componentIndex) => {
      const apiDay = getApiDayOfWeek(componentIndex).toString();

      if (schedule.isClosed) {
        daily_hours[apiDay] = {
          is_closed: true,
        };
      } else {
        daily_hours[apiDay] = {
          intervals: [
            {
              start_time: schedule.fromTime,
              end_time: schedule.toTime,
            },
          ],
          slot_duration: schedule.duration,
        };

        // Add breaks as restrictions
        schedule.breaks.forEach((breakItem) => {
          restrictions.push({
            type: "BREAK",
            day_of_week: [getApiDayOfWeek(componentIndex)],
            start_time: breakItem.fromTime,
            end_time: breakItem.toTime,
            description: breakItem.description || "Break",
          });
        });
      }
    });

    return {
      daily_hours,
      restrictions,
    };
  };

  // Handle save
  const handleSave = async () => {
    try {
      const requestData = transformToApiFormat();
      const result = await createSchedule(requestData).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Schedule updated successfully",
        });
        originalSchedulesRef.current = JSON.parse(JSON.stringify(schedules));
        await refetchSchedule();
        onScheduleUpdate?.();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update schedule",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.data?.message || error?.message || "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  // Show shimmer when loading
  if (isLoading || isFetching) {
    return <DefultCalanderViewShimmer />;
  }

  return (
    <>
      {/* Save Button - Only show when there are changes */}
      {hasChanges() && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="cursor-pointer"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
      <Card className="w-full">
        <CardContent className="p-4 sm:p-5">
          <div className="space-y-2">
            {schedules.map((schedule, index) => (
              <div
                key={schedule.day}
                className={`pb-3 ${
                  index !== schedules.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                {/* Day Name and Closed Switch */}
                <div className="mb-3 flex justify-between items-center">
                  {/* Day Name */}
                  <h3 className="text-base font-medium text-gray-900">
                    {schedule.day}
                  </h3>

                  {/* Closed Switch */}
                  <div className="flex items-center gap-3">
                    <Label
                      htmlFor={`closed-${index}`}
                      className="text-sm font-medium text-gray-700 cursor-pointer whitespace-nowrap"
                    >
                      Closed
                    </Label>
                    <Switch
                      id={`closed-${index}`}
                      checked={schedule.isClosed}
                      onCheckedChange={(checked) =>
                        handleClosedToggle(index, checked)
                      }
                    />
                  </div>
                </div>

                {/* Main Row - From/To Times, Duration, Add Break Button */}
                <div className="flex flex-col 2xl:flex-row 2xl:items-start gap-3">
                  {/* From Time */}
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`from-${index}`}
                      className="text-xs text-gray-600 mb-1 block"
                    >
                      From
                    </Label>
                    <div className="relative">
                      <Input
                        id={`from-${index}`}
                        type="time"
                        value={schedule.fromTime}
                        onChange={(e) =>
                          handleTimeChange(index, "fromTime", e.target.value)
                        }
                        onClick={(e) => {
                          if (!schedule.isClosed) {
                            e.currentTarget.showPicker?.();
                          }
                        }}
                        disabled={schedule.isClosed}
                        className={`w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none ${
                          schedule.isClosed
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* To Time */}
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`to-${index}`}
                      className="text-xs text-gray-600 mb-1 block"
                    >
                      To
                    </Label>
                    <div className="relative">
                      <Input
                        id={`to-${index}`}
                        type="time"
                        value={schedule.toTime}
                        onChange={(e) =>
                          handleTimeChange(index, "toTime", e.target.value)
                        }
                        onClick={(e) => {
                          if (!schedule.isClosed) {
                            e.currentTarget.showPicker?.();
                          }
                        }}
                        disabled={schedule.isClosed}
                        className={`w-full pr-10 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none ${
                          schedule.isClosed
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : ""
                        }`}
                      />
                      <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex sm:flex-row flex-col justify-between gap-3">
                    {/* Duration Input */}
                    <div className="flex-shrink-0 w-full sm:w-6/12">
                      <Label
                        htmlFor={`duration-${index}`}
                        className="text-xs text-gray-600 mb-1 block"
                      >
                        Slot Duration (min)
                      </Label>
                      <Input
                        id={`duration-${index}`}
                        type="number"
                        min="15"
                        max="480"
                        step="15"
                        value={schedule.duration}
                        onChange={(e) =>
                          handleDurationChange(
                            index,
                            parseInt(e.target.value) || 60,
                          )
                        }
                        disabled={schedule.isClosed}
                        className={`w-full ${
                          schedule.isClosed
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    </div>

                    {/* Manage Breaks Button */}
                    <div className="flex-shrink-0 w-full sm:w-6/12 pr-3">
                      <Label className="text-xs text-gray-600 mb-1 block opacity-0 pointer-events-none h-4">
                        Action
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenBreaksModal(index)}
                        disabled={schedule.isClosed}
                        className={`w-full cursor-pointer whitespace-nowrap h-9 text-xs ${
                          schedule.isClosed
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "border-gray-300 hover:bg-gray-50 "
                        }`}
                      >
                        <Clock className="w-4 h-4 " />
                        {schedule.breaks.length > 0
                          ? `Breaks (${schedule.breaks.length})`
                          : "Add Break"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breaks Modal */}
      {openBreaksModalIndex !== null && (
        <BreaksModal
          isOpen={openBreaksModalIndex !== null}
          onClose={handleCloseBreaksModal}
          dayName={schedules[openBreaksModalIndex]?.day || ""}
          dayIndex={getApiDayOfWeek(openBreaksModalIndex)}
          breaks={schedules[openBreaksModalIndex]?.breaks || []}
          onBreaksChange={(breaks) =>
            handleBreaksChange(openBreaksModalIndex, breaks)
          }
          onSaveSuccess={async () => {
            await refetchSchedule();
            onScheduleUpdate?.();
          }}
        />
      )}
    </>
  );
}
