"use client";
import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useRescheduleBookingMutation,
} from "@/rtk/api/garage/bookingsApis";
import { Booking } from "@/rtk/api/garage/bookingsApis";
import { toast } from "react-toastify";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { useDebounce } from "@/hooks/useDebounce";
import { FaCalendar } from "react-icons/fa";
import { useGetSlotDetailsQuery } from "@/rtk/api/garage/scheduleApis";
import { cn } from "@/lib/utils";

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    status: string | null;
    bookingName: string | null;
  }>({
    isOpen: false,
    bookingId: null,
    status: null,
    bookingName: null,
  });

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset to first page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  // Get bookings from API with debounced search
  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
  } = useGetBookingsQuery({
    search: debouncedSearch,
    status: activeTab === "all" ? "" : activeTab.toUpperCase(),
    page: currentPage,
    limit: itemsPerPage,
  });

  // Update status mutation
  const [updateBookingStatus, { isLoading: isUpdating }] =
    useUpdateBookingStatusMutation();

  // Reschedule booking mutation
  const [rescheduleBooking, { isLoading: isRescheduling }] =
    useRescheduleBookingMutation();

  // Reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({ isOpen: false, booking: null });
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // Fetch slots for selected date (garage perspective)
  const { data: slotResponse, isLoading: slotsLoading } =
    useGetSlotDetailsQuery(rescheduleDate, {
      skip: !rescheduleModal.isOpen || !rescheduleDate,
    });

  const slotData: any = (slotResponse as any)?.success
    ? (slotResponse as any).data
    : null;
  const slots: any[] = slotData?.slots || [];

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return "--:--";
    try {
      const [hours, minutes] = time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return "--:--";
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`;
    } catch (error) {
      return "--:--";
    }
  };

  const openReschedule = (booking: Booking) => {
    setRescheduleModal({ isOpen: true, booking });
    // Set default date to the original booking date instead of today
    const bookingDate = new Date(booking.order_date);
    const bookingDateStr = bookingDate.toISOString().split("T")[0];
    setRescheduleDate(bookingDateStr);
    setSelectedSlotId(null);
    setSelectedSlot(null);
  };

  const closeReschedule = () => {
    setRescheduleModal({ isOpen: false, booking: null });
    setRescheduleDate("");
    setSelectedSlotId(null);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot: any) => {
    // Determine if slot is selectable
    const statuses: string[] = Array.isArray(slot.status) ? slot.status : [];
    const isBooked = statuses.includes("BOOKED");
    const isBlocked = statuses.includes("BLOCKED");
    const isBreak = statuses.includes("BREAK");
    const isHoliday = statuses.includes("HOLIDAY");

    // Past check
    const [start] = (slot.time || "").split("-");
    let isPast = false;
    if (rescheduleDate && start) {
      const [h, m] = start.split(":").map(Number);
      const dt = new Date(rescheduleDate);
      dt.setHours(h || 0, m || 0, 0, 0);
      isPast = dt < new Date();
    }

    const isAvailable =
      !isBooked && !isBlocked && !isBreak && !isHoliday && !isPast;
    if (!isAvailable) return;
    setSelectedSlotId(slot.id || slot.time);
    setSelectedSlot(slot);
  };

  const handleSubmitReschedule = async () => {
    if (!rescheduleModal.booking || !rescheduleDate || !selectedSlot) {
      toast.warn("Please select date and time slot");
      return;
    }

    const [startTime, endTime] = (selectedSlot.time || "-").split("-");

    try {
      await rescheduleBooking({
        booking_id: rescheduleModal.booking.id,
        slot_id: selectedSlot.id,
        date: rescheduleDate,
        start_time: startTime,
        end_time: endTime,
      }).unwrap();
      toast.success("Booking rescheduled successfully");
      closeReschedule();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reschedule booking");
    }
  };

  // Define table columns
  const columns = [
    {
      key: "driver.name",
      label: "Customer",
      render: (value: any, row: Booking) => row.driver?.name || "N/A",
    },
    {
      key: "vehicle_id",
      label: "Vehicle ID",
      render: (value: string) => value || "N/A",
    },
    {
      key: "driver.email",
      label: "Email",
      render: (value: any, row: Booking) => row.driver?.email || "N/A",
    },
    {
      key: "driver.phone_number",
      label: "Number",
      render: (value: any, row: Booking) => row.driver?.phone_number || "N/A",
    },
    {
      key: "order_date",
      label: "Booking Date",
      render: (value: string) => {
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      },
    },
    {
      key: "order_time",
      label: "Time",
      render: (value: any, row: Booking) => {
        return new Date(row.order_date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      },
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (value: string) => `$${parseFloat(value || "0").toFixed(2)}`,
    },
    // {
    //   key: "status",
    //   label: "Status",
    //   render: (value: string) => {
    //     const statusColors: Record<string, string> = {
    //       PENDING: "bg-yellow-100 text-yellow-800",
    //       ACCEPTED: "bg-green-100 text-green-800",
    //       REJECTED: "bg-red-100 text-red-800",
    //       COMPLETED: "bg-blue-100 text-blue-800",
    //       CANCELLED: "bg-gray-100 text-gray-800",
    //     };
    //     const colorClass = statusColors[value] || "bg-gray-100 text-gray-800";
    //     return (
    //       <span
    //         className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
    //       >
    //         {value}
    //       </span>
    //     );
    //   },
    // },
  ];

  // Define tabs with counts
  // const tabs = [
  //   {
  //     key: "all",
  //     label: "All Order",
  //     count: bookingsData?.pagination?.total || 0,
  //   },
  //   {
  //     key: "pending",
  //     label: "Pending",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "PENDING")
  //         .length || 0,
  //   },
  //   {
  //     key: "accepted",
  //     label: "Accepted",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "ACCEPTED")
  //         .length || 0,
  //   },
  //   {
  //     key: "completed",
  //     label: "Completed",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "COMPLETED")
  //         .length || 0,
  //   },
  //   {
  //     key: "cancelled",
  //     label: "Cancelled",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "CANCELLED")
  //         .length || 0,
  //   },
  //   {
  //     key: "rejected",
  //     label: "Rejected",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "REJECTED")
  //         .length || 0,
  //   },
  // ];

  // Get table data from API response
  const tableData = bookingsData?.data || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  // Handle status update confirmation
  const handleStatusUpdateClick = (
    id: string,
    status: string,
    bookingName: string
  ) => {
    setConfirmModal({
      isOpen: true,
      bookingId: id,
      status: status,
      bookingName: bookingName,
    });
  };

  // Handle status update after confirmation
  // const handleStatusUpdate = async () => {
  //   if (!confirmModal.bookingId || !confirmModal.status) return;

  //   try {
  //     await updateBookingStatus({
  //       id: confirmModal.bookingId,
  //       status: confirmModal.status,
  //     }).unwrap();
  //     toast.success(
  //       `Booking ${confirmModal.status.toLowerCase()} successfully`
  //     );
  //     setConfirmModal({
  //       isOpen: false,
  //       bookingId: null,
  //       status: null,
  //       bookingName: null,
  //     });
  //     refetch();
  //   } catch (error: any) {
  //     toast.error(
  //       error?.data?.message ||
  //         `Failed to ${confirmModal.status.toLowerCase()} booking`
  //     );
  //     setConfirmModal({
  //       isOpen: false,
  //       bookingId: null,
  //       status: null,
  //       bookingName: null,
  //     });
  //   }
  // };

  // Close confirmation modal
  // const handleCloseModal = () => {
  //   setConfirmModal({
  //     isOpen: false,
  //     bookingId: null,
  //     status: null,
  //     bookingName: null,
  //   });
  // };

  // Action dropdown component
  const ActionDropdown = ({
    row,
    onReschedule,
  }: {
    row: Booking;
    onReschedule: (row: Booking) => void;
  }) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    const handleActionClick = (
      status: "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
    ) => {
      setDropdownOpen(false);
      // Small delay to ensure dropdown closes before modal opens
      setTimeout(() => {
        if (!isUpdating && row.status !== status) {
          handleStatusUpdateClick(
            row.id,
            status,
            row.driver?.name || "Booking"
          );
        }
      }, 150);
    };

    const isPending = row.status === "PENDING";
    const isAccepted = row.status === "ACCEPTED";
    const isRejected = row.status === "REJECTED";
    const isCancelled = row.status === "CANCELLED";
    const isCompleted = row.status === "COMPLETED";

    // If it's a final state, don't show any actions
    if (isRejected || isCancelled || isCompleted) {
      return null;
    }

    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 cursor-pointer w-8 p-0"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              onReschedule(row);
            }}
            className="cursor-pointer"
          >
            <Calendar />
            Reschedule
          </DropdownMenuItem>
          {/* {isPending && (
            <>
              <DropdownMenuItem
                onClick={() => handleActionClick("ACCEPTED")}
                className="cursor-pointer"
              >
                Accept
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleActionClick("REJECTED")}
                className="cursor-pointer text-red-600"
              >
                Reject
              </DropdownMenuItem>
            </>
          )}
          {isAccepted && (
            <>
              <DropdownMenuItem
                onClick={() => handleActionClick("COMPLETED")}
                className="cursor-pointer"
              >
                Complete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleActionClick("CANCELLED")}
                className="cursor-pointer text-red-600"
              >
                Cancel
              </DropdownMenuItem>
            </>
          )} */}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Define actions with dropdown
  const actions = [
    {
      label: "Actions",
      render: (row: Booking) => (
        <ActionDropdown row={row} onReschedule={openReschedule} />
      ),
    },
  ];

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          List of all Bookings
        </h1>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-4 mb-4">
        {/* Tabs on the left */}
        {/* <div className="flex flex-wrap gap-2 sm:gap-4 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm overflow-x-auto"> */}
        {/* {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 sm:px-4 py-1 rounded-[6px] cursor-pointer font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div> */}

        {/* Search on the right */}
        <div className="flex justify-end">
          <div className="relative w-full sm:w-auto sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && !isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600">
              Error loading bookings. Please try again.
            </p>
            <Button onClick={() => refetch()} className="mt-4 cursor-pointer">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && tableData.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-600 text-lg">No bookings found</p>
            <p className="text-gray-500 text-sm mt-2">
              Bookings will appear here once created
            </p>
          </div>
        </div>
      )}

      {/* Table - show when loading or has data */}
      {(isLoading || (!isError && tableData.length > 0)) && (
        <>
          <ReusableTable
            data={tableData}
            columns={columns}
            actions={actions}
            className=""
            isLoading={isLoading}
            skeletonRows={itemsPerPage}
          />

          {!isLoading && (
            <ReusablePagination
              currentPage={currentPage}
              totalPages={bookingsData?.pagination?.totalPages || 1}
              itemsPerPage={itemsPerPage}
              totalItems={bookingsData?.pagination?.total || 0}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              className=""
            />
          )}
        </>
      )}

      {/* Reschedule Modal */}
      <CustomReusableModal
        isOpen={rescheduleModal.isOpen}
        onClose={closeReschedule}
        title="Reschedule Booking"
        showHeader={false}
        className="max-w-3xl w-full mx-4"
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#19CA32] to-[#16b82e] text-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Reschedule Booking</h2>
              </div>
              <div className="hidden sm:block">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitReschedule();
            }}
            className="p-6 sm:p-8 overflow-y-auto max-h-[80vh]"
          >
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Select Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setSelectedSlotId(null);
                    setSelectedSlot(null);
                  }}
                  className="w-full h-11 border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>

              {rescheduleDate && (
                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    Available Time Slots{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  {slotsLoading ? (
                    <div className="text-center py-6 text-muted-foreground bg-muted rounded-xl border-2 border-dashed border-border">
                      Loading available slots...
                    </div>
                  ) : slots && Array.isArray(slots) && slots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                      {slots.map((slot: any, idx: number) => {
                        const statuses: string[] = Array.isArray(slot.status)
                          ? slot.status
                          : [];
                        const isBooked = statuses.includes("BOOKED");
                        const isBlocked = statuses.includes("BLOCKED");
                        const isBreak = statuses.includes("BREAK");
                        const isHoliday = statuses.includes("HOLIDAY");

                        const [start, end] = (slot.time || "-").split("-");

                        // Past check
                        let isPast = false;
                        if (rescheduleDate && start) {
                          const [h, m] = start.split(":").map(Number);
                          const dt = new Date(rescheduleDate);
                          dt.setHours(h || 0, m || 0, 0, 0);
                          isPast = dt < new Date();
                        }

                        const isAvailable =
                          !isBooked &&
                          !isBlocked &&
                          !isBreak &&
                          !isHoliday &&
                          !isPast;

                        return (
                          <button
                            key={slot.id || `${slot.time}-${idx}`}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            disabled={!isAvailable || isRescheduling}
                            className={cn(
                              "group relative px-4 py-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-2.5 min-h-[100px]",
                              isBooked
                                ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                : isBreak
                                ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                : isPast
                                ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                : "cursor-pointer hover:border-[#19CA32] hover:bg-[#19CA32]/10 hover:shadow-md hover:scale-105 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:ring-offset-2",
                              selectedSlotId === (slot.id || slot.time) &&
                                isAvailable
                                ? "border-[#19CA32] bg-[#19CA32] text-white shadow-lg ring-2 ring-[#19CA32]/30 scale-105"
                                : isAvailable &&
                                    "border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-[#19CA32]/5",
                              (isRescheduling || isBooked || isBreak) &&
                                "hover:scale-100"
                            )}
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                !isAvailable
                                  ? "bg-muted"
                                  : selectedSlotId === (slot.id || slot.time)
                                  ? "bg-white/25"
                                  : "bg-muted group-hover:bg-accent"
                              }`}
                            >
                              <Clock
                                className={`h-5 w-5 ${
                                  !isAvailable
                                    ? "text-muted-foreground"
                                    : selectedSlotId === (slot.id || slot.time)
                                    ? "text-primary-foreground"
                                    : "text-foreground"
                                }`}
                              />
                            </div>
                            <div className="text-center">
                              {!isAvailable ? (
                                <span className="font-semibold text-sm text-muted-foreground">
                                  {isBooked
                                    ? "BOOKED"
                                    : isBlocked
                                    ? "BLOCKED"
                                    : isBreak
                                    ? "BREAK"
                                    : isHoliday
                                    ? "HOLIDAY"
                                    : "PAST"}
                                </span>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className={
                                      selectedSlotId === (slot.id || slot.time)
                                        ? "font-semibold text-primary-foreground"
                                        : "font-semibold text-foreground"
                                    }
                                  >
                                    {formatTime(start)}
                                  </span>
                                  <span
                                    className={
                                      selectedSlotId === (slot.id || slot.time)
                                        ? "text-primary-foreground/70 text-xs"
                                        : "text-muted-foreground text-xs"
                                    }
                                  >
                                    -
                                  </span>
                                  <span
                                    className={
                                      selectedSlotId === (slot.id || slot.time)
                                        ? "font-semibold text-primary-foreground"
                                        : "font-semibold text-foreground"
                                    }
                                  >
                                    {formatTime(end)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {selectedSlotId === (slot.id || slot.time) &&
                              isAvailable && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <svg
                                      className="w-3 h-3 text-primary"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="font-medium text-base">
                        {slots
                          ? "No slots available for this date"
                          : "Select a date to view available slots"}
                      </p>
                      {slots && (
                        <p className="text-sm text-gray-400 mt-1">
                          Please try selecting another date
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={!selectedSlotId || isRescheduling}
                  className="w-full cursor-pointer bg-gradient-to-r from-[#19CA32] to-[#16b82e] hover:from-[#16b82e] hover:to-[#14a828] text-white font-semibold py-4 text-base rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isRescheduling ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Rescheduling...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Reschedule Booking
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </CustomReusableModal>

      {/* Confirmation Modal */}
      {/* <CustomReusableModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        title={
          confirmModal.status === "ACCEPTED"
            ? "Accept Booking"
            : confirmModal.status === "REJECTED"
            ? "Reject Booking"
            : confirmModal.status === "COMPLETED"
            ? "Complete Booking"
            : confirmModal.status === "CANCELLED"
            ? "Cancel Booking"
            : "Unknown"
        }
        variant={
          confirmModal.status === "ACCEPTED"
            ? "success"
            : confirmModal.status === "REJECTED"
            ? "danger"
            : confirmModal.status === "COMPLETED"
            ? "success"
            : confirmModal.status === "CANCELLED"
            ? "danger"
            : "default"
        }
        icon={
          confirmModal.status === "ACCEPTED" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )
        }
        description={`Are you sure you want to ${confirmModal.status?.toLowerCase()} this booking?`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {confirmModal.status === "ACCEPTED"
              ? `You are about to accept the booking for ${confirmModal.bookingName}. This action cannot be undone.`
              : confirmModal.status === "REJECTED"
              ? `You are about to reject the booking for ${confirmModal.bookingName}. This action cannot be undone.`
              : confirmModal.status === "COMPLETED"
              ? `You are about to complete the booking for ${confirmModal.bookingName}. This action cannot be undone.`
              : confirmModal.status === "CANCELLED"
              ? `You are about to cancel the booking for ${confirmModal.bookingName}. This action cannot be undone.`
              : `You are about to ${confirmModal.status?.toLowerCase()} the booking for ${
                  confirmModal.bookingName
                }. This action cannot be undone.`}
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className={
                confirmModal.status === "ACCEPTED"
                  ? "bg-green-600 cursor-pointer hover:bg-green-700 text-white"
                  : "bg-red-600 cursor-pointer hover:bg-red-700 text-white"
              }
            >
              {isUpdating
                ? "Processing..."
                : confirmModal.status === "ACCEPTED"
                ? "Accept"
                : confirmModal.status === "REJECTED"
                ? "Reject"
                : confirmModal.status === "COMPLETED"
                ? "Complete"
                : confirmModal.status === "CANCELLED"
                ? "Cancel"
                : "Unknown"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isUpdating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomReusableModal> */}
    </div>
  );
}
