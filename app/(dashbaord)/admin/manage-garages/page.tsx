"use client";
import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { MoreVertical, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
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

// Garage Details Dropdown Component
const GarageDetailsDropdown = React.memo(({ garageId }: { garageId: string }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { data: garageData, isLoading, isError } = useGetAGarageByIdQuery(garageId || '', {
    skip: !dropdownOpen || !garageId,
    refetchOnMountOrArgChange: true,
  });

  const garage = garageData?.data;

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
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
        {isError && <div className="text-sm text-red-500 py-4">Failed to load garage details</div>}
        {!isLoading && !isError && garage && (
          <div>
            {[
              { label: "Garage Name", value: garage.garage_name },
              { label: "Primary Contact Person", value: garage.primary_contact },
              { label: "VTS Number", value: garage.vts_number },
              { label: "Email", value: garage.email },
              { label: "Phone Number", value: garage.phone_number },
              { label: "Address", value: [garage.address, garage.city, garage.state, garage.country, garage.zip_code].filter(Boolean).join(", ") || "N/A" },
              { label: "Status", value: garage.status === 1 ? "Active" : "Inactive" },
              { label: "Created At", value: garage.created_at ? new Date(garage.created_at).toLocaleString() : "N/A" },
              { label: "Approved At", value: garage.approved_at ? new Date(garage.approved_at).toLocaleString() : "N/A" },
            ].map((item, idx) => (
              <div key={idx} className={idx > 0 ? "mt-2" : ""}>
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className="font-medium text-sm">{item.value || "-"}</div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
GarageDetailsDropdown.displayName = 'GarageDetailsDropdown';

// Actions Dropdown Component
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
        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer" disabled={isApproving || isRejecting} onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropdownOpen(false);
            setTimeout(() => onApprove(row.id, row.garage_name || 'Garage'), 150);
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
            setTimeout(() => onReject(row.id, row.garage_name || 'Garage'), 150);
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

// Date formatter helper
const formatDate = (value: string) => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return value;
  }
};

export default function ManageGarages() {
  const [activeTab, setActiveTab] = useState<string | number>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const garagesInfo = useGetAllGaragesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    status: activeTab ? String(activeTab) : undefined,
  });

  const [approveGarage, { isLoading: isApproving }] = useApproveAGarageMutation();
  const [rejectGarage, { isLoading: isRejecting }] = useRejectAGarageMutation();

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    garageId: string | null;
    action: 'approve' | 'reject' | null;
    garageName: string | null;
  }>({ isOpen: false, garageId: null, action: null, garageName: null });

  const garagesData = garagesInfo?.data?.data?.garages || [];
  const pagination = garagesInfo?.data?.data?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };
  const { pages: totalPages, total: totalItems } = pagination;

  const handleApprove = React.useCallback((id: string, name: string) => {
    setConfirmModal({ isOpen: true, garageId: id, action: 'approve', garageName: name });
  }, []);

  const handleReject = React.useCallback((id: string, name: string) => {
    setConfirmModal({ isOpen: true, garageId: id, action: 'reject', garageName: name });
  }, []);

  const handleConfirm = async () => {
    if (!confirmModal.garageId || !confirmModal.action) return;
    try {
      const response = confirmModal.action === 'approve' 
        ? await approveGarage(confirmModal.garageId).unwrap()
        : await rejectGarage(confirmModal.garageId).unwrap();
      toast.success(response?.message || `Garage ${confirmModal.action}ed successfully!`);
      setConfirmModal({ isOpen: false, garageId: null, action: null, garageName: null });
      garagesInfo.refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${confirmModal.action} garage`);
      setConfirmModal({ isOpen: false, garageId: null, action: null, garageName: null });
    }
  };

  const closeModal = () => setConfirmModal({ isOpen: false, garageId: null, action: null, garageName: null });

  const tabs = [
    { key: "all", label: "All Garages", count: totalItems },
    { key: "1", label: "Approved", count: garagesData.filter((g: any) => g.status === 1).length },
    { key: "0", label: "Pending", count: garagesData.filter((g: any) => g.status === 0).length },
  ];

  const columns = [
    { key: "garage_name", label: "Garage Name", width: "30%" },
    {
      key: "garage_details",
      label: "Garage Details",
      width: "15%",
      render: (_: string, row: any) => <GarageDetailsDropdown garageId={row.id} />,
    },
    { key: "primary_contact", label: "Primary Contact", width: "15%" },
    { key: "phone_number", label: "Phone", width: "15%" },
    { key: "email", label: "Email", width: "15%" },
    {
      key: "status",
      label: "Status",
      width: "15%",
      render: (value: any) => {
        const status = typeof value === 'string' ? parseInt(value) : value;
        return (
          <span className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${
            status === 1 ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"
          }`}>
            {status === 1 ? "Approved" : "Pending"}
          </span>
        );
      },
    },
    { key: "created_at", label: "Created At", width: "15%", render: formatDate },
    { key: "approved_at", label: "Approved At", width: "15%", render: formatDate },
    {
      key: "actions",
      label: "Actions",
      width: "15%",
      render: (_: string, row: any) => (
        <ActionsDropdown
          row={row}
          onApprove={handleApprove}
          onReject={handleReject}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      ),
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">List of All Garages</h1>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <nav className="flex flex-wrap gap-2 lg:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key === "all" ? "" : tab.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-1 rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${
                (activeTab === "" && tab.key === "all") || activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="relative w-full lg:w-auto lg:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
          <span className="ml-3 text-gray-600 font-medium">Loading garages...</span>
        </div>
      ) : (
        <>
          <ReusableTable data={garagesData} columns={columns} className="mt-5" />
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage: number) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        </>
      )}

      <CustomReusableModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        title={confirmModal.action === 'approve' ? 'Approve Garage' : 'Reject Garage'}
        variant={confirmModal.action === 'approve' ? 'success' : 'danger'}
        icon={confirmModal.action === 'approve' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        description={`Are you sure you want to ${confirmModal.action} this garage?`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to {confirmModal.action} the garage "{confirmModal.garageName}". This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button className="cursor-pointer" variant="outline" onClick={closeModal} disabled={isApproving || isRejecting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isApproving || isRejecting}
              className={confirmModal.action === 'approve' ? 'bg-green-600 cursor-pointer hover:bg-green-700 text-white' : 'bg-red-600 cursor-pointer hover:bg-red-700 text-white'}
            >
              {isApproving || isRejecting ? 'Processing...' : confirmModal.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        </div>
      </CustomReusableModal>
    </>
  );
}
