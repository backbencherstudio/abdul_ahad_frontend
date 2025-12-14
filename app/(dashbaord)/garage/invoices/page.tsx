'use client'
import React, { useState, useEffect } from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
// import InvoicePageDesign from '../../_components/Garage/InvoicePageDesign' // Modal not needed
// import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal' // Modal not needed
import { useGetInvoicesQuery, useDownloadInvoiceMutation } from '@/rtk'
import { toast } from 'react-toastify'
import { useDebounce } from '@/hooks/useDebounce'
import { Loader2 } from 'lucide-react'

export default function Invoices() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    // const [selectedInvoice, setSelectedInvoice] = useState<any>(null) // Modal not needed
    // const [isModalOpen, setIsModalOpen] = useState(false) // Modal not needed

    // Debounce search term
    const debouncedSearch = useDebounce(searchTerm, 500)

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearch])

    // Fetch invoices from API with debounced search
    const { data: invoicesData, isLoading, error } = useGetInvoicesQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch
    })

    // Download invoice mutation
    const [downloadInvoice, { isLoading: isDownloading }] = useDownloadInvoiceMutation()

    // Define table columns
    const columns = [
        {
            key: 'invoice_number',
            label: 'Invoice Number',
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
            key: 'amount',
            label: 'Amount',
            render: (value: string) => `£${parseFloat(value).toFixed(2)}`
        },
        {
            key: 'status',
            label: 'Status',
            render: (value: string) => {
                const statusColors = {
                    'PAID': 'bg-[#E7F4F3] text-[#19CA32] border-[#0E9384]',
                    'PENDING': 'bg-yellow-50 text-yellow-800 border-yellow-500',
                    'OVERDUE': 'bg-red-50 text-red-600 border-red-500'
                }
                return (
                    <span className={`capitalize px-5 py-1 rounded-md border ${statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-600 border-gray-500'}`}>
                        {value.toLowerCase()}
                    </span>
                )
            }
        }
    ]

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(1)
    }

    const handleDownload = async (invoice: any) => {
        try {
            // Call download API
            const result = await downloadInvoice(invoice.id).unwrap()

            // Get PDF URL from response
            const pdfUrl = result?.data?.pdf_url

            if (pdfUrl) {
                // Create a temporary anchor element to trigger download
                const link = document.createElement('a')
                link.href = pdfUrl
                link.download = `invoice-${result?.data?.invoice_number || invoice.invoice_number}.pdf`
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                toast.success('Invoice downloaded successfully')
            } else {
                toast.error('PDF URL not found in response')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to download invoice'
            toast.error(errorMessage)
        }
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
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Downloading...</span>
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            <span>Download PDF</span>
                        </>
                    )}
                </Button>
            )
        }
    ]

    const invoices = invoicesData?.data || []
    const meta = invoicesData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }

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

            {/* Show error state */}
            {error && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-red-600 text-lg font-medium mb-2">Error loading invoices</div>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            )}

            {/* No invoices - empty state */}
            {!isLoading && !error && invoices.length === 0 && !searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-gray-600 text-lg font-medium mb-2">No invoices found</div>
                    <p className="text-gray-500">Invoices will appear here once generated</p>
                </div>
            )}

            {/* No search results */}
            {!isLoading && !error && invoices.length === 0 && searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="text-gray-600 text-lg font-medium mb-2">No results found</div>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
            )}

            {/* Table - show when loading or has data */}
            {(isLoading || (!error && invoices.length > 0)) && (
                <>
                    <ReusableTable
                        data={invoices}
                        columns={columns}
                        actions={actions}
                        className=""
                        isLoading={isLoading}
                        skeletonRows={itemsPerPage}
                    />

                    {!isLoading && (
                        <ReusablePagination
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            itemsPerPage={meta.limit}
                            totalItems={meta.total}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            className=""
                        />
                    )}
                </>
            )}

            {/* Invoice Preview Modal - Not needed anymore, PDF opens in new tab */}
            {/* <CustomReusableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Invoice Preview"
                className="max-w-4xl"
            >
                {selectedInvoice && (
                    <InvoicePageDesign invoice={selectedInvoice} />
                )}
            </CustomReusableModal> */}
        </div>
    )
}
