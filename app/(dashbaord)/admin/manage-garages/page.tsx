"use client";
import React, { useState, useMemo } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { MoreVertical, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { toast } from "react-toastify";
import {
  useGetAGarageByIdQuery,
  useGetAllGaragesQuery,
} from "@/rtk/api/admin/garages-management/listAllGarageApi";

const BRAND_COLOR = "#19CA32";
const BRAND_COLOR_HOVER = "#16b82e";
const DANGER_COLOR = "#F04438";

export default function ManageGarages() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [openMessageModal, setOpenMessageModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [selectedGarage, setSelectedGarage] = React.useState<any>(null);
  const [currentGarageId, setCurrentGarageId] = React.useState<any>(null);

  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const garagesInfo = useGetAllGaragesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    status: activeTab,
  });

  const getAGarageData = useGetAGarageByIdQuery(currentGarageId, {
    refetchOnMountOrArgChange: true,
  });

  // Define tabs with counts
  const tabs = [
    {
      key: "all",
      label: "All Garages",
      count: data.length,
    },
    {
      key: "paid",
      label: "Paid",
      count: data.filter(
        (garage) => garage.subscription.toLowerCase() === "paid"
      ).length,
    },
    {
      key: "unpaid",
      label: "Unpaid",
      count: data.filter(
        (garage) => garage.subscription.toLowerCase() === "unpaid"
      ).length,
    },
  ];

  // Filter data based on active tab and search
  const filteredData = useMemo(() => {
    let filtered = data;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (garage) => garage.subscription.toLowerCase() === activeTab
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((garage) =>
        Object.values(garage).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  }, [activeTab, searchTerm, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = garagesInfo?.data?.data?.garages?.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  console.log(paginatedData, "chek pagination data");

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setCurrentPage(1); // Reset to first page when tab changes
  };
  const handleCurrentGarageId = (id) => {
    console.log("clicked", id);
    setCurrentGarageId(id);
  };

  const columns = [
    {
      key: "garage_name",
      label: "Garage Name",
      width: "30%",
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
              {getAGarageData?.status === "fulfilled" && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Garage Name</div>
                  <div className="font-medium text-sm mb-2">
                    {getAGarageData?.data?.data?.garage_name || "-"}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">
                    Primary Contact Person
                  </div>
                  <div className="font-medium text-sm mb-2">
                    {getAGarageData?.data?.data?.primary_contact || "-"}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">VTS Number</div>
                  <div className="mb-2 text-sm">
                    {getAGarageData?.data?.data?.vts_number || "-"}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="mb-2 text-sm">
                    {getAGarageData?.data?.data?.email || "-"}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">Number</div>
                  <div className="mb-2 text-sm">
                    {getAGarageData?.data?.data?.phone_number || "-"}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">Address</div>
                  <div className="mb-2 text-sm">
                    {[
                      getAGarageData?.data?.data?.address,
                      getAGarageData?.data?.data?.city,
                      getAGarageData?.data?.data?.state,
                      getAGarageData?.data?.data?.country,
                      getAGarageData?.data?.data?.zip_code,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="mb-2 text-sm">
                    {getAGarageData?.data?.data?.status === 1
                      ? "Active"
                      : "Inactive"}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">Created At</div>
                  <div className="mb-2 text-sm">
                    {new Date(
                      getAGarageData?.data?.data?.created_at
                    ).toLocaleString()}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">Approved At</div>
                  <div className="mb-2 text-sm">
                    {getAGarageData?.data?.data?.approved_at
                      ? new Date(
                          getAGarageData?.data?.data?.approved_at
                        ).toLocaleString()
                      : "N/A"}
                  </div>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
      render: (value: string) => (
        <span
          className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${
            value == "1"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {value == 1 ? "Approved" : "Unpaid"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      width: "15%",
    },
    {
      key: "approved_at",
      label: "Approved At",
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
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
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

      <ReusableTable data={paginatedData} columns={columns} className="mt-5" />

      <ReusablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
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
