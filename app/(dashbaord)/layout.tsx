import DashboardLayout from '@/components/reusable/Dashboard/MainLayout/DashboardLayout'
import { RouteProtection } from '@/lib/routeProtection'
import { SubscriptionProtection } from '@/lib/subscriptionProtection'

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RouteProtection>
            <SubscriptionProtection>
                <DashboardLayout>{children}</DashboardLayout>
            </SubscriptionProtection>
        </RouteProtection>
    )
}
