'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/rtk';
import { useGetUsersQuery } from '@/rtk';
import {
    setCurrentPage,
    setItemsPerPage,
    setPagination,
    setStatistics,
} from '@/rtk';
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable';
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination';
import { Plus } from 'lucide-react';
import StatsCards from '@/app/(dashbaord)/_components/Admin/UserManagement/StatsCards';
import FilterSearch from '@/app/(dashbaord)/_components/Admin/UserManagement/FilterSearch';
import CreateNewUser from '@/app/(dashbaord)/_components/Admin/UserManagement/CreateNewUser'
import TableAction from '@/app/(dashbaord)/_components/Admin/UserManagement/TableAction';
import Image from 'next/image';

export default function UserManagement() {
    const dispatch = useAppDispatch();
    const { filters, pagination } = useAppSelector((state) => state.usersManagement);

    // Fetch users data
    const { data: usersData, isLoading, error, refetch } = useGetUsersQuery({
        approved: filters.approved,
        q: filters.search,
        type: filters.type,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
    });

    // Update Redux state when API data changes
    useEffect(() => {
        if (usersData) {
            dispatch(setPagination({
                totalItems: usersData.pagination.total,
                totalPages: usersData.pagination.totalPages,
            }));

            if (usersData.statistics) {
                dispatch(setStatistics(usersData.statistics));
            }
        }
    }, [usersData, dispatch]);

    // Handle page change
    const handlePageChange = (page: number) => {
        dispatch(setCurrentPage(page));
    };

    // Handle items per page change
    const handleItemsPerPageChange = (itemsPerPage: number) => {
        dispatch(setItemsPerPage(itemsPerPage));
    };

    // Table columns configuration
    const columns = [
        {
            key: 'name',
            label: 'Name',
            width: '16%',
            render: (value: string, row: any) => (
                <div className="flex items-center">
                    {row.avatar_url ? (
                        <div className="relative h-10 w-10 mr-3">
                            <Image
                                width={40}
                                height={40}
                                src={row.avatar_url}
                                alt={value}
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallbackDiv = e.currentTarget.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                    if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                }}
                            />
                            <div
                                className="avatar-fallback h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center absolute top-0 left-0 hidden"
                            >
                                <span className="text-sm font-bold text-white">
                                    {value?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-white">
                                {value?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                    )}
                    <div>
                        <div className="text-sm  text-gray-900">{value}</div>
                        {/* <div className="text-xs text-gray-500">ID: {row.id.slice(0, 8)}...</div> */}
                    </div>
                </div>
            ),
        },

        {
            key: 'email',
            label: 'Email',
            width: '16%',
            render: (value: string) => (
                <div className="text-sm text-gray-900 lowercase">{value}</div>
            ),
        },
        {
            key: 'phone_number',
            label: 'Phone',
            width: '16%',
            render: (value: string) => (
                <div className="text-sm text-gray-900">{value || 'N/A'}</div>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            width: '16%',
            render: (value: string) => (
                <span className={`inline-flex px-3 py-1 text-xs  rounded-full ${value === 'DRIVER'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : value === 'GARAGE'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : value === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                    {value?.charAt(0) + value?.slice(1).toLowerCase() || 'Unknown'}
                </span>
            ),
        },
        {
            key: 'roles',
            label: 'Roles',
            width: '16%',
            render: (_: any, row: any) => {
                const roles = Array.isArray(row.roles) ? row.roles : []
                if (roles.length === 0) return <span className="text-xs text-gray-400">—</span>

                const colorByName: Record<string, { bg: string; text: string }> = {
                    super_admin: { bg: 'bg-violet-50', text: 'text-violet-700' },
                    support_admin: { bg: 'bg-blue-50', text: 'text-blue-700' },
                    financial_admin: { bg: 'bg-amber-50', text: 'text-amber-700' },
                }

                const visible = roles.slice(0, 2)
                const restCount = roles.length - visible.length
                const restTitles = restCount > 0 ? roles.slice(2).map((r: any) => r.title).join(', ') : ''

                return (
                    <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                        {visible.map((role: any) => {
                            const c = colorByName[role.name] || { bg: 'bg-gray-50', text: 'text-gray-700' }
                            return (
                                <span
                                    key={role.id}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full ${c.bg} ${c.text} shadow-[0_0_0_1px_rgba(0,0,0,0.02)]`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${c.text.replace('text-', 'bg-')}`}></span>
                                    <span className="truncate max-w-[120px]">{role.title}</span>
                                </span>
                            )
                        })}
                        {restCount > 0 && (
                            <span
                                title={restTitles}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-gray-50 text-gray-700 shadow-[0_0_0_1px_rgba(0,0,0,0.02)]"
                            >
                                +{restCount}
                            </span>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'approved_at',
            label: 'Status',
            width: '16%',
            render: (value: string) => (
                <span className={`inline-flex px-3 py-1 text-xs  rounded-full ${value
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                    {value ? 'Unban' : 'Ban'}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            width: '16%',
            render: (value: string) => (
                <div className="text-sm text-gray-900">
                    {new Date(value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            ),
        },
    ];

    // Action buttons configuration
    const actions = [
        {
            label: 'Actions',
            variant: 'primary' as const,
            render: (row: any) => <TableAction row={row} />,
        },
    ];

    const [createOpen, setCreateOpen] = React.useState(false)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="lg:text-2xl text-xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 text-sm mt-1">Manage all users, drivers, and garages</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="border border-green-600 hover:bg-green-600 cursor-pointer text-green-600 py-2 px-3 rounded-lg font-semibold transition duration-300 flex items-center space-x-2 hover:shadow-lg hover:text-white text-sm"
                >
                    <Plus className='w-5 h-5' />
                    <span>Create New User</span>
                </button>
            </div>

            {/* Stats Cards */}
            <StatsCards statistics={usersData?.statistics} isLoading={isLoading} />

            {/* Filter & Search */}
            <FilterSearch />

            {/* Table */}
            <div className="">
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-gray-600 font-medium">Loading users...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <div className="text-red-600 mb-4 font-semibold">Error loading users</div>
                        <button
                            onClick={() => refetch()}
                            className="text-green-600 hover:text-green-700 font-semibold px-4 py-2 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        <ReusableTable
                            data={usersData?.data || []}
                            columns={columns}
                            actions={actions}
                            className="rounded-t-xl"
                        />

                        <ReusablePagination
                            currentPage={pagination.currentPage}
                            totalPages={usersData?.pagination?.totalPages || 1}
                            itemsPerPage={pagination.itemsPerPage}
                            totalItems={usersData?.pagination?.total || 0}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            className=""
                        />
                    </>
                )}
            </div>
            {/* Create User Modal */}
            <CreateNewUser open={createOpen} onClose={() => setCreateOpen(false)} />
        </div>


    );
}