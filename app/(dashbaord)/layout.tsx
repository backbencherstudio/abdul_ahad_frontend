"use client"

import DashboardLayout from '@/components/reusable/Dashboard/MainLayout/DashboardLayout'
import { RouteProtection } from '@/lib/routeProtection'

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RouteProtection>
            <DashboardLayout>{children}</DashboardLayout>
        </RouteProtection>
    )
}
