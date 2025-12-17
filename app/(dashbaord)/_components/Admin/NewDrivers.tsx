'use client'
import React from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import Link from 'next/link'
import { useGetAllDriversQuery } from '@/rtk/api/admin/driverManagement/driver-managementApis'
import { format } from 'date-fns'

export default function NewDrivers() {

    // Fetch only 5 drivers from API
    const { data: apiData, isLoading: loading } = useGetAllDriversQuery({
        page: 1,
        limit: 5,
    });

    // Map API data to table format
    const data = React.useMemo(() => {
        const drivers = apiData?.data?.drivers || [];
        return drivers.map((driver: any) => ({
            id: driver.id,
            name: driver.name || '',
            email: driver.email || '',
            phone: driver.phone_number || 'N/A',
            createdAt: driver.created_at || '',
        }));
    }, [apiData]);

    const columns = [
        { key: 'name', label: 'Drivers Name', width: '25%' },
        { key: 'email', label: 'Email', width: '25%' },
        { key: 'phone', label: 'Contact Number', width: '25%' },
        { 
            key: 'createdAt', 
            label: 'Created At', 
            width: '25%',
            render: (value: any) => {
                if (!value) return 'N/A';
                try {
                    return format(new Date(value), 'dd/MM/yyyy');
                } catch {
                    return 'N/A';
                }
            }
        },
    ]

    return (
        <div className="w-full">
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-semibold '>New Drivers</h1>
                <div>
                    <Link href="/admin/manage-drivers" className='underline hover:text-green-600 cursor-pointer transition-all duration-300'>View All Drivers</Link>
                </div>
            </div>

            <div className="mt-4 w-full">
                <ReusableTable
                    data={data}
                    columns={columns}
                    className="w-full"
                    isLoading={loading}
                    skeletonRows={5}
                />
            </div>
        </div>
    )
}

