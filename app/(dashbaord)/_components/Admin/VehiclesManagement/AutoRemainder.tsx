"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import {
  usePatchAutoReminderSettingsMutation,
  useGetAutoReminderSettingsQuery,
} from "@/rtk/api/admin/vehiclesManagements/vehicles-management";

interface AutoReminderProps {
  vehiclesNeedingReminder: number;
}

export default function AutoReminder({ vehiclesNeedingReminder }: AutoReminderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(false);
  const [reminderDaysInAdvance, setReminderDaysInAdvance] = useState(14);
  const [predefinedMessage, setPredefinedMessage] = useState("");

  const [patchAutoReminderSettings, { isLoading: isSaving }] =
    usePatchAutoReminderSettingsMutation();

  const { data: settingsData, isLoading: isLoadingSettings, refetch } =
    useGetAutoReminderSettingsQuery(undefined, { skip: !isOpen });

  // Memoize settings to detect changes - use JSON.stringify to detect deep changes
  const settingsKey = useMemo(() => {
    if (settingsData?.data) {
      return JSON.stringify({
        autoReminder: settingsData.data.autoReminder,
        reminderPeriods: settingsData.data.reminderPeriods,
        reminderMessage: settingsData.data.reminderMessage,
      });
    }
    return null;
  }, [settingsData?.data]);

  const settings = useMemo(() => {
    if (settingsData?.data) {
      return {
        autoReminder: settingsData.data.autoReminder ?? false,
        reminderDaysInAdvance: settingsData.data.reminderPeriods?.[0] ?? 14,
        reminderMessage: settingsData.data.reminderMessage || "",
      };
    }
    return null;
  }, [settingsKey]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAutoReminderEnabled(false);
      setReminderDaysInAdvance(14);
      setPredefinedMessage("");
    }
  }, [isOpen]);

  // Update state when settings change from backend
  useEffect(() => {
    if (isOpen && settings) {
      setAutoReminderEnabled(settings.autoReminder);
      setReminderDaysInAdvance(settings.reminderDaysInAdvance);
      setPredefinedMessage(settings.reminderMessage);
    }
  }, [isOpen, settingsKey, settings]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      refetch();
    }
  };

  const handleSave = async () => {
    try {
      await patchAutoReminderSettings({
        reminderPeriods: [reminderDaysInAdvance],
        autoReminder: autoReminderEnabled,
        reminderMessage: predefinedMessage || "",
      }).unwrap();

      toast.success("Auto reminder settings saved successfully");
      const result = await refetch();
      if (result.data?.data) {
        const updatedSettings = result.data.data;
        setAutoReminderEnabled(updatedSettings.autoReminder ?? false);
        if (updatedSettings.reminderPeriods?.length > 0) {
          setReminderDaysInAdvance(updatedSettings.reminderPeriods[0]);
        }
        setPredefinedMessage(updatedSettings.reminderMessage || "");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save auto reminder settings");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-10 px-5 cursor-pointer border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow font-semibold text-gray-700"
      >
        <Settings className="h-4 w-4 mr-2" />
        Auto Reminder
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Auto Reminder Settings</DialogTitle>
            <DialogDescription>Configure automatic MOT reminders for drivers</DialogDescription>
          </DialogHeader>

          {isLoadingSettings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading settings...</span>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <label className="text-sm font-semibold text-gray-900 block mb-1">
                    Enable Auto Reminders
                  </label>
                  <p className="text-xs text-gray-500">
                    Automatically notify drivers before MOT expiry
                  </p>
                </div>
                <Switch
                  checked={autoReminderEnabled}
                  onCheckedChange={setAutoReminderEnabled}
                  disabled={isLoadingSettings}
                />
              </div>

              {autoReminderEnabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-2">
                      Remind Before
                    </label>
                    <Select
                      value={String(reminderDaysInAdvance)}
                      onValueChange={(value) => setReminderDaysInAdvance(parseInt(value, 10))}
                      disabled={isLoadingSettings}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 Week</SelectItem>
                        <SelectItem value="14">2 Weeks</SelectItem>
                        <SelectItem value="21">3 Weeks</SelectItem>
                        <SelectItem value="30">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900 block">Message</label>
                    <textarea
                      value={predefinedMessage}
                      onChange={(e) => setPredefinedMessage(e.target.value)}
                      placeholder="Enter reminder message..."
                      rows={5}
                      disabled={isLoadingSettings}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {vehiclesNeedingReminder > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <p className="text-sm text-blue-900 font-semibold">
                          {vehiclesNeedingReminder} vehicle{vehiclesNeedingReminder > 1 ? "s" : ""}{" "}
                          {vehiclesNeedingReminder === 1 ? "needs" : "need"} reminder
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving || isLoadingSettings}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoadingSettings}
              className="bg-[#19CA32] hover:bg-[#16b82e] text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
