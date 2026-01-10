"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

import imgMot from "@/public/Image/admin/cardMot.png";
import VehicleCard from "../../_components/Driver/VehicleCard";
import GarageCard from "../../_components/Driver/GarageCard";
import {
  useBookSlotMutation,
  useSearchVehiclesAndGaragesQuery,
} from "@/rtk/api/driver/bookMyMotApi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/rtk/store";
import { setPendingBooking } from "@/rtk/slices/driver/bookMyMotSlice";
import {
  useAddVehicleMutation,
  useGetVehiclesQuery,
} from "@/rtk/api/driver/vehiclesApis";
import BookingSuccessModal from "../../_components/Driver/BookingModal/BookingSuccessModal";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";

interface FormData {
  registrationNumber: string;
  postcode: string;
}

function BookMyMOTContent() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const searchParamsFromURL = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // reset,
  } = useForm<FormData>();

  const { user } = useAuth();

  // Get registration number and postcode from URL query parameters
  const registrationFromURL = searchParamsFromURL?.get("registration");
  const postcodeFromURL = searchParamsFromURL?.get("postcode");
  const isLoggedIn = searchParamsFromURL?.get("is_logged_in");

  const pendingBooking = useSelector(
    (rootState: RootState) => rootState.bookMyMot.pendingBooking
  );

  // State for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Local state for results (requested by user)
  const [vehicle, setVehicle] = useState(null);
  const [garages, setGarages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isBookingInitiated = useRef(false);

  // Derived state for auto-search flag
  const isSearchActive = !!(registrationFromURL && postcodeFromURL);

  // Auto-fill form with values from URL
  useEffect(() => {
    if (registrationFromURL) {
      setValue("registrationNumber", registrationFromURL);
    }
    if (postcodeFromURL) {
      setValue("postcode", postcodeFromURL);
    }
  }, [registrationFromURL, postcodeFromURL, setValue]);

  // Function to clear URL parameters
  // const clearURLParams = () => {
  //   router.replace("/driver/book-my-mot", { scroll: false });
  // };

  // Query will execute when URL params are present
  const { data, isLoading, error, refetch, isFetching } =
    useSearchVehiclesAndGaragesQuery(
      {
        registration_number: registrationFromURL || "",
        postcode: postcodeFromURL || "",
        page,
        limit,
      },
      {
        skip: !isSearchActive,
      }
    );

  // Sync data to local state
  useEffect(() => {
    if (data) {
      setVehicle(data.data.vehicle || null);
      setGarages(data.data.garages || []);
      setTotalCount(data.meta_data.total_count || 0);

      // Scroll to results when data changes (successfully loaded)
      if (isSearchActive && !isFetching) {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [data, isFetching, isSearchActive]);

  // Handle errors
  useEffect(() => {
    if (error) {
      let errorMessage = "Failed to search data. Please try again.";
      if ("data" in error && (error.data as any)?.message) {
        errorMessage = (error.data as any).message;
      }
      toast.error(errorMessage);
    }
  }, [error]);

  const onSubmit = async (data: FormData) => {
    const params = new URLSearchParams(searchParamsFromURL?.toString());
    params.set("registration", data.registrationNumber);
    params.set("postcode", data.postcode);

    // Reset page to 1 on new search
    setPage(1);

    // Using push to update the URL and trigger search
    router.push(`/driver/book-my-mot?${params.toString()}`);
  };

  const showResults = vehicle !== null || garages.length > 0;
  const { data: vehicles, isFetching: isFetchingVehicles } =
    useGetVehiclesQuery(null, { skip: !user?.id });
  const [addVehicle, { isLoading: isAddingVehicle }] = useAddVehicleMutation();
  const [bookSlot, { isLoading: isBooking }] = useBookSlotMutation();

  useEffect(() => {
    const performAutoBooking = async () => {
      // Guard: Ensure everything is ready and we haven't already tried
      if (
        isLoggedIn !== "true" ||
        !user?.id ||
        !pendingBooking.vehicle_registration_number ||
        isFetchingVehicles ||
        isAddingVehicle ||
        isBooking ||
        isBookingInitiated.current
      ) {
        return;
      }

      // Check for expiration
      if (
        !pendingBooking.expires_at ||
        Date.now() > new Date(pendingBooking.expires_at).getTime()
      ) {
        // Expired, clear state and params
        cleanupBookingState();
        return;
      }

      // Mark as initiated to prevent double-runs
      isBookingInitiated.current = true;

      try {
        let vehicleId = "";
        const existVehicle = vehicles?.data?.find(
          (vehicle) =>
            vehicle.registration_number ===
            pendingBooking.vehicle_registration_number
        );

        if (existVehicle) {
          vehicleId = existVehicle.id;
        } else {
          const response = await addVehicle({
            registration_number: pendingBooking.vehicle_registration_number,
          }).unwrap();
          if (!response.success || !response?.data?.id)
            throw new Error(response.message || "Failed to add vehicle");
          vehicleId = response.data.id;
        }

        const result = await bookSlot({
          vehicle_id: vehicleId,
          ...(pendingBooking.slot_id
            ? { slot_id: pendingBooking.slot_id }
            : {
                date: pendingBooking.date,
                start_time: pendingBooking.start_time,
                end_time: pendingBooking.end_time,
              }),
          garage_id: pendingBooking.garage_id,
          service_type: pendingBooking.service_type,
        }).unwrap();

        if (result.success) {
          let successMessage = "Slot booked successfully!";
          if (typeof result.message === "string") {
            successMessage = result.message;
          } else if (
            result.message &&
            typeof result.message === "object" &&
            "message" in result.message
          ) {
            const msgObj = result.message as { message?: string };
            if (typeof msgObj.message === "string") {
              successMessage = msgObj.message;
            }
          }
          toast.success(successMessage);
          setIsSuccessModalOpen(true);
        } else {
          let errorMessage = "Failed to book slot";
          if (typeof result.message === "string") {
            errorMessage = result.message;
          } else if (
            result.message &&
            typeof result.message === "object" &&
            "message" in result.message
          ) {
            const msgObj = result.message as { message?: string };
            if (typeof msgObj.message === "string") {
              errorMessage = msgObj.message;
            }
          }
          toast.error(errorMessage);
        }
      } catch (error: any) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to book slot. Please try again.";
        toast.error(errorMessage);
      } finally {
        // ALWAYS cleanup after an attempt
        cleanupBookingState();
      }
    };

    const cleanupBookingState = () => {
      // Clear Redux state
      dispatch(
        setPendingBooking({
          slot_id: "",
          garage_id: "",
          vehicle_registration_number: "",
          start_time: "",
          end_time: "",
          date: "",
          service_type: "MOT",
          expires_at: "",
        })
      );

      // Clear URL params
      const params = new URLSearchParams(searchParamsFromURL?.toString());
      params.delete("is_logged_in");
      router.replace(
        `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
        {
          scroll: false,
        }
      );
    };

    performAutoBooking();
  }, [
    isLoggedIn,
    pendingBooking,
    user,
    vehicles,
    isFetchingVehicles,
    isAddingVehicle,
    isBooking,
    dispatch,
    router,
    pathname,
    searchParamsFromURL,
  ]);

  return (
    <div className="w-full mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-md shadow-sm p-4 sm:p-6  mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4  bg-[#F8FAFB] p-4 rounded-md items-center">
          {/* Registration Number */}
          <div>
            <Label
              htmlFor="registrationNumber"
              className="text-sm mb-2 font-medium text-gray-700"
            >
              Registration Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="registrationNumber"
              type="text"
              placeholder=""
              className="py-5 text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-md"
              {...register("registrationNumber", {
                required: "Registration number is required",
                pattern: {
                  value: /^[A-Z0-9\s]{2,8}$/i,
                  message: "Invalid registration number format",
                },
              })}
            />
            <div className="h-5">
              {errors.registrationNumber && (
                <p className="text-red-500 text-sm">
                  {errors.registrationNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Postcode */}
          <div>
            <Label
              htmlFor="postcode"
              className="text-sm mb-2 font-medium text-gray-700"
            >
              Postcode <span className="text-red-500">*</span>
            </Label>
            <Input
              id="postcode"
              type="text"
              placeholder=""
              className="py-5 text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-md"
              {...register("postcode", {
                required: "Postcode is required",
              })}
            />
            <div className="h-5">
              {errors.postcode && (
                <p className="text-red-500 text-sm">
                  {errors.postcode.message}
                </p>
              )}
            </div>
          </div>

          {/* Find Garage Button */}
          <div className="sm:col-span-2 lg:col-span-1 mt-2">
            <Button
              type="submit"
              disabled={isLoading || isFetching}
              className="w-full py-5  bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium text-sm xl:text-base rounded-md transition-all duration-200 hover:shadow-lg cursor-pointer disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed"
            >
              {isLoading || isFetching ? "Searching..." : "Find Garage"}
            </Button>
          </div>
        </div>
      </form>

      {/* Search Results Section */}
      {showResults && (
        <div ref={resultsRef} className="w-full mx-auto mt-8">
          {/* Vehicle Results */}
          {vehicle ? (
            <VehicleCard vehicle={vehicle} />
          ) : (
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mb-4">
              <div className="text-center py-6">
                <div className="text-red-500 text-lg font-medium mb-2">
                  Vehicle Not Found
                </div>
                <p className="text-gray-600">
                  No vehicle found with the registration number you provided.
                  Please check and try again.
                </p>
              </div>
            </div>
          )}

          {/* Garages Results */}
          {garages.length > 0 ? (
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mt-8">
              {/* Payment Message */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-base xl:text-xl font-medium">
                  No upfront payment required - simply pay at your appointment.
                </p>
              </div>

              {/* Garage List */}
              <GarageCard foundGarages={garages} vehicle={vehicle} />

              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 mt-8">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="cursor-pointer border-gray-300 hover:bg-gray-50 hover:text-[#19CA32] px-3 h-10"
                >
                  {/* <span className="sr-only">Previous</span> */}
                  <ChevronLeft />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {(() => {
                    const totalPages = Math.ceil(totalCount / limit);
                    const pages = [];

                    // Logic to generate page numbers
                    // If total pages <= 7, show all
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Complex logic for ellipsis
                      if (page <= 4) {
                        // Near start: 1, 2, 3, 4, 5, ..., last
                        for (let i = 1; i <= 5; i++) pages.push(i);
                        pages.push("...");
                        pages.push(totalPages);
                      } else if (page >= totalPages - 3) {
                        // Near end: 1, ..., last-4, last-3, last-2, last-1, last
                        pages.push(1);
                        pages.push("...");
                        for (let i = totalPages - 4; i <= totalPages; i++)
                          pages.push(i);
                      } else {
                        // Middle: 1, ..., page-1, page, page+1, ..., last
                        pages.push(1);
                        pages.push("...");
                        pages.push(page - 1);
                        pages.push(page);
                        pages.push(page + 1);
                        pages.push("...");
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((p, index) => (
                      <React.Fragment key={index}>
                        {p === "..." ? (
                          <span className="px-2 text-gray-500">...</span>
                        ) : (
                          <button
                            onClick={() => typeof p === "number" && setPage(p)}
                            className={`
                                        min-w-[40px] h-10 flex items-center justify-center rounded-md font-medium transition-colors duration-200
                                        ${
                                          page === p
                                            ? "bg-[#19CA32] text-white shadow-md"
                                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#19CA32]"
                                        }
                                    `}
                          >
                            {p}
                          </button>
                        )}
                      </React.Fragment>
                    ));
                  })()}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((p) =>
                      Math.min(Math.ceil(totalCount / limit), p + 1)
                    )
                  }
                  disabled={page >= Math.ceil(totalCount / limit)}
                  className="cursor-pointer border-gray-300 hover:bg-gray-50 hover:text-[#19CA32] px-3 h-10"
                >
                  {/* <span className="sr-only">Next</span> */}
                  <ChevronRight />
                </Button>
              </div>
            </div>
          ) : vehicle && garages.length === 0 ? (
            <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mt-8">
              <div className="text-center py-6">
                <div className="text-red-500 text-lg font-medium mb-2">
                  Garage Not Found
                </div>
                <p className="text-gray-600">
                  No garage found with the postcode you provided. Please check
                  and try again.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Main Content Section - Only show when no search results */}
      {!showResults && (
        <div className=" flex items-center justify-center ">
          <div className="text-center max-w-4xl mx-auto">
            {/* Text Content */}
            <div className="my-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl  font-medium text-[#19CA32] mb-6 leading-tight font-inder">
                Input Registration
                <br />
                Number & Postcode
              </h1>
            </div>

            {/* Car Illustration */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-lg">
                <Image
                  src={imgMot}
                  alt="MOT Testing Illustration"
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        submittedBooking={null}
        selectedSlot={null}
        selectedDate={null}
        garage={null}
        formatTime={null}
      />

      {/* Auto-booking Loading Overlay */}
      {isLoggedIn === "true" &&
        (isAddingVehicle || isBooking || isFetchingVehicles) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl scale-110">
              <LoadingSpinner
                size="lg"
                text="Finalizing Your Booking..."
                fullScreen={false}
              />
            </div>
          </div>
        )}
    </div>
  );
}

export default function BookMyMOT() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." fullScreen={false} />
        </div>
      }
    >
      <BookMyMOTContent />
    </Suspense>
  );
}
