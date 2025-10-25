'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetUserByIdQuery } from '@/rtk';
import { ArrowLeft, Mail, Phone, Calendar, Shield, CheckCircle, XCircle, Lock, MapPin, CreditCard, Crown, Warehouse, Car } from 'lucide-react';
import Image from 'next/image';

export default function UserDetails() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const { data: response, isLoading, error } = useGetUserByIdQuery(userId);
    const user = response?.data;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading user details...</span>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="text-center py-16">
                <div className="text-red-600 mb-4 font-semibold">Error loading user details</div>
                <button
                    onClick={() => router.back()}
                    className="text-green-600 hover:text-green-700 font-semibold px-4 py-2 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Group permissions by subject (with safety check)
    const groupedPermissions = (user.permissions || []).reduce((acc: any, permission) => {
        const subject = permission.subject;
        if (!acc[subject]) {
            acc[subject] = [];
        }
        acc[subject].push(permission);
        return acc;
    }, {});

    // Color mapping for roles
    const roleColorMap: Record<string, { bg: string; text: string; border: string }> = {
        super_admin: { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
        support_admin: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
        financial_admin: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
        operations_admin: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    };

    // Action color mapping
    const actionColorMap: Record<string, string> = {
        Read: 'bg-blue-50 text-blue-700 border-blue-200',
        Create: 'bg-green-50 text-green-700 border-green-200',
        Update: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        Delete: 'bg-red-50 text-red-700 border-red-200',
        Show: 'bg-purple-50 text-purple-700 border-purple-200',
        Refund: 'bg-orange-50 text-orange-700 border-orange-200',
        Cancel: 'bg-gray-50 text-gray-700 border-gray-200',
        Assign: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        Generate: 'bg-pink-50 text-pink-700 border-pink-200',
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-1.5 sm:p-2 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">User Details</h1>
                    <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">Complete information about this user</p>
                </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-white rounded-xl  overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-28 sm:h-32"></div>
                <div className="px-4 sm:px-6 pb-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0 -mt-12 sm:-mt-16">
                            {user.avatar_url || user.avatar ? (
                                <div className="relative h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white rounded-full overflow-hidden bg-white">
                                    <Image
                                        width={200}
                                        height={200}
                                        src={user.avatar_url || user.avatar || ''}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            // Hide image and show fallback on error
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `
                                                    <div class="h-full w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                        <span class="text-2xl sm:text-3xl font-bold text-white">
                                                            ${user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                `;
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-white">
                                    <span className="text-2xl sm:text-3xl font-bold text-white">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 sm:mt-4 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate capitalize">{user.name}</h2>

                                        {/* Super Admin Crown Badge */}
                                        {user.roles?.some(role => role.name === 'super_admin') && (
                                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-semibold rounded-full ">
                                                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                                <span className="">KING</span>
                                            </span>
                                        )}

                                        {/* Garage Badge */}
                                        {user.type === 'GARAGE' && (
                                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-semibold rounded-full ">
                                                <Warehouse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                                <span className="">GARAGE</span>
                                            </span>
                                        )}

                                        {/* Driver Badge */}
                                        {user.type === 'DRIVER' && (
                                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full">
                                                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                                <span className="">DRIVER</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full ${user.type === 'DRIVER'
                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                        : user.type === 'GARAGE'
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : user.type === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                        {user.type?.charAt(0) + user.type?.slice(1).toLowerCase() || 'Unknown'}
                                    </span>
                                    <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full ${user.approved_at
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                        }`}>
                                        {user.approved_at ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                                Banned
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                        <Mail className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-500 text-xs">Email</p>
                                        <p className="text-gray-900 font-medium lowercase text-xs sm:text-sm truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                        <Phone className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-500 text-xs">Phone</p>
                                        <p className="text-gray-900 font-medium text-xs sm:text-sm truncate">{user.phone_number || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-500 text-xs">Created At</p>
                                        <p className="text-gray-900 font-medium text-xs sm:text-sm truncate">
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-gray-500 text-xs">Updated At</p>
                                        <p className="text-gray-900 font-medium text-xs sm:text-sm truncate">
                                            {new Date(user.updated_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {user.billing_id && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                            <CreditCard className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-gray-500 text-xs">Billing ID</p>
                                            <p className="text-gray-900 font-medium text-xs truncate">{user.billing_id}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Only show for ADMIN users */}
            {user.type === 'ADMIN' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white rounded-xl  p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm font-medium">Total Roles</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{user.role_count || 0}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl  p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm font-medium">Total Permissions</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{user.permission_count || 0}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl  p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm font-medium">Permission Subjects</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{Object.keys(groupedPermissions).length}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Roles Section - Only show for ADMIN users */}
            {user.type === 'ADMIN' && (
                <div className="bg-white rounded-xl  p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Assigned Roles</h3>
                        <span className="ml-1 sm:ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                            {(user.roles || []).length}
                        </span>
                    </div>
                    {(user.roles || []).length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {(user.roles || []).map((role) => {
                                const colors = roleColorMap[role.name] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
                                return (
                                    <div key={role.id} className={`p-3 sm:p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <h4 className={`font-semibold text-sm sm:text-base ${colors.text} truncate`}>{role.title}</h4>
                                                <p className={`text-xs ${colors.text} opacity-75 mt-1 truncate`}>{role.name}</p>
                                            </div>
                                            <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text} flex-shrink-0`} />
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2 sm:mt-3">
                                            Assigned: {new Date(role.assigned_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Shield className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No roles assigned</p>
                        </div>
                    )}
                </div>
            )}

            {/* Permission Summary - Only show for ADMIN users */}
            {user.type === 'ADMIN' && user.permission_summary && (
                <div className="bg-white rounded-xl  p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Permission Summary</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {Object.entries(user.permission_summary).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 gap-2">
                                <span className="text-xs sm:text-sm text-gray-700 font-medium truncate flex-1">
                                    {key.replace(/_/g, ' ').replace(/can /g, '').split(' ').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </span>
                                {value ? (
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Permissions - Only show for ADMIN users */}
            {user.type === 'ADMIN' && (
                <div className="bg-white rounded-xl  p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Detailed Permissions</h3>
                        <span className="ml-1 sm:ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {(user.permissions || []).length}
                        </span>
                    </div>
                    {Object.keys(groupedPermissions).length > 0 ? (
                        <div className="space-y-4 sm:space-y-6">
                            {Object.entries(groupedPermissions).map(([subject, permissions]: [string, any]) => (
                                <div key={subject} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex flex-wrap items-center gap-2">
                                        <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-800 text-xs sm:text-sm rounded-full">
                                            {subject}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({permissions.length} permission{permissions.length > 1 ? 's' : ''})
                                        </span>
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {permissions.map((permission: any) => (
                                            <span
                                                key={permission.id}
                                                className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-lg border ${actionColorMap[permission.action] || 'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}
                                            >
                                                {permission.action}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Lock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No permissions assigned</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
