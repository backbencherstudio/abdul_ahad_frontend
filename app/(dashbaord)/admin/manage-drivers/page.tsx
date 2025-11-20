"use client";

import React, { useEffect, useState, useMemo } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { toast } from "react-toastify";
import { Eye, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Driver,
  useDeleteDriverMutation,
  useGetADriverDetailsQuery,
  useGetAllDriversQuery,
} from "@/rtk/api/admin/drivers-management/allDriversList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ManageDrivers() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectAllCheckboxRef = React.useRef<any>(null);
  const [currentDriverId, setCurrentDriverId] = React.useState<any>(null);

  // Modals
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [selectedDriver, setSelectedDriver] = React.useState<any>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Date filters
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startPopoverOpen, setStartPopoverOpen] = useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  //   Get all drivers information
  const { data: apiData, isLoading } = useGetAllDriversQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });
  // Get a specific driver details

  const { data: getADriverData, isLoading: driverDataStatus } =
    useGetADriverDetailsQuery({
      id: currentDriverId,
    });
  const [deleteDriver] = useDeleteDriverMutation();

  const driverData = apiData?.data?.drivers ?? [];
  const pagination = apiData?.data?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };
  const tabs = [
    { key: "all", label: "All", count: driverData.length },
    { key: "send", label: "Send", count: 0 },
    { key: "default", label: "Default", count: 0 },
    { key: "failed", label: "Failed", count: 0 },
  ];

  const isAllSelected =
    driverData.length > 0 &&
    driverData.every((row) => selectedIds.includes(row.id));

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const allIds = driverData.map((d) => d.id);
      setSelectedIds(allIds);
    }
  };

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const el = selectAllCheckboxRef.current.querySelector(
        'input[type="checkbox"]'
      );
      if (el) el.indeterminate = selectedIds.length > 0 && !isAllSelected;
    }
  }, [selectedIds, isAllSelected]);

  const handleCurrentGarageId = (id) => {
    setCurrentDriverId(id);
  };

  // PAGINATION
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  // DELETE a driver handler
  const handleDeleteDriver = async () => {
    if (!selectedDriver) return;

    setIsDeleting(true);
    try {
      await deleteDriver(selectedDriver.id).unwrap();
      toast.success("Driver deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete driver");
    }
    setIsDeleting(false);
    setOpenDeleteModal(false);
  };

  const columns = [
    { key: "name", label: "Driver Name", width: "18%" },
    { key: "email", label: "Email", width: "20%" },
    {
      key: "phone_number",
      label: "Contact Number",
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
      key: "country",
      label: "Country",
      width: "15%",
      render: (value: any) => (value ? value : "—"),
    },
    {
      key: "status",
      label: "Status",
      width: "10%",
      render: (value: number) => (
        <span
          className={`px-3 rounded-full my-4 font-medium ${
            value === 1
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {value === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const columnsWithCheckbox = [
    {
      key: "select",
      label: (
        <Checkbox
          ref={selectAllCheckboxRef}
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          className="cursor-pointer"
        />
      ),
      width: "40px",
      render: (_: any, row: any) => (
        <Checkbox
          checked={selectedIds.includes(row.id)}
          onCheckedChange={() => handleSelectRow(row.id)}
          className="cursor-pointer"
        />
      ),
    },
    ...columns,
  ];
  const actions = [
    {
      label: "",
      render: (row: Driver) => (
        <>
          {/* DELETE BUTTON */}
          <Button
            variant="ghost"
            className="h-6 w-6 cursor-pointer p-0 flex items-center justify-center bg-red-100 border border-red-300 text-red-600 hover:bg-red-100"
            onClick={() => {
              setSelectedDriver(row);
              setOpenDeleteModal(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* VIEW DETAILS DROPDOWN */}
          <DropdownMenu
            onOpenChange={(isOpen) => {
              if (isOpen) setCurrentDriverId(row.id); // fetch driver details here
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-6 w-6 cursor-pointer p-0 flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 sm:w-80 max-h-80 overflow-y-auto p-4 space-y-3 rounded-md shadow-lg"
            >
              {/* Waiting for API */}
              {driverDataStatus === true && (
                <div className="text-xs text-gray-500">Loading...</div>
              )}

              {/* Loaded */}
              {getADriverData?.success === true && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name</p>
                    <p className="text-sm font-medium">
                      {getADriverData?.data?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm">
                      {getADriverData?.data?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-sm">
                      {getADriverData?.data?.phone_number || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm">
                      {[
                        getADriverData?.data?.address,
                        getADriverData?.data?.city,
                        getADriverData?.data?.state,
                        getADriverData?.data?.country,
                        getADriverData?.data?.zip_code,
                      ]
                        .filter(Boolean)
                        .join(", ") || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="text-sm">
                      {getADriverData?.data?.status === 1
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                    <p className="text-sm">
                      {new Date(
                        getADriverData?.data?.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Approved At</p>
                    <p className="text-sm">
                      {getADriverData?.data?.approved_at
                        ? new Date(
                            getADriverData?.data?.approved_at
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <h1 className="text-2xl font-semibold">List of All Drivers</h1>

        {/* ===== DATE FILTER BAR ===== */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* START DATE */}
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">Start Date</span>
            <div className="flex items-center">
              <Popover
                open={startPopoverOpen}
                onOpenChange={setStartPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-40 justify-start text-left font-normal"
                  >
                    {startDate ? format(startDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={tempStartDate || startDate || undefined}
                    onSelect={setTempStartDate}
                  />
                  <div className="flex justify-between p-2 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTempStartDate(startDate);
                        setStartPopoverOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#19CA32] text-white"
                      disabled={!tempStartDate}
                      onClick={() => {
                        setStartDate(tempStartDate);
                        setStartPopoverOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {startDate && (
                <button
                  className="ml-2 text-xs text-gray-500 hover:text-red-500"
                  onClick={() => {
                    setStartDate(null);
                    setTempStartDate(null);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* END DATE */}
          <div className="flex flex-col">
            <span className="text-xs font-medium mb-1">End Date</span>
            <div className="flex items-center">
              <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-40 justify-start text-left font-normal"
                  >
                    {endDate ? format(endDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={tempEndDate || endDate || undefined}
                    onSelect={setTempEndDate}
                  />
                  <div className="flex justify-between p-2 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTempEndDate(endDate);
                        setEndPopoverOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#19CA32] text-white"
                      disabled={!tempEndDate}
                      onClick={() => {
                        setEndDate(tempEndDate);
                        setEndPopoverOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              {endDate && (
                <button
                  className="ml-2 text-xs text-gray-500 hover:text-red-500"
                  onClick={() => {
                    setEndDate(null);
                    setTempEndDate(null);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS + SEARCH BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Tabs */}
        <nav className="flex gap-4 bg-[#F5F5F6] rounded-[10px] p-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1 rounded-[6px] text-sm font-medium ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>

        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 bg-white py-2 w-full border rounded-lg text-sm"
          />
          <div className="absolute left-3 top-2.5 opacity-50">
            <svg width="18" height="18" fill="none" stroke="currentColor">
              <circle cx="8" cy="8" r="6" />
              <line x1="14" y1="14" x2="20" y2="20" />
            </svg>
          </div>
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
        <ReusableTable
          data={driverData}
          columns={columnsWithCheckbox}
          actions={actions}
          className="mt-5"
        />
      )}

      {/* PAGINATION */}
      {driverData.length > 0 && (
        <ReusablePagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          itemsPerPage={pagination.limit}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* DELETE MODAL */}
      <CustomReusableModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        customHeader={
          <div className="text-black mt-4 text-center p-4 pb-0 rounded-t-lg">
            <h2 className="text-lg font-semibold">Delete Driver Account</h2>
          </div>
        }
        className="max-w-sm"
      >
        <div className="p-6 pt-0">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this driver?
          </p>

          <div className="space-y-3">
            {/* Driver Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                className="w-full border rounded-md p-2"
                value={selectedDriver?.name || ""}
                readOnly
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                className="w-full border rounded-md p-2"
                value={selectedDriver?.email || ""}
                readOnly
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                className="w-full border rounded-md p-2"
                value={selectedDriver?.phone_number || ""}
                readOnly
              />
            </div>
          </div>

          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md mt-4"
            onClick={handleDeleteDriver}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </CustomReusableModal>
    </>
  );
}
