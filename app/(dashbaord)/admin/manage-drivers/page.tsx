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
} from "@/rtk/api/admin/drivers-management/allDriversList";

// Separate component for Driver Details Dropdown
const DriverDetailsDropdown = React.memo(({ driverId }: { driverId: string }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const { data: driverData, isLoading, isError } = useGetADriverDetailsQuery(
    driverId || '',
    {
      skip: !dropdownOpen || !driverId,
      refetchOnMountOrArgChange: true,
    }
  );

  const singleDriver = driverData?.data;

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 cursor-pointer w-8 p-0"
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
        className="w-64 p-4 space-y-2 max-h-[500px] overflow-y-auto"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading...</span>
          </div>
        )}

        {isError && (
          <div className="text-sm text-red-500 py-4">
            Failed to load driver details
          </div>
        )}

        {!isLoading && !isError && singleDriver && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Driver Name</div>
            <div className="font-medium text-sm mb-2">
              {singleDriver.name || "-"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Email</div>
            <div className="mb-2 text-sm">
              {singleDriver.email || "-"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Phone Number</div>
            <div className="mb-2 text-sm">
              {singleDriver.phone_number || "-"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className="mb-2 text-sm">
              {[
                singleDriver.address,
                singleDriver.city,
                singleDriver.state,
                singleDriver.country,
                singleDriver.zip_code,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className="mb-2 text-sm">
              {singleDriver.status === 1 ? "Active" : "Inactive"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Created At</div>
            <div className="mb-2 text-sm">
              {singleDriver.created_at
                ? new Date(singleDriver.created_at).toLocaleString()
                : "N/A"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Approved At</div>
            <div className="mb-2 text-sm">
              {singleDriver.approved_at
                ? new Date(singleDriver.approved_at).toLocaleString()
                : "N/A"}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

DriverDetailsDropdown.displayName = 'DriverDetailsDropdown';

// Date Picker Component
const DatePicker = ({
  date,
  onDateChange,
  placeholder
}: {
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
          className={cn(
            "w-full justify-start text-left font-normal min-w-[200px]",
            !date && "text-muted-foreground"
          )}
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

export default function ManageDrivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset to first page when search or date filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate]);

  // Format dates for API (YYYY-MM-DD)
  const startDateString = startDate ? format(startDate, "yyyy-MM-dd") : "";
  const endDateString = endDate ? format(endDate, "yyyy-MM-dd") : "";

  // Get all drivers information
  const { data: apiData, isLoading } = useGetAllDriversQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    startdate: startDateString || undefined,
    enddate: endDateString || undefined,
  });

  // Get vehicles data from API and transform to driver format
  const vehiclesData = (apiData?.data as any)?.vehicles || [];

  // Transform vehicles data to match table structure
  // Use vehicle.id as the unique key since one driver can have multiple vehicles
  const driverData = vehiclesData.map((vehicle: any) => ({
    id: vehicle.id, // Use vehicle ID as unique key for React
    driverId: vehicle.user?.id || vehicle.id, // Store driver ID separately for operations
    name: vehicle.user?.name || '',
    email: vehicle.user?.email || '',
    phone_number: vehicle.user?.phone_number || null,
    vehicle_registration_number: vehicle.registration_number || null,
    vehicle_make: vehicle.make || null,
    vehicle_model: vehicle.model || null,
    status: vehicle.user?.status ?? 0, // Default to 0 (pending) if not available
    created_at: vehicle.user?.created_at || vehicle.created_at || '',
    approved_at: vehicle.user?.approved_at || null,
    // Keep original vehicle and user for reference
    _vehicle: vehicle,
    _user: vehicle.user,
  }));

  const pagination = apiData?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const totalPages = pagination.pages || 1;
  const totalItems = pagination.total || 0;

  // Checkbox handlers
  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set<string>(driverData.map((row: any) => row.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set<string>());
    }
  };

  const isAllSelected = driverData.length > 0 && selectedRows.size === driverData.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < driverData.length;

  // PAGINATION
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
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
      render: (value: string, row: any) => (
        <Checkbox
          checked={selectedRows.has(row.id)}
          onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      ),
    },
    {
      key: "name",
      label: "Driver Name",
      width: "20%",
    },
    {
      key: "driver_details",
      label: "Driver Details",
      width: "15%",
      render: (value: string, row: any) => (
        <DriverDetailsDropdown driverId={row.driverId || row._user?.id || row.id} />
      ),
    },
    {
      key: "email",
      label: "Email",
      width: "20%",
    },
    {
      key: "phone_number",
      label: "Phone",
      width: "15%",
      render: (value: any) => value || "—",
    },
    {
      key: "vehicle_registration_number",
      label: "Vehicle Number",
      width: "15%",
      render: (value: any) => value || "—",
    },
    {
      key: "status",
      label: "Status",
      width: "10%",
      render: (value: any) => {
        const status = typeof value === 'string' ? parseInt(value) : value;
        return (
          <span
            className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${status === 1
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
              }`}
          >
            {status === 1 ? "Approved" : "Pending"}
          </span>
        );
      },
    },
  ];

  return (
    <>


      {/* Filters Section - Fully Responsive */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Main Row - MOT Reminder (left) and Date Filters (right) in same line */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 w-full">

          {/* Left Side - MOT Reminder Section - Show only when rows are selected */}
         
            <div className="flex flex-col gap-2">
              <h1 className="text-xl lg:text-2xl font-semibold">MOT Reminder</h1>
              <Button
                className="bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium px-4 lg:px-6 py-2 rounded-lg transition-colors w-full sm:w-auto"
              >
                Send Reminder ({selectedRows.size})
              </Button>
            </div>
       
     

          {/* Right Side - Date Filters in same row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 lg:flex-initial min-w-0">
            {/* Start Date */}
            <div className="flex-1 min-w-0 max-w-full sm:max-w-[280px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="flex gap-3 items-center">
                <div className="flex-1 min-w-0">
                  <DatePicker
                    date={startDate}
                    onDateChange={setStartDate}
                    placeholder="mm/dd/yyyy"
                  />
                </div>
                {startDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setStartDate(undefined)}
                    title="Clear start date"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* End Date */}
            <div className="flex-1 min-w-0 max-w-full sm:max-w-[280px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="flex gap-3 items-center">
                <div className="flex-1 min-w-0">
                  <DatePicker
                    date={endDate}
                    onDateChange={setEndDate}
                    placeholder="mm/dd/yyyy"
                  />
                </div>
                {endDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setEndDate(undefined)}
                    title="Clear end date"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 py-2">
        {/* Title */}
        <h1 className="text-2xl font-semibold order-2 lg:order-1 text-left">
          List of All Drivers
        </h1>

        {/* Search */}
        <div className="relative w-full lg:w-80 order-1 lg:order-2">
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
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
          />
        </div>
      </div>


      {/* TABLE */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600 font-medium">
            Loading drivers...
          </span>
        </div>
      ) : (
        <>
          <ReusableTable
            data={driverData}
            columns={columns}
            className="mt-5"
          />
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className=""
          />
        </>
      )}
    </>
  );
}
