import React from 'react'

interface ReusablePaginationProps {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    totalItems: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (itemsPerPage: number) => void
    className?: string
}

const itemsPerPageOptions = [5, 10, 20, 50, 100]

export default function ReusablePagination({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
    className = ""
}: ReusablePaginationProps) {
    const startIndex = (currentPage - 1) * itemsPerPage + 1
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            // Calculate range around current page
            let start = Math.max(2, currentPage - 1)
            let end = Math.min(totalPages - 1, currentPage + 1)

            // Adjust range if we're near the beginning or end
            if (currentPage <= 3) {
                end = Math.min(4, totalPages - 1)
            }
            if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3)
            }

            // Add ellipsis if needed
            if (start > 2) {
                pages.push('...' as any)
            }

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            // Add ellipsis if needed
            if (end < totalPages - 1) {
                pages.push('...' as any)
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages)
            }
        }

        return pages
    }

    if (totalPages <= 1) {
        return null
    }

    return (
        <div className={`bg-white/50 rounded-b-lg px-4 py-3 sm:px-6 border-b border-r border-l border-gray-300 ${className}`}>
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700">showing</span>
                </div>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page, index) => (
                        <button
                            key={index}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={typeof page !== 'number'}
                            className={`px-3 cursor-pointer py-1 text-sm font-medium rounded-md transition-colors ${page === currentPage
                                ? 'bg-green-500 text-white shadow-sm'
                                : typeof page === 'number'
                                    ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    : 'text-gray-400 cursor-default'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Previous/Next buttons */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="flex items-center cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Previous</span>
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="flex items-center cursor-pointer px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Tablet Layout */}
            <div className="hidden md:flex lg:hidden flex-col space-y-3">
                {/* Top row: Items per page and page info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                            {itemsPerPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-700">showing</span>
                    </div>
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>
                </div>

                {/* Bottom row: Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                        {getPageNumbers().slice(0, 7).map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && onPageChange(page)}
                                disabled={typeof page !== 'number'}
                                className={`px-2 py-1 text-sm font-medium rounded-md transition-colors ${page === currentPage
                                    ? 'bg-green-500 text-white shadow-sm'
                                    : typeof page === 'number'
                                        ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        : 'text-gray-400 cursor-default'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Prev
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex md:hidden flex-col space-y-3">
                {/* Top row: Items per page */}
                <div className="flex items-center justify-center space-x-2">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        {itemsPerPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700">showing</span>
                </div>

                {/* Middle row: Page info */}
                <div className="text-center">
                    <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages} ({totalItems} items)
                    </span>
                </div>

                {/* Bottom row: Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>

                    {/* Limited page numbers for mobile */}
                    <div className="flex items-center space-x-1">
                        {getPageNumbers().slice(0, 3).map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && onPageChange(page)}
                                disabled={typeof page !== 'number'}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${page === currentPage
                                    ? 'bg-green-500 text-white shadow-sm'
                                    : typeof page === 'number'
                                        ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        : 'text-gray-400 cursor-default'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
} 