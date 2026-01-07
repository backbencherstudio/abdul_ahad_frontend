"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  useGetGarageSlotsQuery,
  useBookSlotMutation,
} from "@/rtk/api/driver/bookMyMotApi";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import PersonalInformationSection from "./BookingModal/PersonalInformationSection";
import BookingDetailsSection from "./BookingModal/BookingDetailsSection";
import AdditionalServicesSection from "./BookingModal/AdditionalServicesSection";
import BookingSuccessModal from "./BookingModal/BookingSuccessModal";

import { GarageData } from "@/rtk/slices/driver/bookMyMotSlice";

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  additionalServices: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  garage: GarageData | null;
  vehicleId?: string; // Optional vehicle_id prop for cases where vehicle is not in Redux
}

export default function BookingModal({
  isOpen,
  onClose,
  garage,
  vehicleId: propVehicleId,
}: BookingModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();

  // Use vehicle_id from prop if vehicle is not in Redux
  const vehicleId = propVehicleId || null;

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    additionalServices: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotData, setSelectedSlotData] = useState<{
    start_time: string;
    end_time: string;
    date: string;
    id: string;
  } | null>(null);
  const [submittedBooking, setSubmittedBooking] =
    useState<BookingFormData | null>(null);

  // Fetch slots when date is selected
  const { data: slotsData, isLoading: slotsLoading } = useGetGarageSlotsQuery(
    { id: garage?.id || "", date: bookingForm.date },
    { skip: !garage?.id || !bookingForm.date }
  );

  // Book slot mutation
  const [bookSlot, { isLoading: isBooking }] = useBookSlotMutation();

  // Auto-fill form with user info when modal opens
  useEffect(() => {
    if (isOpen && (user || profile)) {
      setBookingForm((prev) => ({
        ...prev,
        name: user?.name || profile?.name || prev.name || "",
        email: user?.email || profile?.email || prev.email || "",
        phone: profile?.phone_number || prev.phone || "",
      }));
    }
  }, [isOpen, user, profile]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        additionalServices: "",
      });
      setSelectedDate(undefined);
      setSelectedSlotId(null);
      setSelectedSlotData(null);
      setSelectedSlotId(null);
      setSelectedSlotData(null);
    }
  }, [isOpen]);

  // Sync selectedDate with bookingForm.date when form date changes externally
  useEffect(() => {
    if (bookingForm.date) {
      const parsedDate = new Date(bookingForm.date);
      if (!isNaN(parsedDate.getTime())) {
        // Only update if dates are different
        const currentDateString = selectedDate?.toDateString();
        const newDateString = parsedDate.toDateString();
        if (currentDateString !== newDateString) {
          setSelectedDate(parsedDate);
        }
      }
    } else if (!bookingForm.date && selectedDate) {
      // Clear selectedDate if form date is cleared
      setSelectedDate(undefined);
    }
  }, [bookingForm.date]);

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
    // Reset selected slot when date changes
    if (field === "date") {
      setSelectedSlotId(null);
      setSelectedSlotData(null);
    }
  };

  // Handle slot selection (just select, don't book yet)
  const handleSlotSelect = (
    slot: {
      id: string;
      start_time: string;
      end_time: string;
      date: string;
      status?: string[];
    },
    e?: React.MouseEvent
  ) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Check if slot is booked or break - don't allow selection
    const isBooked =
      Array.isArray(slot.status) && slot.status.includes("BOOKED");
    const isBreak = Array.isArray(slot.status) && slot.status.includes("BREAK");

    if (isBooked || isBreak) {
      return; // Don't allow selection of booked or break slots
    }

    // Just select the slot, validation will happen on submit
    setSelectedSlotId(slot.id);
    setSelectedSlotData({
      id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      date: slot.date,
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone) {
      toast.error("Please fill in all required fields (Name, Email, Phone)");
      return;
    }

    // Get garage_id and vehicle_id
    // vehicle_id can come from Redux state (from search) or from prop (from URL params)
    const garageId = garage?.id;
    const finalVehicleId = vehicleId;

    if (!selectedSlotId || !garageId || !finalVehicleId || !selectedSlotData) {
      if (!garageId) {
        toast.error("Garage information is missing. Please search again.");
      } else if (!finalVehicleId) {
        toast.error("Vehicle information is missing. Please search again.");
      } else if (!selectedSlotData) {
        toast.error("Slot information is missing. Please select a time slot.");
      } else {
        toast.error("Please select a time slot");
      }
      return;
    }

    try {
      // Book slot with garage_id, vehicle_id, start_time, end_time, date, and service_type
      // vehicle_id can be from Redux state (from search) or from prop (from URL params)
      const bookingBody = {
        garage_id: garageId,
        vehicle_id: finalVehicleId,
        start_time: selectedSlotData.start_time,
        end_time: selectedSlotData.end_time,
        date: selectedSlotData.date,
        service_type: "MOT",
      };

      const result = await bookSlot(bookingBody).unwrap();

      if (result.success) {
        let successMessage = "Slot booked successfully!";
        if (typeof result.message === "string") {
          successMessage = result.message;
        } else if (
          result.message &&
          typeof result.message === "object" &&
          "message" in result.message
        ) {
          const msgObj = result.message as { message?: string };
          if (typeof msgObj.message === "string") {
            successMessage = msgObj.message;
          }
        }
        toast.success(successMessage);
        setSubmittedBooking(bookingForm);
        onClose();
        setIsSuccessModalOpen(true);

        // Reset form
        setBookingForm({
          name: "",
          email: "",
          phone: "",
          date: "",
          additionalServices: "",
        });
        setSelectedDate(undefined);
        setSelectedSlotId(null);
        setSelectedSlotId(null);
      } else {
        let errorMessage = "Failed to book slot";
        if (typeof result.message === "string") {
          errorMessage = result.message;
        } else if (
          result.message &&
          typeof result.message === "object" &&
          "message" in result.message
        ) {
          const msgObj = result.message as { message?: string };
          if (typeof msgObj.message === "string") {
            errorMessage = msgObj.message;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to book slot. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Format time to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    setSubmittedBooking(null);
  };

  return (
    <>
      {/* Booking Modal */}
      <CustomReusableModal
        isOpen={isOpen}
        onClose={onClose}
        title="Garage Booking"
        showHeader={false}
        className="max-w-3xl w-full mx-4"
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#19CA32] to-[#16b82e] text-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Book Your MOT</h2>
              </div>
              <div className="hidden sm:block">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleBookingSubmit}
            className="p-6 sm:p-8 overflow-y-auto max-h-[80vh]"
          >
            <div className="space-y-6">
              {/* Personal Information Section */}
              <PersonalInformationSection
                name={bookingForm.name}
                email={bookingForm.email}
                phone={bookingForm.phone}
              />

              {/* Booking Details Section */}
              <BookingDetailsSection
                selectedDate={selectedDate}
                date={bookingForm.date}
                onDateChange={(dateValue) => {
                  handleInputChange("date", dateValue);
                  if (dateValue) {
                    const parsedDate = new Date(dateValue);
                    if (!isNaN(parsedDate.getTime())) {
                      setSelectedDate(parsedDate);
                    }
                  } else {
                    setSelectedDate(undefined);
                  }
                }}
                slots={slotsData?.slots}
                slotsLoading={slotsLoading}
                selectedSlotId={selectedSlotId}
                onSlotSelect={(slot) => handleSlotSelect(slot)}
                isBooking={isBooking}
                formatTime={formatTime}
              />

              {/* Additional Services Section */}
              <AdditionalServicesSection
                value={bookingForm.additionalServices}
                onChange={(value) =>
                  handleInputChange("additionalServices", value)
                }
              />

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={!selectedSlotId || isBooking}
                  className="w-full cursor-pointer bg-gradient-to-r from-[#19CA32] to-[#16b82e] hover:from-[#16b82e] hover:to-[#14a828] text-white font-semibold py-4 text-base rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isBooking ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Booking...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Book My MOT
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </CustomReusableModal>
      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        submittedBooking={submittedBooking}
        selectedSlot={
          selectedSlotData && garage && vehicleId
            ? {
                slot_id: selectedSlotData.id,
                garage_id: garage.id,
                vehicle_id: vehicleId,
                date: selectedSlotData.date,
                start_time: selectedSlotData.start_time,
                end_time: selectedSlotData.end_time,
              }
            : null
        }
        selectedDate={selectedDate}
        garage={garage}
        formatTime={formatTime}
      />
    </>
  );
}
