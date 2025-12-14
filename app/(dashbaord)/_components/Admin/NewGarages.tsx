"use client";
import React, { useMemo } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import { MoreVertical, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { toast } from "react-toastify";
import Link from "next/link";
import {
  useGetAllGaragesQuery,
  useGetAGarageByIdQuery,
  useApproveAGarageMutation,
  useRejectAGarageMutation,
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

export default function NewGarages() {
  const garagesInfo = useGetAllGaragesQuery({ page: 1, limit: 5, status: undefined });
  const [approveGarage, { isLoading: isApproving }] = useApproveAGarageMutation();
  const [rejectGarage, { isLoading: isRejecting }] = useRejectAGarageMutation();

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    garageId: string | null;
    action: 'approve' | 'reject' | null;
    garageName: string | null;
  }>({ isOpen: false, garageId: null, action: null, garageName: null });

  const garagesData = garagesInfo?.data?.data?.garages || [];

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
          <span className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${status === 1 ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">New Garages</h1>
        <Link href="/admin/manage-garages" className="underline hover:text-green-600 cursor-pointer transition-all duration-300">
          View All Garages
        </Link>
      </div>

      <ReusableTable
        data={garagesData}
        columns={columns}
        className="mt-4"
        isLoading={garagesInfo.isLoading}
        skeletonRows={5}
      />

      <CustomReusableModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, garageId: null, action: null, garageName: null })}
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
            <Button className="cursor-pointer" variant="outline" onClick={() => setConfirmModal({ isOpen: false, garageId: null, action: null, garageName: null })} disabled={isApproving || isRejecting}>
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
