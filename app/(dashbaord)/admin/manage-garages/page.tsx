"use client";
import React, { useState, useMemo, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { MoreVertical, Trash2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
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
  useApproveAGarageMutation,
  useRejectAGarageMutation,
  useGetAGarageByIdQuery,
  useGetAllGaragesQuery,
} from "@/rtk/api/admin/garages-management/listAllGarageApi";

const BRAND_COLOR = "#19CA32";
const BRAND_COLOR_HOVER = "#16b82e";
const DANGER_COLOR = "#F04438";

// Separate component for Garage Details Dropdown
const GarageDetailsDropdown = React.memo(({ garageId }: { garageId: string }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  
  const { data: garageData, isLoading, isError } = useGetAGarageByIdQuery(
    garageId || '',
    {
      skip: !dropdownOpen || !garageId,
      refetchOnMountOrArgChange: true,
    }
  );

  const singleGarage = garageData?.data;

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
            Failed to load garage details
          </div>
        )}

        {!isLoading && !isError && singleGarage && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Garage Name</div>
            <div className="font-medium text-sm mb-2">
              {singleGarage.garage_name || "-"}
            </div>

            <div className="text-xs text-gray-500 mb-1">
              Primary Contact Person
            </div>
            <div className="font-medium text-sm mb-2">
              {singleGarage.primary_contact || "-"}
            </div>

            <div className="text-xs text-gray-500 mb-1">VTS Number</div>
            <div className="mb-2 text-sm">
              {singleGarage.vts_number || "-"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Email</div>
            <div className="mb-2 text-sm">
              {singleGarage.email || "-"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Phone Number</div>
            <div className="mb-2 text-sm">
              {singleGarage.phone_number || "-"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className="mb-2 text-sm">
              {[
                singleGarage.address,
                singleGarage.city,
                singleGarage.state,
                singleGarage.country,
                singleGarage.zip_code,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className="mb-2 text-sm">
              {singleGarage.status === 1 ? "Active" : "Inactive"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Created At</div>
            <div className="mb-2 text-sm">
              {singleGarage.created_at
                ? new Date(singleGarage.created_at).toLocaleString()
                : "N/A"}
            </div>

            <div className="text-xs text-gray-500 mb-1">Approved At</div>
            <div className="mb-2 text-sm">
              {singleGarage.approved_at
                ? new Date(singleGarage.approved_at).toLocaleString()
                : "N/A"}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

GarageDetailsDropdown.displayName = 'GarageDetailsDropdown';

// Separate component for Actions Dropdown
const ActionsDropdown = React.memo(({ 
  row, 
  onApprove, 
  onReject, 
  isApproving, 
  isRejecting 
}: { 
  row: any;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 cursor-pointer w-8 p-0"
          disabled={isApproving || isRejecting}
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
              onApprove(row.id, row.garage_name || 'Garage');
            }, 150);
          }}
          className="cursor-pointer"
          disabled={isApproving || isRejecting || row.status === 1}
        >
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(false);
            setTimeout(() => {
              onReject(row.id, row.garage_name || 'Garage');
            }, 150);
          }}
          className="cursor-pointer text-red-600"
          disabled={isApproving || isRejecting || row.status === 0}
        >
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ActionsDropdown.displayName = 'ActionsDropdown';

export default function ManageGarages() {
  const [activeTab, setActiveTab] = useState<string | number>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openMessageModal, setOpenMessageModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [selectedGarage, setSelectedGarage] = React.useState<any>(null);

  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset to first page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const garagesInfo = useGetAllGaragesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    status: activeTab ? String(activeTab) : undefined,
  });

  const [approveGarage, { isLoading: isApproving }] =
    useApproveAGarageMutation();
  
  const [rejectGarage, { isLoading: isRejecting }] =
    useRejectAGarageMutation();

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    garageId: string | null;
    action: 'approve' | 'reject' | null;
    garageName: string | null;
  }>({
    isOpen: false,
    garageId: null,
    action: null,
    garageName: null,
  });

  // Get garages data from API
  const garagesData = garagesInfo?.data?.data?.garages || [];
  const pagination = garagesInfo?.data?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const totalPages = pagination.pages || 1;
  const totalItems = pagination.total || 0;

  const handleApproveGarage = async (id: string, garageName: string) => {
    setConfirmModal({
      isOpen: true,
      garageId: id,
      action: 'approve',
      garageName: garageName,
    });
  };

  const handleRejectGarage = async (id: string, garageName: string) => {
    setConfirmModal({
      isOpen: true,
      garageId: id,
      action: 'reject',
      garageName: garageName,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.garageId || !confirmModal.action) return;

    try {
      if (confirmModal.action === 'approve') {
        const response = await approveGarage(confirmModal.garageId).unwrap();
        toast.success(response?.message || "Garage approved successfully!");
      } else if (confirmModal.action === 'reject') {
        const response = await rejectGarage(confirmModal.garageId).unwrap();
        toast.success(response?.message || "Garage rejected successfully!");
      }
      setConfirmModal({
        isOpen: false,
        garageId: null,
        action: null,
        garageName: null,
      });
      garagesInfo.refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message || `Failed to ${confirmModal.action} garage`
      );
      setConfirmModal({
        isOpen: false,
        garageId: null,
        action: null,
        garageName: null,
      });
    }
  };

  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      garageId: null,
      action: null,
      garageName: null,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey === "all" ? "" : tabKey);
    setCurrentPage(1); // Reset to first page when tab changes
  };

  // Define tabs with counts
  const tabs = [
    {
      key: "all",
      label: "All Garages",
      count: totalItems,
    },
    {
      key: "1",
      label: "Approved",
      count: garagesData.filter((garage: any) => garage.status === 1).length,
    },
    {
      key: "0",
      label: "Pending",
      count: garagesData.filter((garage: any) => garage.status === 0).length,
    },
  ];

  const columns = [
    {
      key: "garage_name",
      label: "Garage Name",
      width: "30%",
    },

    {
      key: "garage_details",
      label: "Garage Details",
      width: "15%",
      render: (value: string, row: any) => (
        <GarageDetailsDropdown garageId={row.id} />
      ),
    },
    {
      key: "primary_contact",
      label: "Primary Contact",
      width: "15%",
    },
    {
      key: "phone_number",
      label: "Phone",
      width: "15%",
    },
    {
      key: "email",
      label: "Email",
      width: "15%",
    },
    {
      key: "status",
      label: "Status",
      width: "15%",
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
          onApprove={handleApproveGarage}
          onReject={handleRejectGarage}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      ),
    },
  ];

  // Send Message Handler
  const handleSendMessage = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setOpenMessageModal(false);
      setMessage("");
      toast.success("Message sent successfully!");
    }, 1500);
  };

  // Delete Garage Handler
  const handleDeleteGarage = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setOpenDeleteModal(false);
      toast.success("Garage deleted successfully!");
    }, 1500);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">List of All Garages</h1>
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
            placeholder="Search garages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full lg:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>
      {garagesInfo.isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600 font-medium">
            Loading garages...
          </span>
        </div>
      ) : (
        <>
          <ReusableTable
            data={garagesData}
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

      {/* Send Message Modal */}
      <CustomReusableModal
        isOpen={openMessageModal}
        onClose={() => setOpenMessageModal(false)}
        title="Send Message"
        showHeader={false}
        className="max-w-sm border-green-600"
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div
            className={`bg-[${BRAND_COLOR}] text-white p-4 flex items-center justify-between`}
          >
            <h2 className="text-lg font-semibold">Send Message</h2>
          </div>
          {/* Content */}
          <div className="p-6">
            <textarea
              className="w-full border rounded-md p-2 mb-4"
              placeholder="Input Message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
            />
            <button
              className={`w-full bg-[${BRAND_COLOR}] hover:bg-[${BRAND_COLOR_HOVER}] text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center`}
              onClick={handleSendMessage}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
              ) : null}
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </CustomReusableModal>

      {/* Delete Garage Account Modal */}
      <CustomReusableModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title="Delete Garage Account"
        showHeader={false}
        className="max-w-sm border-red-600"
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div
            className={`bg-[${DANGER_COLOR}] text-white p-4 flex items-center justify-between`}
          >
            <h2 className="text-lg font-semibold">Delete Garage Account</h2>
          </div>
          {/* Content */}
          <div className="p-6 space-y-3">
            {/* lebel name */}
            <div className="text-sm font-medium text-gray-700">Garage Name</div>
            <input
              className="w-full border rounded-md p-2"
              value={selectedGarage?.name || ""}
              readOnly
              placeholder="Garage Name"
            />
            <div className="text-sm font-medium text-gray-700">
              Vehicle Number
            </div>
            <input
              className="w-full border rounded-md p-2"
              value={selectedGarage?.vts || ""}
              readOnly
              placeholder="VTS"
            />
            <div className="text-sm font-medium text-gray-700">Email</div>
            <input
              className="w-full border rounded-md p-2"
              value={selectedGarage?.email || ""}
              readOnly
              placeholder="Email"
            />
            <div className="text-sm font-medium text-gray-700">
              Contact Number
            </div>
            <input
              className="w-full border rounded-md p-2"
              value={selectedGarage?.phone || ""}
              readOnly
              placeholder="Contact Number"
            />
            <button
              className={`w-full bg-[${DANGER_COLOR}] hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center`}
              onClick={handleDeleteGarage}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
              ) : null}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </CustomReusableModal>

      {/* Confirmation Modal */}
      <CustomReusableModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        title={confirmModal.action === 'approve' ? 'Approve Garage' : 'Reject Garage'}
        variant={confirmModal.action === 'approve' ? 'success' : 'danger'}
        icon={confirmModal.action === 'approve' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        description={`Are you sure you want to ${confirmModal.action} this garage?`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {confirmModal.action === 'approve'
              ? `You are about to approve the garage "${confirmModal.garageName}". This action cannot be undone.`
              : `You are about to reject the garage "${confirmModal.garageName}". This action cannot be undone.`
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
    </>
  );
}
