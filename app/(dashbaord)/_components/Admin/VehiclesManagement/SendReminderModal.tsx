"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { useSendReminderToDriversMutation } from "@/rtk/api/admin/vehiclesManagements/reminderApis";

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRowsCount: number;
  selectedDriverData: Array<{
    id: string;
    driverId: string;
  }>;
  onSuccess?: () => void;
}

export default function SendReminderModal({
  isOpen,
  onClose,
  selectedRowsCount,
  selectedDriverData,
  onSuccess,
}: SendReminderModalProps) {
  const [message, setMessage] = useState("");
  const [sendReminder, { isLoading: isSending }] = useSendReminderToDriversMutation();

  const handleSendReminder = async () => {
    if (selectedRowsCount === 0) {
      toast.error("Please select at least one driver");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const receivers = selectedDriverData.map((driver) => ({
        receiver_id: driver.driverId,
        entity_id: driver.id,
      }));

      await sendReminder({ receivers, message }).unwrap();
      toast.success(`Reminder sent successfully to ${receivers.length} driver(s)`);
      setMessage("");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send reminder");
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Send MOT Reminder</DialogTitle>
          <DialogDescription className="text-gray-600">
            Send reminder notification to <span className="font-semibold text-gray-900">{selectedRowsCount}</span> selected driver(s)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-semibold text-gray-700 block">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your reminder message..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:border-transparent text-sm resize-none transition-all"
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{selectedRowsCount}</span> driver(s) will receive this reminder
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendReminder}
            disabled={isSending || !message.trim()}
            className="bg-[#19CA32] hover:bg-[#16b82e] text-white px-6 font-semibold shadow-sm hover:shadow transition-all"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reminder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

