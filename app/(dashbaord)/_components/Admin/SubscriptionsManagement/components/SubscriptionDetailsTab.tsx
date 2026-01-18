"use client";

import React from "react";
import {
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { SubscriptionPlan } from "@/rtk/api/admin/subscriptions-management/subscriptionManagementAPI";

interface Props {
  subscription: SubscriptionPlan;
  subscriptionId: string;
}

export default function SubscriptionDetailsTab({ subscription }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-500 font-medium">Plan Name</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{subscription.name}</p>
        </div> */}

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-500 font-medium">Price</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {subscription.price_formatted ||
              `£${(subscription.price_pence / 100).toFixed(2)}`}{" "}
            per month
          </p>
        </div>

        {/* <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-xs text-gray-500 font-medium">
            Max Bookings/Month
          </span>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {subscription.max_bookings_per_month}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-xs text-gray-500 font-medium">
            Max Vehicles
          </span>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {subscription.max_vehicles}
          </p>
        </div> */}
      </div>

      {/* Description */}
      {subscription.description && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <span className="text-xs text-gray-500 font-medium">Description</span>
          <p className="text-gray-900 mt-2">{subscription.description}</p>
        </div>
      )}

      {/* Features */}
      {/* <div className="bg-gray-50 p-4 rounded-lg">
        <span className="text-xs text-gray-500 font-medium mb-3 block">
          Features
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            {subscription.priority_support ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">Priority Support</span>
          </div>
          <div className="flex items-center gap-2">
            {subscription.advanced_analytics ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">Advanced Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            {subscription.custom_branding ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">Custom Branding</span>
          </div>
        </div>
      </div> */}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-500 font-medium">
              Created At
            </span>
          </div>
          <p className="text-sm text-gray-900">
            {formatDate(subscription.created_at)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-500 font-medium">
              Updated At
            </span>
          </div>
          <p className="text-sm text-gray-900">
            {formatDate(subscription.updated_at)}
          </p>
        </div>
      </div>

      {/* Stripe Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <span className="text-xs text-gray-500 font-medium mb-2 block">
          Stripe Information
        </span>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-600">Stripe Price ID:</span>
            <p className="text-sm font-mono text-gray-900">
              {subscription.stripe_price_id || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-600">Active Subscriptions:</span>
            <p className="text-sm font-semibold text-gray-900">
              {subscription.active_subscriptions_count || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
