"use client";
import { useGetDashboardOverviewQuery } from "@/rtk/api/admin/dashboard/dashboardApi";
import React from "react";

export default function OverviewCard() {
  const { data, isLoading } = useGetDashboardOverviewQuery();
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }
  const datas = [
    {
      title: "Total Garages",
      value: 0,
    },
    {
      title: "Total Drivers",
      value: 0,
    },
    {
      title: "Total Bookings",
      value: 0,
    },
  ];

  console.log(data, "check data");
  return (
    <>
      <h1 className="text-2xl font-semibold mb-5">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white px-6 py-10 rounded-lg shadow-sm flex flex-col gap-3">
          <h3 className="text-md ">Total Garages</h3>
          <p className="text-2xl font-bold">
            {data.data.overview.total_garages}
          </p>
        </div>
        <div className="bg-white px-6 py-10 rounded-lg shadow-sm flex flex-col gap-3">
          <h3 className="text-md ">Total Drivers</h3>
          <p className="text-2xl font-bold">
            {data.data.overview.total_drivers}
          </p>
        </div>
        <div className="bg-white px-6 py-10 rounded-lg shadow-sm flex flex-col gap-3">
          <h3 className="text-md ">Total Bookings</h3>
          <p className="text-2xl font-bold">
            {data.data.overview.total_bookings}
          </p>
        </div>
      </div>
    </>
  );
}
