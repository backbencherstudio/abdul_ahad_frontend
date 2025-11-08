import React from 'react';
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal';
import { useGetRoleByIdQuery } from '@/rtk';
import { Shield, Calendar, Key, Users } from 'lucide-react';

interface ViewRoleDetailsModalProps {
    open: boolean;
    onClose: () => void;
    roleId: string | null;
}

export default function ViewRoleDetailsModal({ open, onClose, roleId }: ViewRoleDetailsModalProps) {
    const { data: roleResponse, isLoading } = useGetRoleByIdQuery(roleId || '', { skip: !roleId });
    const role = roleResponse?.data;

    return (
        <CustomReusableModal
            isOpen={open}
            onClose={onClose}
            showHeader
            className="!max-w-2xl"
            title="Role Details"
            description="View role information and permissions"
        >
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">Loading role details...</span>
                </div>
            ) : role ? (
                <div className="space-y-6">
                    {/* Role Header */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                                <Shield className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{role.title}</h3>
                                <p className="text-sm text-gray-600">{role.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Role Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Key className="w-4 h-4 text-gray-600" />
                                <label className="text-xs font-semibold text-gray-600 uppercase">Role Name</label>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{role.name}</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-gray-600" />
                                <label className="text-xs font-semibold text-gray-600 uppercase">Display Title</label>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{role.title}</p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-gray-600" />
                                <label className="text-xs font-semibold text-gray-600 uppercase">Permissions</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                                    {role.permission_count || 0} Permission{(role.permission_count || 0) !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <label className="text-xs font-semibold text-gray-600 uppercase">Created At</label>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {new Date(role.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* System Role Badge */}
                    {role.name === 'super_admin' && (
                        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-violet-100 rounded-lg">
                                    <Shield className="w-5 h-5 text-violet-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-violet-900">System Role</h4>
                                    <p className="text-xs text-violet-700 mt-1">
                                        This is a protected system role with full access to all features and permissions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">Role not found</p>
                </div>
            )}
        </CustomReusableModal>
    );
}

