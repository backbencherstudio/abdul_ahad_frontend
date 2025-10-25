import React from 'react';
import { Shield, Users, Lock, Settings } from 'lucide-react';

interface StatsCardsProps {
    statistics?: {
        summary: {
            total_roles: number;
            system_roles: number;
            custom_roles: number;
            total_users: number;
            total_permissions: number;
        };
    };
    isLoading?: boolean;
}

export default function StatsCards({ statistics, isLoading }: StatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Roles',
            value: statistics?.summary.total_roles || 0,
            icon: Shield,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
        {
            label: 'Total Users',
            value: statistics?.summary.total_users || 0,
            icon: Users,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Total Permissions',
            value: statistics?.summary.total_permissions || 0,
            icon: Lock,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            label: 'System / Custom',
            value: `${statistics?.summary.system_roles || 0} / ${statistics?.summary.custom_roles || 0}`,
            icon: Settings,
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        </div>
                        <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

