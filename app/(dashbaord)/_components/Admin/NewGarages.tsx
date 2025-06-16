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
        subscription: 'subscribed',
        email: 'cody.fisher@example.com',
        phone: '+1234567890',
        subscription_date: '2025-01-01',
        status: 'active',
    },
    {
        name: 'Marvin McKinney',
        subscription: 'Non Subscribed',
        email: 'esther.howard@example.com',
        phone: '+1234567890',
        subscription_date: '2025-01-01',
        status: 'Deactivated',
    },
    {
        name: 'Guy Hawkins',
        subscription: 'Subscribed',
        email: 'jane.cooper@example.com',
        phone: '+1234567890',
        subscription_date: '2025-01-01',
        status: 'active',
    }
]

export default function NewGarages() {
    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'subscription', label: 'Subscription' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'subscription_date', label: 'Subscription Date' },
        {
            key: 'status',
            label: 'Status',
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
                <h1 className='text-2xl font-semibold '>New Garages</h1>
                <div>
                    <button className='underline hover:text-green-600 cursor-pointer transition-all duration-300'>View All Garages</button>
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
