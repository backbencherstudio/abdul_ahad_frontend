import React from 'react';
import { Shield, Users, Lock, Crown, Settings } from 'lucide-react';

interface RoleStatistics {
    id: string;
    title: string;
    name: string;
    user_count: number;
    permission_count: number;
}

interface RolesBreakdownProps {
    systemRoles: RoleStatistics[];
    customRoles: RoleStatistics[];
}

export default function RolesBreakdown({ systemRoles, customRoles }: RolesBreakdownProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Roles */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-violet-600" />
                    <h3 className="text-lg font-bold text-gray-900">System Roles</h3>
                    <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-800 text-xs font-semibold rounded-full">
                        {systemRoles.length}
                    </span>
                </div>
                <div className="space-y-3">
                    {systemRoles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border border-violet-100 bg-violet-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-violet-100 rounded-lg border border-violet-200">
                                    <Shield className="w-4 h-4 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{role.title}</p>
                                    <p className="text-xs text-gray-500">{role.name}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                    <Users className="w-3 h-3" />
                                    {role.user_count}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                    <Lock className="w-3 h-3" />
                                    {role.permission_count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Roles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-gray-900">Custom Roles</h3>
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                        {customRoles.length}
                    </span>
                </div>
                <div className="space-y-3">
                    {customRoles.length > 0 ? (
                        customRoles.map((role) => (
                            <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 rounded-lg border border-amber-200">
                                        <Shield className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{role.title}</p>
                                        <p className="text-xs text-gray-500">{role.name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                        <Users className="w-3 h-3" />
                                        {role.user_count}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                        <Lock className="w-3 h-3" />
                                        {role.permission_count}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No custom roles yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

