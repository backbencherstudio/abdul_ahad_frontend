'use client';

import React, { useEffect } from 'react';
import { useGetRolesQuery, useDeleteRoleMutation, useGetStatisticsDataQuery, useAppDispatch, useAppSelector } from '@/rtk';
import { setCurrentPage, setItemsPerPage, setPagination } from '@/rtk';
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable';
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination';
import { Plus, Shield, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import CreateRoleModal from '../../_components/Admin/RoleManagement/CreateRoleModal';
import ViewRoleDetailsModal from '../../_components/Admin/RoleManagement/ViewRoleDetailsModal';
import RoleTableActions from '../../_components/Admin/RoleManagement/RoleTableActions';
import StatsCards from '../../_components/Admin/RoleManagement/StatsCards';
import RolesBreakdown from '../../_components/Admin/RoleManagement/RolesBreakdown';
import AssignPermissionsModal from '../../_components/Admin/RoleManagement/AssignPermissionsModal';
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal';
import { Button } from '@/components/ui/button';


export default function RolesManagement() {
    const dispatch = useAppDispatch();
    const { pagination } = useAppSelector((state) => state.roleManagement);

    // Fetch roles data using Redux pagination state
    const { data: rolesData, isLoading, error, refetch } = useGetRolesQuery({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
    });

    const { data: statsData, isLoading: loadingStats } = useGetStatisticsDataQuery();
    const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

    const [createOpen, setCreateOpen] = React.useState(false);
    const [editRoleId, setEditRoleId] = React.useState<string | null>(null);
    const [viewRoleId, setViewRoleId] = React.useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
    const [roleToDelete, setRoleToDelete] = React.useState<{ id: string; name: string; title: string; userCount?: number } | null>(null);
    const [assignPermissionsOpen, setAssignPermissionsOpen] = React.useState(false);
    const [roleForPermissions, setRoleForPermissions] = React.useState<{ id: string; name: string; title: string } | null>(null);

    // Update Redux pagination state when API data changes
    useEffect(() => {
        if (rolesData?.data?.pagination) {
            const apiPagination = rolesData.data.pagination;
            dispatch(setPagination({
                totalItems: apiPagination.total || 0,
                totalPages: apiPagination.pages || 1,
            }));
        }
    }, [rolesData, dispatch]);

    const handleDeleteClick = (id: string, name: string, title: string) => {
        if (name === 'super_admin') {
            toast.error('Cannot delete Super Admin role');
            return;
        }

        // Find user count from statistics
        const stats = statsData?.data;
        let userCount = 0;
        if (stats) {
            const systemRole = stats.system_roles.find(r => r.id === id);
            const customRole = stats.custom_roles.find(r => r.id === id);
            userCount = systemRole?.user_count || customRole?.user_count || 0;
        }

        setRoleToDelete({ id, name, title, userCount });
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!roleToDelete) return;

        try {
            const result = await deleteRole(roleToDelete.id).unwrap() as any;

            if (result && typeof result === 'object' && 'success' in result) {
                if (result.success) {
                    toast.success('Role deleted successfully');
                    setDeleteConfirmOpen(false);
                    setRoleToDelete(null);
                } else {
                    const errorMsg = result.message || 'Failed to delete role';
                    toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
                }
            } else {
                toast.success('Role deleted successfully');
                setDeleteConfirmOpen(false);
                setRoleToDelete(null);
            }
        } catch (err: any) {
            let errorMessage = 'Failed to delete role';

            if (err?.data) {
                if (err.data.message?.message) {
                    const msg = err.data.message.message;
                    errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
                } else if (err.data.message) {
                    errorMessage = typeof err.data.message === 'string'
                        ? err.data.message
                        : JSON.stringify(err.data.message);
                }
            } else if (err?.message) {
                errorMessage = err.message;
            }

            toast.error(errorMessage);
        }
    };

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
            key: 'title',
            label: 'Role Name',
            width: '40%',
            render: (value: string, row: any) => {
                const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                    super_admin: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
                    support_admin: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                    financial_admin: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                    operations_admin: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                };
                const colors = colorMap[row.name] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

                return (
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${colors.bg} border ${colors.border}`}>
                            <Shield className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">{value}</div>
                            <div className="text-xs text-gray-500">{row.name}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'permission_count',
            label: 'Permissions',
            width: '30%',
            render: (value: number) => (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                    {value || 0} Permission{(value || 0) !== 1 ? 's' : ''}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            width: '20%',
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

    // Action buttons
    const actions = [
        {
            label: 'Actions',
            variant: 'primary' as const,
            render: (row: any) => (
                <RoleTableActions
                    role={{ id: row.id, name: row.name, title: row.title }}
                    onViewDetails={(id) => setViewRoleId(id)}
                    onManagePermissions={(role) => {
                        setRoleForPermissions(role);
                        setAssignPermissionsOpen(true);
                    }}
                    onEdit={(id) => setEditRoleId(id)}
                    onDelete={handleDeleteClick}
                />
            ),
        },
    ];

    // Extract roles and stats data
    const roles = rolesData?.data?.roles || [];
    const stats = statsData?.data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="lg:text-2xl text-xl font-bold text-gray-900">Roles Management</h1>
                    <p className="text-gray-600 text-sm mt-1">Manage roles and their permissions</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="border border-green-600 hover:bg-green-600 bg-green-600 cursor-pointer text-white py-2 px-3 rounded-lg font-semibold transition duration-300 flex items-center space-x-2 hover:shadow-lg hover:text-white text-sm"
                >
                    <Plus className='w-5 h-5' />
                    <span>Create New Role</span>
                </button>
            </div>

            {/* Stats Cards */}
            <StatsCards statistics={stats} isLoading={loadingStats} />

            {/* System & Custom Roles Breakdown */}
            {!loadingStats && stats && (
                <RolesBreakdown
                    systemRoles={stats.system_roles}
                    customRoles={stats.custom_roles}
                />
            )}

            {/* Table */}
            <div className="">
                {error ? (
                    <div className="text-center py-16">
                        <div className="text-red-600 mb-4 font-semibold">Error loading roles</div>
                        <button
                            onClick={() => refetch()}
                            className="text-green-600 hover:text-green-700 font-semibold px-4 py-2 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                ) : !isLoading && roles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium">No roles found</p>
                        <p className="text-gray-400 text-sm mt-1">Create your first role to get started</p>
                    </div>
                ) : (
                    <>
                        <ReusableTable
                            data={roles}
                            columns={columns}
                            actions={actions}
                            className="rounded-t-xl"
                            isLoading={isLoading}
                            skeletonRows={pagination.itemsPerPage}
                        />

                        {!isLoading && (
                            <ReusablePagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                itemsPerPage={pagination.itemsPerPage}
                                totalItems={pagination.totalItems}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                className=""
                            />
                        )}
                    </>
                )}
            </div>

            {/* Create/Edit Role Modal */}
            <CreateRoleModal
                open={createOpen || !!editRoleId}
                onClose={() => {
                    setCreateOpen(false);
                    setEditRoleId(null);
                }}
                editRoleId={editRoleId}
            />

            {/* View Role Details Modal */}
            <ViewRoleDetailsModal
                open={!!viewRoleId}
                onClose={() => setViewRoleId(null)}
                roleId={viewRoleId}
            />

            {/* Assign Permissions Modal */}
            {roleForPermissions && (
                <AssignPermissionsModal
                    open={assignPermissionsOpen}
                    onClose={() => {
                        setAssignPermissionsOpen(false);
                        setRoleForPermissions(null);
                    }}
                    roleId={roleForPermissions.id}
                    roleName={roleForPermissions.title}
                />
            )}

            {/* Delete Confirmation Modal */}
            <CustomReusableModal
                isOpen={deleteConfirmOpen}
                onClose={() => !deleting && setDeleteConfirmOpen(false)}
                showHeader
                className="max-w-md"
                title="Delete Role"
                description="This action cannot be undone."
                icon={<Trash2 className="w-5 h-5" />}
                variant="danger"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            Are you sure you want to delete the role <span className="font-semibold">"{roleToDelete?.title}"</span>?
                        </p>
                        {roleToDelete?.userCount !== undefined && roleToDelete.userCount > 0 && (
                            <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded">
                                <p className="text-xs font-semibold text-red-900 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {roleToDelete.userCount} user{roleToDelete.userCount > 1 ? 's' : ''} currently assigned to this role
                                </p>
                                <p className="text-xs text-red-700 mt-1">
                                    ⚠️ You must remove all role assignments before deletion.
                                </p>
                            </div>
                        )}
                        {(!roleToDelete?.userCount || roleToDelete.userCount === 0) && (
                            <p className="text-xs text-red-600 mt-2">
                                This role will be permanently deleted from the system.
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                                setDeleteConfirmOpen(false);
                                setRoleToDelete(null);
                            }}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 cursor-pointer"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Role'}
                        </Button>
                    </div>
                </div>
            </CustomReusableModal>
        </div>
    );
}
