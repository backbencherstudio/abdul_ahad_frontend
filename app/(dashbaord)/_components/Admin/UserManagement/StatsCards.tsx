import React from 'react'
import { Users, CheckCircle, Ban, Shield, LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

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

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    colors: {
        bg: string;
        text: string;
        icon: string;
        accent: string;
        shadow?: string;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colors }) => (
    <div className={`group relative bg-gradient-to-br ${colors.bg} rounded-xl sm:rounded-2xl  ${colors.shadow ? `hover:${colors.shadow}` : ''} p-4 sm:p-6 text-white transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 overflow-hidden`}>

        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="space-y-1 sm:space-y-2">
                <p className={`${colors.text} text-xs sm:text-sm font-medium tracking-wide`}>{title}</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{value}</p>
                <div className={`w-8 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r ${colors.accent} rounded-full`}></div>
            </div>

            <div className="p-2 border border-white/40 sm:p-3 lg:p-4 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl group-hover:bg-white/15 transition-all duration-300 group-hover:rotate-6 self-end sm:self-auto">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${colors.icon}`} />
            </div>
        </div>

        <div className={`absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ${colors.accent.replace('from-', 'bg-').replace('to-', '').split('-')[0]}-500/10 rounded-full group-hover:scale-125 transition-transform duration-500`}></div>
    </div>
);

export default function StatsCards({ statistics, isLoading }: StatsCardsProps) {
    const stats = [
        {
            title: 'Total Users',
            value: statistics?.total_users ?? 0,
            icon: Users,
            colors: {
                bg: 'from-slate-600 via-slate-700 to-slate-800',
                text: 'text-white-200',
                icon: 'text-white-300',
                accent: 'from-blue-400 to-blue-500',

            }
        },
        {
            title: 'Approved',
            value: statistics?.total_approved_users ?? 0,
            icon: CheckCircle,
            colors: {
                bg: 'from-emerald-600 via-emerald-700 to-emerald-800',
                text: 'text-white-200',
                icon: 'text-white-300',
                accent: 'from-emerald-400 to-emerald-500',

            }
        },
        {
            title: 'Banned',
            value: statistics?.total_banned_users ?? 0,
            icon: Ban,
            colors: {
                bg: 'from-rose-600 via-rose-700 to-rose-800',
                text: 'text-white-200',
                icon: 'text-white-300',
                accent: 'from-rose-400 to-rose-500',

            }
        },
        {
            title: 'Admins',
            value: statistics?.total_admin_users ?? 0,
            icon: Shield,
            colors: {
                bg: 'from-violet-600 via-violet-700 to-violet-800',
                text: 'text-white-200',
                icon: 'text-white-300',
                accent: 'from-violet-400 to-violet-500',

            }
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <Skeleton className="h-8 w-20 mb-4" />
                        <Skeleton className="h-2 w-16" />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}