'use client'
import React from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import { useGetAllBookingsQuery } from '@/rtk/api/admin/booking-management/bookingManagementApis'
import Link from 'next/link'

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'ACCEPTED', label: 'Accepted', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-300' },
] as const;

export default function NewBookings() {
    const { data: bookingsData, isLoading } = useGetAllBookingsQuery({
        page: 1,
        limit: 5,
    });
    const allBookings = bookingsData?.data?.bookings || [];
    const bookings = allBookings.slice(0, 5);

    const getStatusColor = (status: string) => {
        const statusUpper = status?.toUpperCase() || 'PENDING';
        const statusOption = STATUS_OPTIONS.find(s => s.value === statusUpper);
        return statusOption?.color || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const columns = [
        {
            key: 'driver_name',
            label: 'Customer Name',
            width: '15%',
            render: (_: string, row: any) => row?.driver?.name || 'N/A',
        },
        {
            key: 'registration_number',
            label: 'Registration Number',
            width: '15%',
            render: (_: string, row: any) => row?.vehicle?.registration_number || 'N/A',
        },
        {
            key: 'driver_email',
            label: 'Email',
            width: '15%',
            render: (_: string, row: any) => row?.driver?.email || 'N/A',
        },
        {
            key: 'driver_phone',
            label: 'Contact Number',
            width: '15%',
            render: (_: string, row: any) => row?.driver?.phone_number || 'N/A',
        },
        {
            key: 'garage_name',
            label: 'Garage',
            width: '15%',
            render: (_: string, row: any) => row?.garage?.garage_name || 'N/A',
        },
        {
            key: 'order_date',
            label: 'Booking Date',
            width: '12%',
            render: (value: string, row: any) => {
                const dateValue = row?.order_date || value;
                if (!dateValue) return 'N/A';
                try {
                    return new Date(dateValue).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                } catch {
                    return dateValue;
                }
            },
        },
        {
            key: 'total_amount',
            label: 'Total',
            width: '10%',
            render: (value: number | string, row: any) => {
                const amount = row?.total_amount || value;
                if (!amount) return '$0.00';
                const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
                return `$${numValue.toFixed(2)}`;
            },
        },
        {
            key: 'status',
            label: 'Status',
            width: '13%',
            render: (value: string, row: any) => {
                const statusValue = row?.status || value;
                const statusUpper = statusValue?.toUpperCase() || 'PENDING';
                const statusLabel = STATUS_OPTIONS.find(s => s.value === statusUpper)?.label || statusUpper;
                return (
                    <span
                        className={`inline-flex capitalize items-center justify-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(statusValue)}`}
                    >
                        {statusLabel}
                    </span>
                );
            },
        },
    ];

    return (
        <>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-semibold'>New Bookings</h1>
                <Link href="/admin/manage-bookings" className='underline hover:text-green-600 cursor-pointer transition-all duration-300'>
                    View All Bookings
                </Link>
            </div>

            <ReusableTable
                data={bookings}
                columns={columns}
                className="mt-4"
                isLoading={isLoading}
                skeletonRows={5}
            />
        </>
    )
}