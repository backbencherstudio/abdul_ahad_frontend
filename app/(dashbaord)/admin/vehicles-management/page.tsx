"use client";

import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { MoreVertical, Loader2, X, Trash2, Eye, ArrowUpDown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays } from "date-fns";
import {
  useGetAVehicleDetailsQuery,
  useGetAllVehiclesQuery,
  useDeleteVehicleMutation,
} from "@/rtk/api/admin/vehiclesManagements/vehicles-management";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import { toast } from "react-toastify";
import { useAutoReminderSettings } from "@/app/(dashbaord)/_components/Admin/VehiclesManagement/useAutoReminder";
import { useVehicleReminders } from "@/app/(dashbaord)/_components/Admin/VehiclesManagement/useVehicleReminders";
import MotReminderSection from "@/app/(dashbaord)/_components/Admin/VehiclesManagement/MotReminderSection";
import SendReminderModal from "@/app/(dashbaord)/_components/Admin/VehiclesManagement/SendReminderModal";

const DriverDetailsDropdown = React.memo(({ vehicleId }: { vehicleId: string }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { data: vehicleData, isLoading, isError } = useGetAVehicleDetailsQuery(vehicleId || '', {
    skip: !dropdownOpen || !vehicleId,
    refetchOnMountOrArgChange: true,
  });

  const vehicle = vehicleData?.data;
  const singleDriver = vehicle?.user;

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
        {isError && <div className="text-sm text-red-500 py-4">Failed to load vehicle details</div>}
        {!isLoading && !isError && vehicle && singleDriver && (
          <div>
            <DetailRow label="Vehicle Registration" value={vehicle.registration_number} />
            <DetailRow label="Make" value={vehicle.make} />
            <DetailRow label="Model" value={vehicle.model} />
            <DetailRow label="Color" value={vehicle.color} />
            <DetailRow
              label="MOT Expiry Date"
              value={vehicle.mot_expiry_date ? format(new Date(vehicle.mot_expiry_date), "dd/MM/yyyy") : "N/A"}
            />
            <div className="border-t my-3 pt-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Driver Information</div>
              <DetailRow label="Driver Name" value={singleDriver.name} />
              <DetailRow label="Email" value={singleDriver.email} />
              <DetailRow label="Phone Number" value={singleDriver.phone_number || "N/A"} />
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

DriverDetailsDropdown.displayName = 'DriverDetailsDropdown';

// Actions Dropdown Component
const ActionsDropdown = React.memo(({
  vehicleId,
  onDeleteClick,
  onViewDetails,
  isDeleting
}: {
  vehicleId: string;
  onDeleteClick: (id: string) => void;
  onViewDetails: (id: string) => void;
  isDeleting: boolean;
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 cursor-pointer w-8 p-0"
          disabled={isDeleting}
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
        onEscapeKeyDown={() => {
          setDropdownOpen(false);
        }}
      >
        {/* <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(false);
            setTimeout(() => {
              onViewDetails(vehicleId);
            }, 150);
          }}
          className="cursor-pointer"
          disabled={isDeleting}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem> */}
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(false);
            setTimeout(() => {
              onDeleteClick(vehicleId);
            }, 150);
          }}
          className="cursor-pointer text-red-600 focus:text-red-600"
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ActionsDropdown.displayName = 'ActionsDropdown';

const DetailRow = ({ label, value }: { label: string; value: string | null }) => (
  <>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="font-medium text-sm mb-2">{value || "-"}</div>
  </>
);

export default function VehiclesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortByExpiry, setSortByExpiry] = useState<"asc" | "desc" | undefined>(undefined);
  const [expiryStatus, setExpiryStatus] = useState<"all" | "expired" | "expired_soon" | "not_expired">("all");
 
  // Auto Reminder Settings
  const { autoReminderEnabled, reminderDaysInAdvance } = useAutoReminderSettings();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    vehicleId: string | null;
    vehicleRegistration: string | null;
  }>({
    isOpen: false,
    vehicleId: null,
    vehicleRegistration: null,
  });
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    vehicleId: string | null;
  }>({
    isOpen: false,
    vehicleId: null,
  });

  const debouncedSearch = useDebounce(searchTerm, 500);
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate, expiryStatus, sortByExpiry]);

  const { data: apiData, isLoading, refetch } = useGetAllVehiclesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    sort_by_expiry: sortByExpiry,
    expiry_status: expiryStatus !== "all" ? expiryStatus : undefined,
  });

  const vehiclesData = (apiData?.data as any)?.vehicles || [];
  const driverData = vehiclesData.map((vehicle: any) => ({
    id: vehicle.id,
    driverId: vehicle.user?.id || vehicle.id,
    name: vehicle.user?.name || '',
    email: vehicle.user?.email || '',
    phone_number: vehicle.user?.phone_number || null,
    vehicle_registration_number: vehicle.registration_number || null,
    mot_expiry_date: vehicle.mot_expiry_date || null,
  }));

  // Get vehicles needing reminders
  const { needsReminderCount, vehiclesNeedingReminder } = useVehicleReminders({
    vehicles: driverData,
    autoReminderEnabled,
    reminderDaysInAdvance,
  });

  const pagination = apiData?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? new Set(driverData.map((row: any) => row.id)) : new Set());
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      checked ? newSet.add(rowId) : newSet.delete(rowId);
      return newSet;
    });
  };

  const isAllSelected = driverData.length > 0 && selectedRows.size === driverData.length;

  const handleReminderSuccess = () => {
    setSelectedRows(new Set());
  };

  const getSelectedDriverData = () => {
    return driverData.filter((driver: any) => selectedRows.has(driver.id));
  };

  const handleDeleteClick = (vehicleId: string) => {
    const vehicle = vehiclesData.find((v: any) => v.id === vehicleId);
    setDeleteModal({
      isOpen: true,
      vehicleId,
      vehicleRegistration: vehicle?.registration_number || 'Vehicle',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.vehicleId) return;

    try {
      await deleteVehicle(deleteModal.vehicleId).unwrap();
      toast.success('Vehicle deleted successfully!');
      setDeleteModal({
        isOpen: false,
        vehicleId: null,
        vehicleRegistration: null,
      });
      refetch();
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.data?.message)
        ? error.data.message.join(', ')
        : error?.data?.message || 'Failed to delete vehicle';
      toast.error(errorMessage);
      setDeleteModal({
        isOpen: false,
        vehicleId: null,
        vehicleRegistration: null,
      });
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      vehicleId: null,
      vehicleRegistration: null,
    });
  };

  const handleViewDetails = (vehicleId: string) => {
    setViewDetailsModal({
      isOpen: true,
      vehicleId,
    });
  };

  const handleCloseViewDetailsModal = () => {
    setViewDetailsModal({
      isOpen: false,
      vehicleId: null,
    });
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
    { key: "email", label: "Email", width: "20%" },
    { key: "phone_number", label: "Phone", width: "15%", render: (value: any) => value || "—" },
    { key: "vehicle_registration_number", label: "Vehicle Number", width: "15%", render: (value: any) => value || "—" },
    {
      key: "mot_expiry_date",
      label: "MOT Date",
      width: "20%",
      render: (value: any, row: any) => {
        if (!value) return "—";
        try {
          const expiryDate = new Date(value);
          const today = new Date();
          const daysUntilExpiry = differenceInDays(expiryDate, today);
          const needsReminder = vehiclesNeedingReminder.some((v) => v.id === row.id);

          let statusClass = "";
          let statusText = "";

          if (daysUntilExpiry < 0) {
            statusClass = "text-red-600 font-semibold";
            statusText = " (Expired)";
          } else if (daysUntilExpiry <= 7) {
            statusClass = "text-red-500 font-semibold";
            statusText = " (Due Soon)";
          } else if (daysUntilExpiry <= 30) {
            statusClass = "text-orange-500";
            statusText = " (Due This Month)";
          } else if (needsReminder) {
            statusClass = "text-yellow-600";
            statusText = " (Reminder Due)";
          }

          return (
            <div className={statusClass}>
              {format(expiryDate, "dd/MM/yyyy")}
              {statusText && <span className="text-xs ml-1">{statusText}</span>}
            </div>
          );
        } catch {
          return "—";
        }
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      render: (_: string, row: any) => (
        <ActionsDropdown
          vehicleId={row.id}
          onDeleteClick={handleDeleteClick}
          onViewDetails={handleViewDetails}
          isDeleting={isDeleting}
        />
      ),
    },
  ];

  const handleSendReminderClick = () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one driver");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <MotReminderSection
        selectedRowsCount={selectedRows.size}
        needsReminderCount={needsReminderCount}
        onSendReminderClick={handleSendReminderClick}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Drivers List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">List of All Vehicles</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0 lg:min-w-[300px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search drivers, vehicles, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:border-transparent text-sm transition-all h-10"
              />
            </div>
            {/* Sort Dropdown */}
            <Select 
              value={sortByExpiry || "none"} 
              onValueChange={(value) => setSortByExpiry(value === "none" ? undefined : value as "asc" | "desc")}
            >
              <SelectTrigger className="h-10 w-[160px] border-gray-300">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Sort</SelectItem>
                <SelectItem value="asc">Earliest First</SelectItem>
                <SelectItem value="desc">Latest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg p-1.5 shadow-sm">
            <button
              onClick={() => setExpiryStatus("all")}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all duration-200 ${
                expiryStatus === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Vehicles
            </button>
            <button
              onClick={() => setExpiryStatus("expired")}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all duration-200 ${
                expiryStatus === "expired"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => setExpiryStatus("expired_soon")}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all duration-200 ${
                expiryStatus === "expired_soon"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Expired Soon
            </button>
            <button
              onClick={() => setExpiryStatus("not_expired")}
              className={`px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-all duration-200 ${
                expiryStatus === "not_expired"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Not Expired
            </button>
          </div>
        </div>

        <ReusableTable
          data={driverData}
          columns={columns}
          className="mb-4"
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
      </div>

      <SendReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRowsCount={selectedRows.size}
        selectedDriverData={getSelectedDriverData()}
        onSuccess={handleReminderSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle"
        description={`Are you sure you want to delete vehicle with registration number ${deleteModal.vehicleRegistration}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* View Details Modal */}
      <Dialog open={viewDetailsModal.isOpen} onOpenChange={handleCloseViewDetailsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
            <DialogDescription>
              View detailed information about the vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewDetailsModal.vehicleId && (
              <VehicleDetailsContent vehicleId={viewDetailsModal.vehicleId} />
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseViewDetailsModal}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Vehicle Details Content Component
const VehicleDetailsContent = ({ vehicleId }: { vehicleId: string }) => {
  const { data: vehicleData, isLoading, isError } = useGetAVehicleDetailsQuery(vehicleId);

  const vehicle = vehicleData?.data;
  const singleDriver = vehicle?.user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading vehicle details...</span>
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="text-sm text-red-500 py-4">Failed to load vehicle details</div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehicle Information</h3>
        <div className="space-y-2">
          <DetailRow label="Vehicle Registration" value={vehicle.registration_number} />
          <DetailRow label="Make" value={vehicle.make} />
          <DetailRow label="Model" value={vehicle.model} />
          <DetailRow label="Color" value={vehicle.color} />
          <DetailRow
            label="MOT Expiry Date"
            value={vehicle.mot_expiry_date ? format(new Date(vehicle.mot_expiry_date), "dd/MM/yyyy") : "N/A"}
          />
        </div>
      </div>
      {singleDriver && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Driver Information</h3>
          <div className="space-y-2">
            <DetailRow label="Driver Name" value={singleDriver.name} />
            <DetailRow label="Email" value={singleDriver.email} />
            <DetailRow label="Phone Number" value={singleDriver.phone_number || "N/A"} />
          </div>
        </div>
      )}
    </div>
  );
};

