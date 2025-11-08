import React from 'react'
import { Users, CheckCircle, Ban, Shield } from 'lucide-react'

interface Statistics {
    total_users: number;
    total_banned_users: number;
    total_admin_users: number;
    total_garage_users: number;
    total_driver_users: number;
    total_approved_users: number;
}

interface StatsCardsProps {
    statistics?: Statistics;
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
            label: 'Total Users',
            value: statistics?.total_users || 0,
            icon: Users,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Approved',
            value: statistics?.total_approved_users || 0,
            icon: CheckCircle,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            label: 'Banned',
            value: statistics?.total_banned_users || 0,
            icon: Ban,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
        },
        {
            label: 'Admins',
            value: statistics?.total_admin_users || 0,
            icon: Shield,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
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