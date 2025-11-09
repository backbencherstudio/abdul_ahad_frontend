"use client";
import React, { useState } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { MoreVertical, Trash2, Loader2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { toast } from "react-toastify";
import {
  useGetAllSubscriptionsQuery,
  useGetASubscriptionQuery,
} from "@/rtk/api/admin/subscriptions-management/subscriptionManagementAPI";

const BRAND_COLOR = "#19CA32";
const BRAND_COLOR_HOVER = "#16b82e";
const DANGER_COLOR = "#F04438";

export default function SubscriptionsManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openMessageModal, setOpenMessageModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [selectedGarage, setSelectedGarage] = React.useState<any>(null);
  const [currentSubscriptionId, setCurrentSubscriptionId] =
    React.useState<any>(null);

  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const allSubscriptions = useGetAllSubscriptionsQuery({
    page: currentPage,
    limit: itemsPerPage,
  });
  console.log(allSubscriptions.data, "check all subscritions");
  const getASingleSubscription = useGetASubscriptionQuery(
    currentSubscriptionId,
    {
      refetchOnMountOrArgChange: true,
    }
  );
  console.log(getASingleSubscription.data, "check single subscription data");

  // Pagination logic
  const totalPages = Math.ceil(
    allSubscriptions.data?.data?.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = allSubscriptions?.data?.data?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };
  const handleCurrentGarageId = (id) => {
    console.log("clicked", id);
    setCurrentSubscriptionId(id);
  };

  const columns = [
    {
      key: "name",
      label: "Subscription Name",
      width: "15%",
    },

    {
      key: "id",
      label: "Garage Details",
      width: "15%",
      render: (value: string, row: any) => (
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu
            onOpenChange={(isOpen) => {
              if (isOpen) handleCurrentGarageId(value);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 flex items-center justify-center cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4 space-y-2">
              {getASingleSubscription?.status === "fulfilled" && (
                <div className="space-y-3">
                  {/* Subscription Name */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Subscription Name
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.name || "-"}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Description
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.description || "-"}
                    </div>
                  </div>

                  {/* Price Formatted */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Price</div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.price_formatted || "-"}
                    </div>
                  </div>

                  {/* Price Pence */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Price (pence)
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.price_pence || "-"}
                    </div>
                  </div>

                  {/* Currency */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Currency</div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.currency || "-"}
                    </div>
                  </div>

                  {/* Max Bookings */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Max Bookings / Month
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.max_bookings_per_month ||
                        "-"}
                    </div>
                  </div>

                  {/* Max Vehicles */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Max Vehicles
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.max_vehicles || "-"}
                    </div>
                  </div>

                  {/* Priority Support */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Priority Support
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.priority_support
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>

                  {/* Advanced Analytics */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Advanced Analytics
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.advanced_analytics
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>

                  {/* Custom Branding */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Custom Branding
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.custom_branding
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>

                  {/* Is Active */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Active Status
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data?.is_active
                        ? "Active"
                        : "Inactive"}
                    </div>
                  </div>

                  {/* Active Subscriptions Count */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Active Subscriptions Count
                    </div>
                    <div className="font-medium text-sm">
                      {getASingleSubscription.data
                        ?.active_subscriptions_count ?? "-"}
                    </div>
                  </div>

                  {/* Created At */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Created At</div>
                    <div className="font-medium text-sm">
                      {new Date(
                        getASingleSubscription.data?.created_at
                      ).toLocaleString() || "-"}
                    </div>
                  </div>

                  {/* Updated At */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Updated At</div>
                    <div className="font-medium text-sm">
                      {new Date(
                        getASingleSubscription.data?.updated_at
                      ).toLocaleString() || "-"}
                    </div>
                  </div>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
    {
      key: "price_pence",
      label: "Price Pence",
      width: "15%",
    },
    {
      key: "max_vehicles",
      label: "Max Vehicles",
      width: "15%",
    },
    {
      key: "is_active",
      label: "Status",
      width: "15%",
      render: (value: string) => (
        <span
          className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${
            value == "1"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {value ? "Active" : "Deactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      width: "15%",
    },
    {
      key: "updated_at",
      label: "Updated At",
      width: "15%",
    },
    {
      key: "id",
      label: "Actions",
      width: "15%",
      render: (value: string, row: any) => (
        <div className="flex items-center justify-between gap-2">
          <DropdownMenu
            onOpenChange={(isOpen) => {
              if (isOpen) handleCurrentGarageId(value);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 flex items-center justify-center cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className=" space-y-2">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer hover:text-green-900`}
                  onClick={() => {
                    // Add your status change logic here
                    console.log("Set to Active");
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start bg-red-700 hover:bg-red-800 hover:text-white cursor-pointer text-white`}
                  onClick={() => {
                    // Add your status change logic here
                    console.log("Set to Deactive");
                  }}
                >
                  Decline
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-semibold">List of All Subscriptions</h1>
        <Button
          variant="ghost"
          className={`justify-start bg-white hover:bg-white text-black cursor-pointer`}
          onClick={() => {
            // Add your status change logic here
            console.log("Set to Active");
          }}
        >
          <Plus /> Add Subscription
        </Button>
      </div>

      <ReusableTable data={paginatedData} columns={columns} className="mt-5" />

      <ReusablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={allSubscriptions?.data?.data?.length}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        className=""
      />

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
    </>
  );
}
