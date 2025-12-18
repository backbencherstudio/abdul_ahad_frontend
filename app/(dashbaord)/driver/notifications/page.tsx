"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGarageDriverNotifications } from '@/hooks/useGarageDriverNotifications';
import { Loader2 } from 'lucide-react';

// Helper to safely format dates
const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function Notifications() {
  const { notifications, isLoading } = useGarageDriverNotifications();

  // Filter only MOT expiry reminder notifications
  const motExpiryNotifications = (notifications as any[]).filter(
    (notification) =>
      notification?.notification_event?.type === 'mot_expiry_reminder'
  );

  // Map API data to UI-friendly structure
  const mappedNotifications = motExpiryNotifications.map((notification) => {
    const vehicle = notification.data || {};

    const expiryDate = vehicle.mot_expiry_date || notification.created_at;
    const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

    return {
      id: notification.id,
      make: vehicle.make || '-',
      model: vehicle.model || '',
      registrationNumber: vehicle.registration_number || '-',
      color: vehicle.color || '-',
      fuelType: vehicle.fuel_type || '-',
      dateRegistered: vehicle.date_registered
        ? formatDate(vehicle.date_registered)
        : '-',
      motPassDate: vehicle.mot_pass_date
        ? formatDate(vehicle.mot_pass_date)
        : '-',
      motExpiredOn: expiryDate ? formatDate(expiryDate) : '-',
      expiryDate: expiryDate ? formatDate(expiryDate) : '-',
      isExpired,
    };
  });

  // Report Field Component
  const ReportField = ({
    label,
    value,
    className = 'bg-gray-50 border-gray-300 text-gray-900',
  }: {
    label: string;
    value: string;
    className?: string;
  }) => (
    <div>
      <Label className="text-sm text-gray-600 mb-1 block">{label}</Label>
      <Input value={value} readOnly className={`${className} text-sm h-9`} />
    </div>
  );

  return (
    <div className="">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

      {/* Loading State */}
      {isLoading && mappedNotifications.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty State for MOT expiry reminders */}
      {!isLoading && mappedNotifications.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No MOT expiry notifications
          </h3>
          <p className="text-sm text-gray-500">
            You&apos;ll see your MOT expiry reminders here when they are
            generated.
          </p>
        </div>
      )}

      {/* MOT Expiry Notifications List */}
      <div className="space-y-6">
        {mappedNotifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-gray-900">
                  {notification.make} {notification.model}
                </div>
              </div>
              <div className="mt-2">
                <div className="bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold inline-block">
                  {notification.registrationNumber}
                </div>
              </div>
            </div>

            {/* Expired MOT Banner */}
            {notification.isExpired && (
              <div className="bg-red-500 text-white text-center py-4">
                <div className="text-md font-medium font-inder mb-1">
                  {notification.expiryDate}
                </div>
                <div className="sm:text-xl md:text-2xl font-inder font-semibold">
                  This Vehicle&apos;s MOT Has Expired
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <ReportField label="Colour" value={notification.color} />
                  <ReportField
                    label="MOT Pass Date"
                    value={notification.motPassDate}
                    className="bg-white border-green-300 text-green-700"
                  />
                </div>
                <div className="space-y-4">
                  <ReportField label="Fuel type" value={notification.fuelType} />
                  <ReportField
                    label="MOT expired on"
                    value={notification.motExpiredOn}
                    className="bg-white border-red-300 text-red-700"
                  />
                </div>
                <div className="space-y-4">
                  <ReportField
                    label="Date registered"
                    value={notification.dateRegistered}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
