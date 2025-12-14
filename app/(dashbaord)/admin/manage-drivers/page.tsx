"use client";

import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { MoreVertical, Loader2, CalendarIcon, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useGetADriverDetailsQuery,
  useGetAllDriversQuery,
} from "@/rtk/api/admin/driverManagement/driver-managementApis";
import { useSendReminderToDriversMutation } from "@/rtk/api/admin/vehiclesManagements/reminderApis";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

const DriverDetailsDropdown = React.memo(({ driverId }: { driverId: string }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { data: driverData, isLoading, isError } = useGetADriverDetailsQuery(driverId || '', {
    skip: !dropdownOpen || !driverId,
    refetchOnMountOrArgChange: true,
  });

  const singleDriver = driverData?.data;

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-4 space-y-2 max-h-[500px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        )}
        {isError && <div className="text-sm text-red-500 py-4">Failed to load driver details</div>}
        {!isLoading && !isError && singleDriver && (
          <div>
            <DetailRow label="Driver Name" value={singleDriver.name} />
            <DetailRow label="Email" value={singleDriver.email} />
            <DetailRow label="Phone Number" value={singleDriver.phone_number || "N/A"} />
            <DetailRow
              label="Address"
              value={[
                singleDriver.address,
                singleDriver.city,
                singleDriver.state,
                singleDriver.country,
                singleDriver.zip_code,
              ].filter(Boolean).join(", ") || "N/A"}
            />
            <DetailRow label="Status" value={singleDriver.status === 1 ? "Active" : "Inactive"} />
            <DetailRow
              label="Created At"
              value={singleDriver.created_at ? format(new Date(singleDriver.created_at), "dd/MM/yyyy HH:mm") : "N/A"}
            />
            <DetailRow
              label="Approved At"
              value={singleDriver.approved_at ? format(new Date(singleDriver.approved_at), "dd/MM/yyyy HH:mm") : "N/A"}
            />
            {singleDriver.vehicles && singleDriver.vehicles.length > 0 && (
              <div className="border-t my-3 pt-3">
                <div className="text-xs font-semibold text-gray-700 mb-2">Vehicles ({singleDriver.vehicles.length})</div>
                {singleDriver.vehicles.map((vehicle: any, index: number) => (
                  <div key={index} className="mb-2 text-xs">
                    <div className="font-medium">{vehicle.registration_number || vehicle.vehicle_registration_number}</div>
                    <div className="text-gray-500">{vehicle.make || vehicle.vehicle_make} {vehicle.model || vehicle.vehicle_model}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

DriverDetailsDropdown.displayName = 'DriverDetailsDropdown';

const DetailRow = ({ label, value }: { label: string; value: string | null }) => (
  <>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="font-medium text-sm mb-2">{value || "-"}</div>
  </>
);

const DatePicker = ({ date, onDateChange, placeholder }: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal min-w-[200px]", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{date ? format(date, "dd/MM/yyyy") : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(selectedDate);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default function DriversManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 500);
  const [sendReminder, { isLoading: isSending }] = useSendReminderToDriversMutation();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const { data: apiData, isLoading } = useGetAllDriversQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const driversData = apiData?.data?.drivers || [];
  const tableData = driversData.map((driver: any) => ({
    id: driver.id,
    name: driver.name || '',
    email: driver.email || '',
    phone_number: driver.phone_number || null,
    status: driver.status,
    created_at: driver.created_at || null,
    approved_at: driver.approved_at || null,
  }));

  const pagination = apiData?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? new Set(tableData.map((row: any) => row.id)) : new Set());
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      checked ? newSet.add(rowId) : newSet.delete(rowId);
      return newSet;
    });
  };

  const isAllSelected = tableData.length > 0 && selectedRows.size === tableData.length;

  const handleSendReminder = async () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one driver");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const selectedDrivers = tableData.filter((driver: any) => selectedRows.has(driver.id));
      const receivers = selectedDrivers.map((driver: any) => ({
        receiver_id: driver.id,
        entity_id: driver.id,
      }));

      await sendReminder({ receivers, message }).unwrap();
      toast.success(`Reminder sent successfully to ${receivers.length} driver(s)`);
      setIsModalOpen(false);
      setSelectedRows(new Set());
      setMessage("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send reminder");
    }
  };

  const columns = [
    {
      key: "checkbox",
      label: (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      ),
      width: "5%",
      render: (_: string, row: any) => (
        <Checkbox
          checked={selectedRows.has(row.id)}
          onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      ),
    },
    { key: "name", label: "Driver Name", width: "20%" },
    {
      key: "driver_details",
      label: "Driver Details",
      width: "15%",
      render: (_: string, row: any) => <DriverDetailsDropdown driverId={row.id} />,
    },
    { key: "email", label: "Email", width: "20%" },
    { key: "phone_number", label: "Phone", width: "15%", render: (value: any) => value || "—" },
    {
      key: "status",
      label: "Status",
      width: "10%",
      render: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      width: "15%",
      render: (value: any) => {
        if (!value) return "—";
        try {
          return format(new Date(value), "dd/MM/yyyy");
        } catch {
          return "—";
        }
      },
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl lg:text-2xl font-semibold">MOT Reminder</h1>
            <Button
              onClick={() => {
                if (selectedRows.size === 0) {
                  toast.error("Please select at least one driver");
                  return;
                }
                setIsModalOpen(true);
              }}
              disabled={selectedRows.size === 0}
              className="bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium px-4 lg:px-6 py-2 rounded-lg transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Reminder ({selectedRows.size})
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 lg:flex-initial min-w-0">
            <DateFilter label="Start Date" date={startDate} onDateChange={setStartDate} />
            <DateFilter label="End Date" date={endDate} onDateChange={setEndDate} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 py-2">
        <h1 className="text-2xl font-semibold order-2 lg:order-1 text-left">List of All Drivers</h1>
        <div className="relative w-full lg:w-80 order-1 lg:order-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
          />
        </div>
      </div>

      <>
        <ReusableTable
          data={tableData}
          columns={columns}
          className="mt-5"
          isLoading={isLoading}
          skeletonRows={itemsPerPage}
        />
        {!isLoading && (
          <ReusablePagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            itemsPerPage={itemsPerPage}
            totalItems={pagination.total}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </>

      {/* Send Reminder Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send MOT Reminder</DialogTitle>
            <DialogDescription>
              Send reminder notification to {selectedRows.size} selected driver(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your reminder message..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none"
              />
            </div>
            <div className="text-sm text-gray-500">
              This reminder will be sent to {selectedRows.size} driver(s)
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendReminder}
              disabled={isSending || !message.trim()}
              className="bg-[#19CA32] hover:bg-[#16b82e] text-white"
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
    </>
  );
}

const DateFilter = ({ label, date, onDateChange }: {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}) => (
  <div className="flex-1 min-w-0 max-w-full sm:max-w-[280px]">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="flex gap-3 items-center">
      <div className="flex-1 min-w-0">
        <DatePicker date={date} onDateChange={onDateChange} placeholder="mm/dd/yyyy" />
      </div>
      {date && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={() => onDateChange(undefined)}
          title={`Clear ${label.toLowerCase()}`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);
