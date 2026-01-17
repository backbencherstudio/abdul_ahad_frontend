"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { format } from "date-fns";
import { GarageData } from "@/rtk/slices/driver/bookMyMotSlice";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  submittedBooking: {
    name: string;
    email: string;
    phone: string;
    date: string;
    additionalServices: string;
  } | null;
  selectedSlot: {
    slot_id: string;
    garage_id: string;
    vehicle_id: string;
    date: string;
    start_time: string;
    end_time: string;
  } | null;
  selectedDate: Date | undefined;
  garage: GarageData | null;
  formatTime: (time: string) => string;
}

export default function BookingSuccessModal({
  isOpen,
  onClose,
  submittedBooking,
  selectedSlot,
  selectedDate,
  garage,
  formatTime,
}: BookingSuccessModalProps) {
  const router = useRouter();

  const handleGoHome = () => {
    onClose();
    router.push("/driver/book-my-mot");
  };

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Success"
      showHeader={false}
      className="max-w-sm mx-4"
    >
      <div className=" text-white rounded-lg overflow-hidden">
        {/* Header with close button */}
        <div className="relative p-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-500 border-3 border-gray-300 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title and Message */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2 text-green-500">
              MOT Booking is Complete!
            </h2>
            <p className="text-gray-500">Thank you for booking with us.</p>
          </div>

          {/* Booking Details */}
          <div className="space-y-3 mb-6 text-sm mx-auto text-center">
            {(selectedDate || submittedBooking?.date) && (
              <div>
                <span className="text-gray-400">Date: </span>
                <span className="text-gray-600 font-medium ml-2">
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yy")
                    : submittedBooking?.date
                      ? format(new Date(submittedBooking.date), "dd/MM/yy")
                      : ""}
                </span>
              </div>
            )}
            {selectedSlot && (
              <div>
                <span className="text-gray-400">Time: </span>
                <span className="text-gray-600 font-medium ml-2">
                  {formatTime(selectedSlot.start_time)} -{" "}
                  {formatTime(selectedSlot.end_time)}
                </span>
              </div>
            )}
            {garage?.garage_name && (
              <div>
                <span className="text-gray-400">Garage: </span>
                <span className="text-gray-600 font-medium ml-2">
                  {garage.garage_name}
                </span>
              </div>
            )}
            {submittedBooking?.additionalServices && (
              <div>
                <span className="text-gray-400">Additional services: </span>
                <span className="text-gray-600 font-medium ml-2">
                  {submittedBooking.additionalServices}
                </span>
              </div>
            )}
          </div>

          {/* Go To Home Button */}
          <Button
            onClick={handleGoHome}
            className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold py-3 text-base rounded-lg transition-all duration-200"
          >
            Go To Home
          </Button>
        </div>
      </div>
    </CustomReusableModal>
  );
}
