'use client'
import React, { useState, useMemo } from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination'
import customerData from '@/public/data/customerData.json'
import { MoreVertical } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'

export default function Bookings() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Define table columns
    const columns = [
        {
            key: 'name',
            label: 'Customer',
        },
        {
            key: 'regNumber',
            label: 'Reg. Number',
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'phone',
            label: 'Number',
        },
        {
            key: 'bookingDate',
            label: 'Booking Date',
            render: (value: string) => {
                return new Date(value).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })
            }
        },
        {
            key: 'time',
            label: 'Time',
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (value: number) => `$${value.toFixed(2)}`
        },
        {
            key: 'status',
            label: 'Status',
        }
    ]

    // Define tabs with counts
    const tabs = [
        {
            key: 'all',
            label: 'All Order',
            count: customerData.length
        },
        {
            key: 'pending',
            label: 'Pending',
            count: customerData.filter(booking => booking.status.toLowerCase() === 'pending').length
        },
        {
            key: 'accepted',
            label: 'Accepted',
            count: customerData.filter(booking => booking.status.toLowerCase() === 'accepted').length
        },
        {
            key: 'rejected',
            label: 'Rejected',
            count: customerData.filter(booking => booking.status.toLowerCase() === 'rejected').length
        }
    ]

    // Filter data based on active tab and search
    const filteredData = useMemo(() => {
        let filtered = customerData

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(booking => booking.status.toLowerCase() === activeTab)
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(booking =>
                Object.values(booking).some(value =>
                    value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            )
        }

        return filtered
    }, [activeTab, searchTerm])

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(1)
    }

    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey)
        setCurrentPage(1)
    }

    // Define actions with dropdown
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
                            onClick={() => handleAccept(row.id)}
                            className="cursor-pointer"
                        >
                            Accept
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleReject(row.id)}
                            className="cursor-pointer"
                        >
                            Reject
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const handleAccept = (id: number) => {
        console.log('Accepted booking:', id)
        // Add your accept logic here
    }

    const handleReject = (id: number) => {
        console.log('Rejected booking:', id)
        // Add your reject logic here
    }

    return (
        <div className="">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">List of all Bookings</h1>
            </div>

            {/* Tabs and Search */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
                {/* Tabs on the left */}
                <nav className="flex flex-wrap gap-2 sm:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-4 py-1 rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${activeTab === tab.key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Search on the right */}
                <div className="relative w-full xl:w-auto xl:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full xl:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            <ReusableTable
                data={paginatedData}
                columns={columns}
                actions={actions}
                className=""
            />
            
            <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredData.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className=""
            />
        </div>
    )
}
