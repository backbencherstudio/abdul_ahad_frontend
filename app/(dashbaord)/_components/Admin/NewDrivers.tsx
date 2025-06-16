'use client'
import React from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import { MoreVertical } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'

const data = [
    {
        name: 'Cody Fisher',
        VehicleNumber: '1234567890',
        email: 'cody.fisher@gmail.com',
        phone: '+1234567890',
        motDate: '2025-01-01',
        reminder: 'active',
    },
    {
        name: 'Marvin McKinney',
        VehicleNumber: '1234567890',
        email: 'esther.howard@gmail.com',
        phone: '+1234567890',
        motDate: '2025-01-01',
        reminder: 'Deactivated',
    },
    {
        name: 'Guy Hawkins',
        VehicleNumber: '1234567890',
        email: 'jane.cooper@gmail.com',
        phone: '+1234567890',
        motDate: '2025-01-01',
        reminder: 'active',
    }
]

export default function NewDrivers() {
    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'VehicleNumber', label: 'Vehicle Number' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'motDate', label: 'MOT Date' },
        {
            key: 'reminder',
            label: 'Reminder',
            render: (value: string) => (
                <span className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${value.toLowerCase() === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {value}
                </span>
            )
        },
    ]

    const handleStatusChange = (row: any, newStatus: string) => {
        console.log('Status changed to:', newStatus, 'for:', row.name)
        // Add your status change logic here
    }

    const actions = [
        {
            label: 'Actions',
            render: (row: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 cursor-pointer w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => handleStatusChange(row, 'active')}
                            className="cursor-pointer"
                        >
                            Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleStatusChange(row, 'deactivated')}
                            className="cursor-pointer"
                        >
                            Deactivated
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-semibold '>New Drivers</h1>
                <div>
                    <button className='underline hover:text-green-600 cursor-pointer transition-all duration-300'>View All Drivers</button>
                </div>
            </div>

            <ReusableTable
                data={data}
                columns={columns}
                actions={actions}
                className="mt-4"
            />
        </>
    )
}

