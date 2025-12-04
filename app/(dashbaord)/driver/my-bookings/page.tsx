'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination'
import { useGetMyBookingsQuery } from '@/rtk/api/driver/bookMyMotApi'
import { useDebounce } from '@/hooks/useDebounce'
import { format } from 'date-fns'
import { setMyBookings, selectMyBookings } from '@/rtk/slices/driver/bookMyMotSlice'

// Booking data interface based on API response
interface BookingData {
    id: string
    garage_name?: string
    garageName?: string
    location?: string
    address?: string
    email?: string
    phone?: string
    phone_number?: string
    bookingDate?: string
    date?: string
    slot_date?: string
    time?: string
    start_time?: string
    end_time?: string
    totalAmount?: number
    amount?: number
    price?: number
    status: string
    vehicle_id?: string
    vehicle_registration?: string
    registration_number?: string
    [key: string]: any
}

export default function MyBookings() {
    const dispatch = useDispatch()
    const myBookingsFromSlice = useSelector(selectMyBookings)
    const [activeTab, setActiveTab] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Debounce search term
    const debouncedSearch = useDebounce(searchTerm, 500)

    // Determine status for API call - API expects 'all', 'pending', 'accepted', or 'rejected'
    const statusForApi = activeTab

    // Fetch bookings from API
    const { data: bookingsResponse, isLoading, error, refetch } = useGetMyBookingsQuery({
        search: debouncedSearch,
        status: statusForApi,
        page: currentPage,
        limit: itemsPerPage
    })

    // Store bookings in Redux slice when data is fetched
    useEffect(() => {
        if (bookingsResponse) {
            const responseData = (bookingsResponse as any)?.data || bookingsResponse
            if (responseData?.bookings) {
                dispatch(setMyBookings({
                    bookings: responseData.bookings,
                    pagination: responseData.pagination || null
                }))
            }
        }
    }, [bookingsResponse, dispatch])

    // Get response data - use API response or fallback to slice
    const responseData = useMemo(() => {
        if (bookingsResponse) {
            // API response is wrapped in ApiResponse: { success, data: { bookings: [], pagination: {}, filters: {} } }
            return (bookingsResponse as any)?.data || bookingsResponse
        }
        // Fallback to Redux slice data
        if (myBookingsFromSlice) {
            return {
                bookings: myBookingsFromSlice.bookings,
                pagination: myBookingsFromSlice.pagination
            }
        }
        return null
    }, [bookingsResponse, myBookingsFromSlice])

    // Transform API data to table format
    const bookingsData: BookingData[] = useMemo(() => {
        if (!responseData) return []
        
        // API response structure: { bookings: [], pagination: {}, filters: {} }
        const bookings = responseData?.bookings || []

        return bookings.map((booking: any) => ({
            id: booking.order_id || booking.id || '',
            garageName: booking.garage_name || 'N/A',
            location: booking.location || 'N/A',
            email: booking.email || 'N/A',
            phone: booking.phone_number || booking.phone || 'N/A',
            bookingDate: booking.booking_date || '',
            time: booking.time || booking.start_time || 'N/A',
            totalAmount: parseFloat(booking.total_amount || booking.amount || 0),
            status: booking.status?.toLowerCase() || 'pending',
            vehicle_registration: booking.vehicle_registration || 'N/A'
        }))
    }, [responseData])

    // Get total count from pagination object
    const totalCount = responseData?.pagination?.total_count || 0
    const totalPages = responseData?.pagination?.total_pages || Math.ceil(totalCount / itemsPerPage)

    // Define table columns
    const columns = [
        {
            key: 'garageName',
            label: 'Garage Name',
        },
        {
            key: 'vehicle_registration',
            label: 'Vehicle Registration',
        },
        {
            key: 'location',
            label: 'Location',
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
                if (!value) return 'N/A'
                try {
                    return format(new Date(value), 'MM/dd/yyyy')
                } catch {
                    return value
                }
            }
        },
        {
            key: 'time',
            label: 'Time',
        },
        {
            key: 'totalAmount',
            label: 'Total',
            render: (value: number) => `£${value?.toFixed(2) || '0.00'}`
        },
        {
            key: 'status',
            label: 'Status',
            render: (value: string) => {
                const status = value?.toLowerCase() || 'pending'
                const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    accepted: 'bg-green-100 text-green-800',
                    rejected: 'bg-red-100 text-red-800'
                }
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                )
            }
        }
    ]

    // Define tabs with counts
    // Note: API might not provide individual status counts, so we calculate from data
    const statusCounts = useMemo(() => {
        const allBookings = responseData?.bookings || []
        return {
            all: totalCount,
            pending: allBookings.filter((b: any) => b.status?.toLowerCase() === 'pending').length,
            accepted: allBookings.filter((b: any) => b.status?.toLowerCase() === 'accepted').length,
            rejected: allBookings.filter((b: any) => b.status?.toLowerCase() === 'rejected').length
        }
    }, [responseData, totalCount])

    const tabs = [
        {
            key: 'all',
            label: 'All Order',
            count: totalCount
        },
        {
            key: 'pending',
            label: 'Pending',
            count: statusCounts.pending
        },
        {
            key: 'accepted',
            label: 'Accepted',
            count: statusCounts.accepted
        },
        {
            key: 'rejected',
            label: 'Rejected',
            count: statusCounts.rejected
        }
    ]

    // Reset to first page when search or tab changes
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch, activeTab])

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

    const handleRowClick = (row: any) => {
        // Add your row click logic here
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-lg text-gray-600">Loading bookings...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="text-lg text-red-600">Failed to load bookings. Please try again.</div>
            </div>
        )
    }

    return (
        <div className="">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">List of all past and upcoming bookings</h1>
            </div>

            {/* Tabs and Search */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
                {/* Tabs on the left */}
                <nav className="flex flex-wrap gap-2 sm:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-4 py-1 rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${
                                activeTab === tab.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                                    {tab.count}
                                </span>
                            )}
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

            {bookingsData.length === 0 ? (
                <div className="flex justify-center items-center min-h-96">
                    <div className="text-center">
                        <p className="text-lg text-gray-600 mb-2">No bookings found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                </div>
            ) : (
                <>
                    <ReusableTable
                        data={bookingsData}
                        columns={columns}
                        onRowClick={handleRowClick}
                        className=""
                    />

                    <ReusablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalCount}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        className=""
                    />
                </>
            )}
        </div>
    )
}
