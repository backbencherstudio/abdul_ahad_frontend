"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetASubscriptionQuery,
  JobType,
} from "@/rtk/api/admin/subscriptions-management/subscriptionManagementAPI";
import SubscriptionDetailsTab from "../../../_components/Admin/SubscriptionsManagement/components/SubscriptionDetailsTab";
import MigrationTab from "../../../_components/Admin/SubscriptionsManagement/components/MigrationTab";
import JobsTab from "../../../_components/Admin/SubscriptionsManagement/components/JobsTab";
import GarageSubscriptionsTab from "../../../_components/Admin/SubscriptionsManagement/components/GarageSubscriptionsTab";

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    "details" | "migration" | "jobs" | "garages"
  >("details");
  const [selectedJobType, setSelectedJobType] = useState<JobType | undefined>(
    undefined,
  );

  const { data: subscription, isLoading: isLoadingSubscription } =
    useGetASubscriptionQuery(subscriptionId, { skip: !subscriptionId });

  const tabs = [
    { key: "details", label: "Details", count: null },
    { key: "migration", label: "Migration", count: null },
    { key: "jobs", label: "Jobs", count: null },
    { key: "garages", label: "Garage Subscriptions", count: null },
  ];

  if (isLoadingSubscription) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600 font-medium">
          Loading subscription details...
        </span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 mb-4 font-semibold">
          Subscription not found
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {/* {subscription.name} */}
              One Simple Plan
            </h1>
            <p className="text-sm text-gray-600">Subscription Plan Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              subscription.is_active
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {subscription.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b px-6 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 cursor-pointer py-3 font-medium text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "details" && (
            <SubscriptionDetailsTab
              subscription={subscription}
              subscriptionId={subscriptionId}
            />
          )}
          {activeTab === "migration" && (
            <MigrationTab subscriptionId={subscriptionId} />
          )}
          {activeTab === "jobs" && (
            <JobsTab
              subscriptionId={subscriptionId}
              selectedJobType={selectedJobType}
              onJobTypeChange={setSelectedJobType}
            />
          )}
          {activeTab === "garages" && (
            <GarageSubscriptionsTab planId={subscriptionId} />
          )}
        </div>
      </div>
    </div>
  );
}
