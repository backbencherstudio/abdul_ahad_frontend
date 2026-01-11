"use client";
import React from "react";
import GarageProfileCard from "../../_components/Garage/GarageProfileCard";
import GarageProfileAdd from "../../_components/Garage/GarageProfileAdd";
import { useGetProfileQuery } from "@/rtk/api/garage/profileApis";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function GarageProfile() {
  const { data, isLoading, isError, refetch } = useGetProfileQuery();
  const profile = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Profile Card Shimmer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Shimmer */}
            <div className="flex-shrink-0">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>

            {/* Profile Info Shimmer */}
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form Shimmer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <Skeleton className="h-7 w-40 mb-6" />

          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <p className="text-red-500 text-sm">Unable to load garage profile.</p>
        <Button
          onClick={() => refetch()}
          className="bg-[#19CA32] hover:bg-[#16b82e]"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <GarageProfileCard
        garageName={profile.garage_name}
        address={profile.address}
        postcode={profile.zip_code}
        contact={profile.primary_contact || profile.phone_number}
        email={profile.email}
        vtsNumber={profile.vts_number}
        phoneNumber={profile.phone_number}
        avatarUrl={profile.avatar_url}
        price={profile.mot_price.toString()}
      />
      <GarageProfileAdd profile={profile} />
    </div>
  );
}
