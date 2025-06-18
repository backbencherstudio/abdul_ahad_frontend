'use client'
import React, { useEffect, useState, useMemo } from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination'
import { MoreVertical, Trash2, Loader2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { toast } from 'react-toastify'


const BRAND_COLOR = '#19CA32';
const BRAND_COLOR_HOVER = '#16b82e';
const DANGER_COLOR = '#F04438';

export default function ManageGarages() {
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openMessageModal, setOpenMessageModal] = React.useState(false);
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [selectedGarage, setSelectedGarage] = React.useState<any>(null);
    const [message, setMessage] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/ManageGarageData.json');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load garage data');
            }
        };

        fetchData();
    }, []);

    // Define tabs with counts
    const tabs = [
        {
            key: 'all',
            label: 'All Garages',
            count: data.length
        },
        {
            key: 'paid',
            label: 'Paid',
            count: data.filter(garage => garage.subscription.toLowerCase() === 'paid').length
        },
        {
            key: 'unpaid',
            label: 'Unpaid',
            count: data.filter(garage => garage.subscription.toLowerCase() === 'unpaid').length
        }
    ];

    // Filter data based on active tab and search
    const filteredData = useMemo(() => {
        let filtered = data;

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(garage => garage.subscription.toLowerCase() === activeTab);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(garage =>
                Object.values(garage).some(value =>
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
        setCurrentPage(1); // Reset to first page when items per page changes
    };

    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        setCurrentPage(1); // Reset to first page when tab changes
    };

    const columns = [
        {
            key: 'garage_name',
            label: 'Garage Name',
            width: '30%',
            render: (value: string, row: any) => (
                <div className="flex items-center justify-between gap-2">
                    <span className="truncate block">{value}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 flex items-center justify-center cursor-pointer">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-4 space-y-2">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Primary Contact Person</div>
                                <div className="font-medium text-sm mb-2">{row.name}</div>
                                <div className="text-xs text-gray-500 mb-1">VTS Number</div>
                                <div className="mb-2 text-sm">{row.vts}</div>
                                <div className="text-xs text-gray-500 mb-1">Email</div>
                                <div className="mb-2 text-sm">{row.email}</div>
                                <div className="text-xs text-gray-500 mb-1">Number</div>
                                <div className="mb-2 text-sm">{row.phone}</div>
                                <div className="text-xs text-gray-500 mb-1">Address</div>
                                <div className="mb-2 text-sm">{row.address}</div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
        {
            key: 'subscription_date',
            label: 'Subscription Date',
            width: '15%'
        },
        {
            key: 'subscription',
            label: 'Subscription',
            width: '15%',
            render: (value: string) => (
                <span className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${value.toLowerCase() === 'paid'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'listing',
            label: 'Listing',
            width: '15%',
            render: (value: string, row: any) => (
                <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${value.toLowerCase() === 'active'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                        {value}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 flex items-center justify-center cursor-pointer">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className=" space-y-2">
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start ${value.toLowerCase() === 'active' ? 'bg-green-50' : ''}`}
                                    onClick={() => {
                                        // Add your status change logic here
                                        console.log('Set to Active')
                                    }}
                                >
                                    Active
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start ${value.toLowerCase() === 'deactive' ? 'bg-red-50' : ''}`}
                                    onClick={() => {
                                        // Add your status change logic here
                                        console.log('Set to Deactive')
                                    }}
                                >
                                    Deactive
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
        {
            key: 'message',
            label: 'Message',
            width: '15%',
            render: (value: string, row: any) => (
                <span
                    className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${value.toLowerCase() === 'send'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-[#F5F5F5] text-[#666666] border border-[#666666]'
                        }`}
                    onClick={() => {
                        if (value.toLowerCase() === 'send') {
                            setSelectedGarage(row);
                            setOpenMessageModal(true);
                        }
                    }}
                >
                    {value}
                </span>
            )
        },

    ]

    const handleDelete = (row: any) => {
        setSelectedGarage(row);
        setOpenDeleteModal(true);
    }

    const actions = [
        {
            label: '',
            render: (row: any) => (
                <Button variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center bg-red-100 border border-red-300 cursor-pointer text-red-600 hover:bg-red-100" onClick={() => handleDelete(row)}>
                    <Trash2 className="h-5 w-5" />
                </Button>
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

    // Delete Garage Handler
    const handleDeleteGarage = () => {
        setIsDeleting(true);
        setTimeout(() => {
            setIsDeleting(false);
            setOpenDeleteModal(false);
            toast.success('Garage deleted successfully!');
        }, 1500);
    };

    return (
        <>
            <div className='mb-6'>
                <h1 className='text-2xl font-semibold'>List of All Garages</h1>
            </div>

            {/* Tabs and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
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
                <div className="relative w-full sm:w-auto sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search garages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            <ReusableTable
                data={paginatedData}
                columns={columns}
                actions={actions}
                className="mt-5"
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
                            {isSending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                            {isSending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </CustomReusableModal>

            {/* Delete Garage Account Modal */}
            <CustomReusableModal
                isOpen={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                title="Delete Garage Account"
                showHeader={false}
                className="max-w-sm border-red-600"
            >
                <div className="bg-white rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className={`bg-[${DANGER_COLOR}] text-white p-4 flex items-center justify-between`}>
                        <h2 className="text-lg font-semibold">Delete Garage Account</h2>
                    </div>
                    {/* Content */}
                    <div className="p-6 space-y-3">
                        {/* lebel name */}
                        <div className="text-sm font-medium text-gray-700">Garage Name</div>
                        <input className="w-full border rounded-md p-2" value={selectedGarage?.name || ''} readOnly placeholder="Garage Name" />
                        <div className="text-sm font-medium text-gray-700">Vehicle Number</div>
                        <input className="w-full border rounded-md p-2" value={selectedGarage?.vts || ''} readOnly placeholder="VTS" />
                        <div className="text-sm font-medium text-gray-700">Email</div>
                        <input className="w-full border rounded-md p-2" value={selectedGarage?.email || ''} readOnly placeholder="Email" />
                        <div className="text-sm font-medium text-gray-700">Contact Number</div>
                        <input className="w-full border rounded-md p-2" value={selectedGarage?.phone || ''} readOnly placeholder="Contact Number" />
                        <button
                            className={`w-full bg-[${DANGER_COLOR}] hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center`}
                            onClick={handleDeleteGarage}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </CustomReusableModal>
        </>
    )
}
