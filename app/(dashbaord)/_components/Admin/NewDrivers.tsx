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
            VehicleNumber: driver.vehicle_registration_number || 'N/A',
            motDate: 'N/A', // Vehicle MOT date not in main response
        }));
    }, [apiData]);

    const columns = [
        { key: 'name', label: 'Drivers Name', width: '20%' },
        { key: 'email', label: 'Email', width: '25%' },
        { key: 'phone', label: 'Contact Number', width: '20%' },
        { key: 'VehicleNumber', label: 'Vehicle Number', width: '20%' },
        { 
            key: 'motDate', 
            label: 'MOT Date', 
            width: '15%',
            render: (value: any) => {
                if (!value || value === 'N/A') return 'N/A';
                try {
                    return format(new Date(value), 'dd/MM/yyyy');
                } catch {
                    return 'N/A';
                }
            }
        },
    ]

    return (
        <>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-semibold '>New Drivers</h1>
                <div>
                    <Link href="/admin/manage-drivers" className='underline hover:text-green-600 cursor-pointer transition-all duration-300'>View All Drivers</Link>
                </div>
            </div>

            <ReusableTable
                data={data}
                columns={columns}
                className="mt-4"
                isLoading={loading}
                skeletonRows={5}
            />
        </>
    )
}

