import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BookingModal from "./BookingModal";
import { GarageData, VehicleData } from "@/rtk/slices/driver/bookMyMotSlice";

interface GarageCardProps {
  foundGarages: GarageData[];
  vehicle: VehicleData | null;
}

export default function GarageCard({ foundGarages, vehicle }: GarageCardProps) {
  const router = useRouter();
  // const vehicle = useSelector(selectVehicle)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedGarage, setSelectedGarage] = useState<GarageData | null>(null);

  const handleMoreDetails = (garageId: string) => {
    // Pass garage_id, vehicle_id, registration, and postcode to details page
    const params = new URLSearchParams();
    params.set("id", garageId);
    if (vehicle?.vehicle_id) {
      params.set("vehicle_id", vehicle.vehicle_id);
    }
    if (vehicle?.registration_number) {
      params.set("registration", vehicle.registration_number);
    }
    // Also pass current postcode from main page if available
    const mainPostcode = new URLSearchParams(window.location.search).get(
      "postcode"
    );
    if (mainPostcode) {
      params.set("postcode", mainPostcode);
    }

    router.push(`/driver/book-my-mot/details?${params.toString()}`);
  };

  const handleBookNow = (garage: GarageData) => {
    // Update URL with garage_id and vehicle_id params (without navigation)
    const params = new URLSearchParams(window.location.search);
    params.set("garage_id", garage.id);
    if (vehicle?.vehicle_id) {
      params.set("vehicle_id", vehicle.vehicle_id);
    }
    if (vehicle?.registration_number) {
      params.set("registration", vehicle.registration_number);
    }
    // Update URL without page reload
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );

    setSelectedGarage(garage);
    setIsBookingModalOpen(true);
  };
  return (
    <div className="space-y-4">
      {foundGarages.map((garage) => (
        <div
          key={garage.id}
          className="bg-[#F8FAFB] rounded-lg p-4 flex flex-col lg:flex-row gap-4 items-start"
        >
          {/* Garage Image */}
          <div className="w-full lg:w-40 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {garage.avatar ? (
              <Image
                src={garage.avatar}
                alt="Garage"
                width={100}
                height={100}
                className="object-contain"
              />
            ) : (
              <span className="text-5xl">🏢</span>
            )}
          </div>

          {/* Garage Details */}
          <div className="flex-1">
            <div className="border-b border-gray-200 pb-3 mb-3">
              <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-1">
                Garage: {garage.garage_name}
              </h3>
              <p className="text-gray-600 text-sm xl:text-base">
                Address : {garage.address}
              </p>
            </div>

            <div className="space-y-1 text-sm xl:text-base text-gray-600">
              <div>Postcode : {garage.postcode}</div>
              {/* <div>Contact : {garage.primary_contact}</div> */}
              {/* <div>Phone : {garage.phone_number}</div> */}
              <div>VTS Number : {garage.vts_number}</div>
            </div>
          </div>

          {/* Action Buttons and Price */}
          <div className="flex flex-col items-end gap-3 w-full lg:w-48">
            {/* Price can be added later if available in API response */}

            <div className="w-full space-y-2">
              <Button
                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium py-3 text-sm rounded-lg"
                onClick={() => handleBookNow(garage)}
              >
                Book My MOT
              </Button>

              <Button
                variant="outline"
                className="w-full cursor-pointer border-[#19CA32] text-[#19CA32] hover:bg-[#19CA32] hover:text-white py-3 text-sm rounded-lg"
                onClick={() => handleMoreDetails(garage.id)}
              >
                More Details
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        garage={selectedGarage}
        vehicleId={vehicle?.vehicle_id}
        vehicleRegistrationNumber={vehicle?.registration_number}
      />
    </div>
  );
}
