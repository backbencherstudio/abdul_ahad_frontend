"use client";
import React, { useEffect, useState } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import { MoreVertical, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { toast } from "react-toastify";
import Link from "next/link";

const BRAND_COLOR = "#19CA32";
const BRAND_COLOR_HOVER = "#16b82e";
const DANGER_COLOR = "#F04438";

export default function NewGarages() {
  const [data, setData] = useState([]);
  const [openMessageModal, setOpenMessageModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [selectedGarage, setSelectedGarage] = React.useState<any>(null);
  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/ManageGarageData.json");
        const jsonData = await response.json();
        setData(jsonData.slice(0, 8));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load garage data");
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      key: "garage_name",
      label: "Garage Name",
      width: "30%",
      render: (value: string, row: any) => (
        <div className="flex items-center justify-between gap-2">
          <span className="truncate block">{value}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-6 w-6 p-0 flex items-center justify-center cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-4 space-y-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Primary Contact Person
                </div>
                <div className="font-medium text-sm mb-2">{row.name}</div>
                <div className="text-xs text-gray-500 mb-1">VTS Number</div>
                <div className="mb-2 text-sm">{row.vts}</div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="mb-2 text-sm">{row.email}</div>
                <div className="text-xs text-gray-500 mb-1">Number</div>
                <div className="mb-2 text-sm">{row.phone}</div>
                <div className="text-xs text-gray-500 mb-1">Address</div>
                <div className="mb-2 text-sm">{row.address}</div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
    {
      key: "subscription_date",
      label: "Subscription Date",
      width: "15%",
    },
    {
      key: "subscription",
      label: "Subscription",
      width: "15%",
      render: (value: string) => (
        <span
          className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${
            value.toLowerCase() === "paid"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "listing",
      label: "Listing",
      width: "15%",
      render: (value: string, row: any) => (
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${
              value.toLowerCase() === "active"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {value}
          </span>
          <DropdownMenu>
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
                  className={`w-full justify-start ${
                    value.toLowerCase() === "active" ? "bg-green-50" : ""
                  }`}
                  onClick={() => {
                    // Add your status change logic here
                    console.log("Set to Active");
                  }}
                >
                  Active
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    value.toLowerCase() === "deactive" ? "bg-red-50" : ""
                  }`}
                  onClick={() => {
                    // Add your status change logic here
                    console.log("Set to Deactive");
                  }}
                >
                  Deactive
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
    {
      key: "message",
      label: "Message",
      width: "15%",
      render: (value: string, row: any) => (
        <span
          className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
            value.toLowerCase() === "send"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-[#F5F5F5] text-[#666666] border border-[#666666]"
          }`}
          onClick={() => {
            if (value.toLowerCase() === "send") {
              setSelectedGarage(row);
              setOpenMessageModal(true);
            }
          }}
        >
          {value}
        </span>
      ),
    },
  ];

  const handleDelete = (row: any) => {
    setSelectedGarage(row);
    setOpenDeleteModal(true);
  };

  const actions = [
    {
      label: "",
      render: (row: any) => (
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 flex items-center justify-center bg-red-100 border border-red-300 cursor-pointer text-red-600 hover:bg-red-100"
          onClick={() => handleDelete(row)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold ">New Garages</h1>
        <div>
          <Link
            href="/admin/manage-garages"
            className="underline hover:text-green-600 cursor-pointer transition-all duration-300"
          >
            View All Garages
          </Link>
        </div>
      </div>

      <ReusableTable
        data={data}
        columns={columns}
        actions={actions}
        className="mt-4"
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
