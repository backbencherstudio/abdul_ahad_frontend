
import DashboardLayout from '@/components/reusable/Dashboard/MainLayout/DashboardLayout';

export default function DriverDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
