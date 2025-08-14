import React from 'react'

interface TableColumn {
    key: string
    label: string | React.ReactNode
    width?: string
    render?: (value: any, row: any) => React.ReactNode
}

interface TableAction {
    label: string
    onClick?: (row: any) => void
    className?: string
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
    render?: (row: any) => React.ReactNode
}

interface ReusableTableProps {
    data: any[]
    columns: TableColumn[]
    actions?: TableAction[]
    onRowClick?: (row: any) => void
    className?: string
}

const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
}

export default function ReusableTable({
    data,
    columns,
    actions,
    onRowClick,
    className = ""
}: ReusableTableProps) {
    // Use data directly (no pagination here)
    const tableData = data

    const renderCellContent = (column: TableColumn, row: any) => {
        const value = row[column.key]

        if (column.render) {
            return column.render(value, row)
        }

        if (column.key === 'status' && typeof value === 'string') {
            const statusClass = statusColors[value.toLowerCase() as keyof typeof statusColors] || statusColors.default
            return (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        }

        return value
    }

    return (
        <div className={` ${className}`}>
            {/* Table */}
            <div className="overflow-x-auto rounded-t-lg border border-gray-300">
                <table className="min-w-full divide-y divide-gray-200  w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    style={{ width: column.width }}
                                    className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden"
                                >
                                    {column.label}
                                </th>
                            ))}
                            {actions && actions.length > 0 && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.map((row, index) => (
                            <tr
                                key={index}
                                className={`capitalize ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((column) => (
                                    <td 
                                        key={column.key} 
                                        style={{ width: column.width }}
                                        className="px-6 py-4 text-sm text-gray-900 overflow-hidden"
                                    >
                                        <div className="truncate">
                                            {renderCellContent(column, row)}
                                        </div>
                                    </td>
                                ))}
                                {actions && actions.length > 0 && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {actions.map((action, actionIndex) => (
                                                action.render ? (
                                                    <React.Fragment key={actionIndex}>
                                                        {action.render(row)}
                                                    </React.Fragment>
                                                ) : (
                                                    <button
                                                        key={actionIndex}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            action.onClick?.(row)
                                                        }}
                                                        className={`px-3 py-1 rounded text-xs font-medium ${action.variant === 'danger'
                                                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                            : action.variant === 'success'
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                : action.variant === 'warning'
                                                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                            } ${action.className || ''}`}
                                                    >
                                                        {action.label}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty state */}
            {tableData.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No data available to display.
                    </p>
                </div>
            )}
        </div>
    )
}
