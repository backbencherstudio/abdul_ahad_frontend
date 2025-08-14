'use client'
import React, { useEffect, useState, useMemo } from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { toast } from 'react-toastify'

const BRAND_COLOR = '#19CA32';
const BRAND_COLOR_HOVER = '#16b82e';


export default function ManageBookings() {
    const [openMessageModal, setOpenMessageModal] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch data from JSON file
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/ManageBooking.json');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load bookings data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Define tabs with counts
    const tabs = [
        {
            key: 'all',
            label: 'All Orders',
            count: data.length
        },
        {
            key: 'accepted',
            label: 'Accepted',
            count: data.filter(booking => booking.status.toLowerCase() === 'approved').length
        },
        {
            key: 'rejected',
            label: 'Rejected',
            count: data.filter(booking => booking.status.toLowerCase() === 'rejected').length
        },
        {
            key: 'default',
            label: 'Default',
            count: data.filter(booking => booking.status.toLowerCase() === 'pending').length
        }
    ];

    // Filter data based on active tab and search
    const filteredData = useMemo(() => {
        let filtered = data;

        // Filter by tab
        if (activeTab !== 'all') {
            if (activeTab === 'accepted') {
                filtered = filtered.filter(booking => booking.status.toLowerCase() === 'accepted');
            } else if (activeTab === 'rejected') {
                filtered = filtered.filter(booking => booking.status.toLowerCase() === 'rejected');
            } else if (activeTab === 'default') {
                filtered = filtered.filter(booking => booking.status.toLowerCase() === 'default');
            }
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(booking =>
                Object.values(booking).some(value =>
                    value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        return filtered;
    }, [activeTab, searchTerm, data]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); 
    };

    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        setCurrentPage(1); 
    };

    const columns = [
        { key: 'name', label: 'Customer Name', width: '14%' },
        { key: 'registrationNumber', label: 'Registration Number', width: '15%' },
        { key: 'email', label: 'Email', width: '15%' },
        { key: 'phone', label: 'Contact Number', width: '15%' },
        { key: 'garage', label: 'Garage', width: '15%' },
        { key: 'bookingDate', label: 'Booking Date', width: '10%' },
        {
            key: 'totalAmount',
            label: 'Total',
            width: '5%',
            render: (value: string) => `$${parseFloat(value).toFixed(2)}`
        },
        {
            key: 'status',
            label: 'Status',
            width: '10%',
            render: (value: string) => (
                <span className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${value.toLowerCase() === 'accepted'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : value.toLowerCase() === 'rejected'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-[#E9E9EA] text-[#777980] border border-[#D2D2D5]'
                    }`}
                >
                    {value}
                </span>
            )
        }
    ]

    // Send Message Handler
    const handleSendMessage = () => {
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setOpenMessageModal(false);
            setMessage('');
            toast.success('Message sent successfully!');
        }, 1500);
    };

    return (
        <>
            <div className='mb-6'>
                <h1 className='text-2xl font-semibold'>View All Bookings</h1>
            </div>

            {/* Tabs and Search */}
            <div className="flex flex-col w-full lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                {/* Tabs on the left */}
                <nav className="flex flex-wrap gap-2 lg:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
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
                <div className="relative w-full lg:w-auto lg:max-w-md">
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
                        className="block w-full lg:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="mt-4 flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading bookings...</div>
                </div>
            ) : (
                <ReusableTable
                    data={paginatedData}
                    columns={columns}
                    actions={[]}
                    className="mt-5"
                />
            )}

            <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredData.length}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className=""
            />

            {/* Send Message Modal */}
            <CustomReusableModal
                isOpen={openMessageModal}
                onClose={() => setOpenMessageModal(false)}
                title="Send Message"
                showHeader={false}
                className="max-w-sm border-green-600"
            >
                <div className="bg-white rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className={`bg-[${BRAND_COLOR}] text-white p-4 flex items-center justify-between`}>
                        <h2 className="text-lg font-semibold">Send Message</h2>
                    </div>
                    {/* Content */}
                    <div className="p-6">
                        <textarea
                            className="w-full border rounded-md p-2 mb-4"
                            placeholder="Input Message"
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={isSending}
                        />
                        <button
                            className={`w-full bg-[${BRAND_COLOR}] hover:bg-[${BRAND_COLOR_HOVER}] text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center`}
                            onClick={handleSendMessage}
                            disabled={isSending}
                        >
                            {isSending ? <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> : null}
                            {isSending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </CustomReusableModal>
        </>
    )
}


