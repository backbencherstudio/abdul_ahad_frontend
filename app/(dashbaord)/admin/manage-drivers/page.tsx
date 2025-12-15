"use client";

import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { MoreVertical, Loader2, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { toast } from "react-toastify";
import {
  Driver,
  useDeleteDriverMutation,
  useGetADriverDetailsQuery,
  useGetAllDriversQuery,
  useApproveADriverMutation,
  useRejectADriverMutation,
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

// Separate component for Actions Dropdown
const ActionsDropdown = React.memo(({ 
  row, 
  onApprove, 
  onReject,
  onDelete,
  isApproving, 
  isRejecting,
  isDeleting
}: { 
  row: any;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 cursor-pointer w-8 p-0"
          disabled={isApproving || isRejecting || isDeleting}
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
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(false);
            setTimeout(() => {
              onApprove(row.id, row.name || 'Driver');
            }, 150);
          }}
          className="cursor-pointer"
          disabled={isApproving || isRejecting || isDeleting || row.status === 1}
        >
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(false);
            setTimeout(() => {
              onReject(row.id, row.name || 'Driver');
            }, 150);
          }}
          className="cursor-pointer text-red-600"
          disabled={isApproving || isRejecting || isDeleting || row.status === 0}
        >
          Reject
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(false);
            setTimeout(() => {
              onDelete(row.id, row.name || 'Driver');
            }, 150);
          }}
          className="cursor-pointer text-red-600"
          disabled={isApproving || isRejecting || isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ActionsDropdown.displayName = 'ActionsDropdown';

export default function ManageDrivers() {
  const [activeTab, setActiveTab] = useState<string | number>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [selectedDriverId, setSelectedDriverId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Fetch single driver details for delete modal
  const { data: driverDetailsData, isLoading: isLoadingDriverDetails } = useGetADriverDetailsQuery(
    selectedDriverId || '',
    {
      skip: !openDeleteModal || !selectedDriverId,
      refetchOnMountOrArgChange: true,
    }
  );

  const selectedDriver = driverDetailsData?.data;

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset to first page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  // Get all drivers information
  const { data: apiData, isLoading, refetch } = useGetAllDriversQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    status: activeTab ? String(activeTab) : undefined,
  });

  const [approveDriver, { isLoading: isApproving }] = useApproveADriverMutation();
  const [rejectDriver, { isLoading: isRejecting }] = useRejectADriverMutation();
  const [deleteDriver] = useDeleteDriverMutation();

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    driverId: string | null;
    action: 'approve' | 'reject' | null;
    driverName: string | null;
  }>({
    isOpen: false,
    driverId: null,
    action: null,
    driverName: null,
  });

  // Get drivers data from API
  const driverData = apiData?.data?.drivers || [];
  const pagination = apiData?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const totalPages = pagination.pages || 1;
  const totalItems = pagination.total || 0;

  const handleApproveDriver = async (id: string, driverName: string) => {
    setConfirmModal({
      isOpen: true,
      driverId: id,
      action: 'approve',
      driverName: driverName,
    });
  };

  const handleRejectDriver = async (id: string, driverName: string) => {
    setConfirmModal({
      isOpen: true,
      driverId: id,
      action: 'reject',
      driverName: driverName,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.driverId || !confirmModal.action) return;

    try {
      if (confirmModal.action === 'approve') {
        const response = await approveDriver(confirmModal.driverId).unwrap();
        toast.success(response?.message || "Driver approved successfully!");
      } else if (confirmModal.action === 'reject') {
        const response = await rejectDriver(confirmModal.driverId).unwrap();
        toast.success(response?.message || "Driver rejected successfully!");
      }
      setConfirmModal({
        isOpen: false,
        driverId: null,
        action: null,
        driverName: null,
      });
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message || `Failed to ${confirmModal.action} driver`
      );
      setConfirmModal({
        isOpen: false,
        driverId: null,
        action: null,
        driverName: null,
      });
    }
  };

  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      driverId: null,
      action: null,
      driverName: null,
    });
  };

  // DELETE a driver handler
  const handleDeleteDriverClick = (id: string, driverName: string) => {
    setSelectedDriverId(id);
    setOpenDeleteModal(true);
  };

  const handleDeleteDriver = async () => {
    if (!selectedDriverId) return;

    setIsDeleting(true);
    try {
      await deleteDriver(selectedDriverId).unwrap();
      toast.success("Driver deleted successfully");
      setOpenDeleteModal(false);
      setSelectedDriverId(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete driver");
    }
    setIsDeleting(false);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedDriverId(null);
  };

  // PAGINATION
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey === "all" ? "" : tabKey);
    setCurrentPage(1);
  };

  // Define tabs with counts
  const tabs = [
    {
      key: "all",
      label: "All Drivers",
      count: totalItems,
    },
    {
      key: "1",
      label: "Approved",
      count: driverData.filter((driver: any) => driver.status === 1).length,
    },
    {
      key: "0",
      label: "Pending",
      count: driverData.filter((driver: any) => driver.status === 0).length,
    },
  ];

  const columns = [
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
        <DriverDetailsDropdown driverId={row.id} />
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
            className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${
              status === 1
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {status === 1 ? "Approved" : "Pending"}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Created At",
      width: "15%",
      render: (value: string) => {
        if (!value) return 'N/A';
        try {
          return new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return value;
        }
      },
    },
    {
      key: "approved_at",
      label: "Approved At",
      width: "15%",
      render: (value: string) => {
        if (!value) return 'N/A';
        try {
          return new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return value;
        }
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "15%",
      render: (value: string, row: any) => (
        <ActionsDropdown
          row={row}
          onApprove={handleApproveDriver}
          onReject={handleRejectDriver}
          onDelete={handleDeleteDriverClick}
          isApproving={isApproving}
          isRejecting={isRejecting}
          isDeleting={isDeleting}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">List of All Drivers</h1>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Tabs on the left */}
        <nav className="flex flex-wrap gap-2 lg:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-1 rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${
                (activeTab === "" && tab.key === "all") || activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Search on the right */}
        <div className="relative w-full lg:w-auto lg:max-w-md">
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
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full lg:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
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

      {/* Confirmation Modal */}
      <CustomReusableModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        title={confirmModal.action === 'approve' ? 'Approve Driver' : 'Reject Driver'}
        variant={confirmModal.action === 'approve' ? 'success' : 'danger'}
        icon={confirmModal.action === 'approve' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        description={`Are you sure you want to ${confirmModal.action} this driver?`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {confirmModal.action === 'approve'
              ? `You are about to approve the driver "${confirmModal.driverName}". This action cannot be undone.`
              : `You are about to reject the driver "${confirmModal.driverName}". This action cannot be undone.`
            }
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isApproving || isRejecting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isApproving || isRejecting}
              className={confirmModal.action === 'approve'
                ? 'bg-green-600 cursor-pointer hover:bg-green-700 text-white'
                : 'bg-red-600 cursor-pointer hover:bg-red-700 text-white'
              }
            >
              {isApproving || isRejecting
                ? 'Processing...'
                : confirmModal.action === 'approve'
                  ? 'Approve'
                  : 'Reject'
              }
            </Button>
          </div>
        </div>
      </CustomReusableModal>

      {/* DELETE MODAL */}
      <CustomReusableModal
        isOpen={openDeleteModal}
        onClose={handleCloseDeleteModal}
        customHeader={
          <div className="text-black mt-4 text-center p-4 pb-0 rounded-t-lg">
            <h2 className="text-lg font-semibold">Delete Driver Account</h2>
          </div>
        }
        className="max-w-sm"
      >
        <div className="p-6 pt-0">
          {isLoadingDriverDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Loading driver details...</span>
            </div>
          ) : selectedDriver ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this driver? This action cannot be undone.
              </p>

              <div className="space-y-3">
                {/* Driver Name */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Driver Name
                  </label>
                  <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border">
                    {selectedDriver.name || "N/A"}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Email
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                    {selectedDriver.email || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteDriver}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete Driver"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">Failed to load driver details</p>
              <button
                className="mt-4 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                onClick={handleCloseDeleteModal}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </CustomReusableModal>
    </>
  );
}
