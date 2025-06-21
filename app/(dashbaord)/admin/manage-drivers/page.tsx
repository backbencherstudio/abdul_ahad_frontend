'use client'
import React, { useEffect, useState, useMemo } from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination'
import { Button } from '@/components/ui/button'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { toast } from 'react-toastify'
import { BellRing, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { format } from 'date-fns'

const BRAND_COLOR = '#19CA32';
const BRAND_COLOR_HOVER = '#16b82e';
const DANGER_COLOR = '#F04438';

export default function ManageDrivers() {
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openMessageModal, setOpenMessageModal] = React.useState(false);
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [openSendReminderModal, setOpenSendReminderModal] = React.useState(false);
    const [selectedDriver, setSelectedDriver] = React.useState<any>(null);
    const [message, setMessage] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startPopoverOpen, setStartPopoverOpen] = useState(false);
    const [endPopoverOpen, setEndPopoverOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/ManageDriver.json');
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load driver data');
            }
        };

        fetchData();
    }, []);

    // Define tabs with counts
    const tabs = [
        {
            key: 'all',
            label: 'All',
            count: data.length
        },
        {
            key: 'send',
            label: 'Send',
            count: data.filter(driver => driver.reminder.toLowerCase() === 'send').length
        },
        {
            key: 'default',
            label: 'Default',
            count: data.filter(driver => driver.reminder.toLowerCase() === 'default').length
        },
        {
            key: 'failed',
            label: 'Failed',
            count: data.filter(driver => driver.reminder.toLowerCase() === 'failed').length
        }
    ];

    // Filter data based on active tab and search
    const filteredData = useMemo(() => {
        let filtered = data;

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(driver => driver.reminder.toLowerCase() === activeTab);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(driver =>
                Object.values(driver).some(value =>
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

    // Selection logic
    const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedIds.includes(row.id));
    const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

    const handleSelectRow = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Date filter logic
    const motDateFilteredData = useMemo(() => {
        if (!startDate && !endDate) return filteredData;
        return filteredData.filter(driver => {
            const mot = new Date(driver.motDate);
            if (startDate && mot < startDate) return false;
            if (endDate && mot > endDate) return false;
            return true;
        });
    }, [filteredData, startDate, endDate]);
    const motPaginatedData = motDateFilteredData.slice(startIndex, startIndex + itemsPerPage);

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
        { key: 'name', label: 'Drivers Name', width: '15%' },
        { key: 'email', label: 'Email', width: '20%' },
        { key: 'phone', label: 'Contact Number', width: '15%' },
        { key: 'VehicleNumber', label: 'Vehicle Number', width: '15%' },
        { key: 'motDate', label: 'MOT Date', width: '15%' },
        {
            key: 'reminder',
            label: 'Reminder',
            width: '10%',
            render: (value: string, row: any) => (
                <span
                    className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${value.toLowerCase() === 'send'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                    onClick={() => {
                        setSelectedDriver(row);
                        setOpenMessageModal(true);
                    }}
                >
                    {value}
                </span>
            )
        },
    ]

    const handleDelete = (row: any) => {
        setSelectedDriver(row);
        setOpenDeleteModal(true);
    }

    // Delete Driver Handler
    const handleDeleteDriver = () => {
        setIsDeleting(true);
        setTimeout(() => {
            setIsDeleting(false);
            setOpenDeleteModal(false);
            toast.success('Driver deleted successfully!');
        }, 1500);
    };

    // Send Reminder Handler
    const handleSendReminder = () => {
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setOpenSendReminderModal(false);
            setMessage('');
            setSelectedIds([]);
            toast.success('Reminder sent successfully!');
        }, 1500);
    };

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

    // Add checkbox column to columns
    const columnsWithCheckbox = [
        {
            key: 'select',
            label: '',
            width: '40px',
            render: (_: any, row: any) => (
                <Checkbox
                    checked={selectedIds.includes(row.id)}
                    className='cursor-pointer'
                    onCheckedChange={() => handleSelectRow(row.id)}
                    aria-label="Select row"
                />
            )
        },
        ...columns
    ];

    return (
        <>
            <div className='mb-2 flex justify-between items-center flex-col lg:flex-row gap-4'>
                <h1 className='text-2xl font-semibold'>List of All Drivers</h1>

                {/* Date Filter Bar - always visible */}
                <div className="  flex items-center justify-end py-4 gap-4">
                    <div className="flex flex-col relative">
                        <span className="text-xs font-medium mb-1">Start Date</span>
                        <div className="flex items-center">
                            <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-40 justify-start text-left font-normal">
                                        {startDate ? format(startDate, 'dd/MM/yyyy') : 'DD/MM/YYYY'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="p-0">
                                    <div className="p-4 pb-0">
                                        <Calendar mode="single" selected={tempStartDate ?? startDate ?? undefined} onSelect={setTempStartDate} initialFocus />
                                    </div>
                                    <div className="flex justify-between gap-2 p-4 pt-2 border-t bg-white rounded-b-lg">
                                        <Button
                                            variant="outline"
                                            className="w-1/2"
                                            onClick={() => {
                                                setTempStartDate(startDate);
                                                setStartPopoverOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="w-1/2 bg-[#19CA32] hover:bg-[#16b82e] text-white"
                                            onClick={() => {
                                                setStartDate(tempStartDate);
                                                setStartPopoverOpen(false);
                                            }}
                                            disabled={!tempStartDate}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {startDate && (
                                <button
                                    className="ml-2 text-xs text-gray-500 hover:text-red-500"
                                    onClick={() => { setStartDate(null); setTempStartDate(null); }}
                                    type="button"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    {/* End Date */}
                    <div className="flex flex-col relative">
                        <span className="text-xs font-medium mb-1">End Date</span>
                        <div className="flex items-center">
                            <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-40 justify-start text-left font-normal">
                                        {endDate ? format(endDate, 'dd/MM/yyyy') : 'DD/MM/YYYY'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="p-0">
                                    <div className="p-4 pb-0">
                                        <Calendar mode="single" selected={tempEndDate ?? endDate ?? undefined} onSelect={setTempEndDate} initialFocus />
                                    </div>
                                    <div className="flex justify-between gap-2 p-4 pt-2 border-t bg-white rounded-b-lg">
                                        <Button
                                            variant="outline"
                                            className="w-1/2"
                                            onClick={() => {
                                                setTempEndDate(endDate);
                                                setEndPopoverOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="w-1/2 bg-[#19CA32] hover:bg-[#16b82e] text-white"
                                            onClick={() => {
                                                setEndDate(tempEndDate);
                                                setEndPopoverOpen(false);
                                            }}
                                            disabled={!tempEndDate}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            {endDate && (
                                <button
                                    className="ml-2 text-xs text-gray-500 hover:text-red-500"
                                    onClick={() => { setEndDate(null); setTempEndDate(null); }}
                                    type="button"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                {/* Tabs on the left */}
                <nav className="flex flex-wrap w-full lg:w-auto gap-2 lg:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-4 py-1  rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${activeTab === tab.key
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
                        placeholder="Search drivers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full lg:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                </div>
            </div>
            {/* Sticky Send Reminder Bar - only button, only when selected */}
            {selectedIds.length > 0 && (
                <div>
                    <Button
                        className="bg-[#19CA32] hover:bg-[#16b82e] text-white cursor-pointer font-semibold rounded-md"
                        size="sm"
                        onClick={() => setOpenSendReminderModal(true)}
                    >

                        Send Reminder
                        <BellRing className='w-4 h-4' />
                    </Button>
                </div>
            )}

            <ReusableTable
                data={motPaginatedData}
                columns={columnsWithCheckbox}
                actions={actions}
                className="mt-5"
            />

            {motDateFilteredData.length > 0 && (
                <ReusablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={motDateFilteredData.length}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    className=""
                />
            )}

            {/* Send Message Modal */}
            <CustomReusableModal
                isOpen={openMessageModal}
                onClose={() => setOpenMessageModal(false)}
                title="Send Message"
                showHeader={false}
                className="max-w-sm border-green-600"
            >
                <div className=" rounded-lg overflow-hidden">
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
                            onClick={handleSendReminder}
                            disabled={isSending}
                        >
                            {isSending ? <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> : null}
                            {isSending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </CustomReusableModal>

            {/* Delete Driver Account Modal */}
            <CustomReusableModal
                isOpen={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                className="max-w-sm border-[#EB3D4D]"
                customHeader={
                    <div className="bg-[#EB3D4D] text-white p-4 flex items-center justify-between rounded-t-lg">
                        <h2 className="text-lg font-semibold">Delete Driver Account</h2>

                    </div>
                }
            >
                <div className="bg-white rounded-lg overflow-hidden">
                    {/* Content */}
                    <div className="p-6 space-y-3">
                        <div className="text-sm font-medium text-gray-700">Drivers Name</div>
                        <input className="w-full border rounded-md p-2" value={selectedDriver?.name || ''} readOnly placeholder="Drivers Name" />
                        <div className="text-sm font-medium text-gray-700">Vehicle Number</div>
                        <input className="w-full border rounded-md p-2" value={selectedDriver?.VehicleNumber || ''} readOnly placeholder="Vehicle Number" />
                        <div className="text-sm font-medium text-gray-700">Email</div>
                        <input className="w-full border rounded-md p-2" value={selectedDriver?.email || ''} readOnly placeholder="Email" />
                        <div className="text-sm font-medium text-gray-700">Contact Number</div>
                        <input className="w-full border rounded-md p-2" value={selectedDriver?.phone || ''} readOnly placeholder="Contact Number" />
                        <button
                            className={`w-full bg-[${DANGER_COLOR}] hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center`}
                            onClick={handleDeleteDriver}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> : null}
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </CustomReusableModal>

            {/* Send Reminder Modal */}
            <CustomReusableModal
                isOpen={openSendReminderModal}
                onClose={() => setOpenSendReminderModal(false)}
                title="Send Reminder"
                showHeader={false}
                className="max-w-sm border-green-600"
            >
                <div className="rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className={`bg-[${BRAND_COLOR}] text-white p-4 flex items-center justify-between`}>
                        <h2 className="text-lg font-semibold">Send Reminder</h2>
                    </div>
                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Send reminder to {selectedIds.length} selected driver{selectedIds.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        <textarea
                            className="w-full border rounded-md p-2 mb-4"
                            placeholder="Enter your reminder message..."
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={isSending}
                        />
                        <button
                            className={`w-full bg-[${BRAND_COLOR}] hover:bg-[${BRAND_COLOR_HOVER}] text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center`}
                            onClick={handleSendReminder}
                            disabled={isSending}
                        >
                            {isSending ? <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> : null}
                            {isSending ? 'Sending...' : 'Send Reminder'}
                        </button>
                    </div>
                </div>
            </CustomReusableModal>
        </>
    )
}

