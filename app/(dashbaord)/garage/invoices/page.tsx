'use client'
import React, { useState, useMemo } from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination'
import invoicesData from '@/public/data/invoices.json'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InvoicePageDesign from '../../_components/Garage/InvoicePageDesign'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'

export default function Invoices() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Define table columns
    const columns = [
        {
            key: 'invoice_id',
            label: 'Invoice ID',
        },
        {
            key: 'membership_period',
            label: 'Membership Period',
        },
        {
            key: 'issue_date',
            label: 'Issue Date',
            render: (value: string) => {
                return new Date(value).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })
            }
        },
        {
            key: 'invoice_amount',
            label: 'Amount',
            render: (value: number) => `£${value.toFixed(2)}`
        },
        {
            key: 'invoice_status',
            label: 'Status',
            render: (value: string) => {
                return <span className={`capitalize ${value === 'paid' ? 'bg-[#E7F4F3] text-[#19CA32] px-5 py-1 rounded-md border border-[#0E9384]' : 'text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-500'}`}>{value}</span>
            }
        }
    ]

    // Filter data based on search
    const filteredData = useMemo(() => {
        let filtered = invoicesData

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(invoice =>
                Object.values(invoice).some(value =>
                    value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            )
        }

        return filtered
    }, [searchTerm])

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

    const handleDownload = (invoice: any) => {
        setSelectedInvoice(invoice)
        setIsModalOpen(true)
    }

    // Define actions with download button
    const actions = [
        {
            label: 'Download',
            render: (row: any) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex cursor-pointer items-center gap-2 text-red-600 hover:text-red-800"
                    onClick={() => handleDownload(row)}
                >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                </Button>
            )
        }
    ]

    return (
        <div className="">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">List of All Invoices</h1>
            </div>

            {/* Search */}
            <div className="flex justify-end mb-4">
                <div className="relative w-full sm:w-auto sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search invoices..."
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

            {/* Invoice Preview Modal */}
            <CustomReusableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Invoice Preview"
                className="max-w-4xl"
            >
                {selectedInvoice && (
                    <InvoicePageDesign invoice={selectedInvoice} />
                )}
            </CustomReusableModal>
        </div>
    )
}
