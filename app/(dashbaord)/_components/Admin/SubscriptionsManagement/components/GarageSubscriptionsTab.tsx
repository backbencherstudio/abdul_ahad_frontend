'use client';

import React, { useState } from 'react';
import { Loader2, Search, Filter, TrendingUp, Users, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import {
  useGetGarageSubscriptionsQuery,
  useGetGarageSubscriptionDetailsQuery,
  useUpdateGarageSubscriptionMutation,
  useGetSubscriptionAnalyticsQuery,
  useGetSubscriptionHealthSummaryQuery,
  useGetStatusBreakdownQuery,
  useGetRevenueTrendQuery,
  GarageSubscriptionsQueryParams,
} from '@/rtk/api/admin/subscriptions-management/subscriptionManagementAPI';
import { LineChart } from '@/components/Chart/LineChart';
import { PieChart } from '@/components/Chart/PieChart';
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable';
import ReusablePagination from '@/components/reusable/Dashboard/Table/ReusablePagination';
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal';

interface Props {
  planId: string;
}

export default function GarageSubscriptionsTab({ planId }: Props) {
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<GarageSubscriptionsQueryParams>({
    plan_id: planId,
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const garageSubscriptions = useGetGarageSubscriptionsQuery(filters);
  const subscriptionDetails = useGetGarageSubscriptionDetailsQuery(selectedSubscriptionId || '', {
    skip: !selectedSubscriptionId,
  });
  const analytics = useGetSubscriptionAnalyticsQuery();
  const healthSummary = useGetSubscriptionHealthSummaryQuery();
  const statusBreakdown = useGetStatusBreakdownQuery();
  const revenueTrend = useGetRevenueTrendQuery();

  const [updateSubscription, { isLoading: isUpdating }] = useUpdateGarageSubscriptionMutation();

  const handleStatusChange = async (subscriptionId: string, action: "ACTIVATE" | "SUSPEND" | "CANCEL" | "REACTIVATE") => {
    try {
      await updateSubscription({ id: subscriptionId, body: { action } }).unwrap();
      toast.success(`Subscription ${action.toLowerCase()}d successfully!`);
      garageSubscriptions.refetch();
      if (selectedSubscriptionId === subscriptionId) {
        subscriptionDetails.refetch();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${action.toLowerCase()} subscription.`);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm || undefined, page: 1 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PAST_DUE':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const subscriptions = garageSubscriptions.data?.data || [];
  const totalPages = garageSubscriptions.data?.totalPages || 1;
  const totalItems = garageSubscriptions.data?.total || subscriptions.length || 0;
  const currentPage = filters.page || 1;
  const itemsPerPage = filters.limit || 10;

  const columns = [
    {
      key: 'garage_name',
      label: 'Garage',
      width: '20%',
      render: (_: any, row: any) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{row.garage_name}</p>
          <p className="text-xs text-gray-500">{row.garage_email}</p>
        </div>
      ),
    },
    {
      key: 'plan_name',
      label: 'Plan',
      width: '15%',
      render: (value: string) => <span className="text-sm text-gray-900">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'price_formatted',
      label: 'Price',
      width: '15%',
      render: (value: string) => <span className="text-sm text-gray-900">{value}</span>,
    },
    {
      key: 'next_billing_date',
      label: 'Next Billing',
      width: '20%',
      render: (value: string | null) => <span className="text-sm text-gray-500">{formatDate(value)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '15%',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {row.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(row.id, 'SUSPEND');
              }}
              disabled={isUpdating}
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
            >
              Suspend
            </Button>
          )}
          {row.status === 'SUSPENDED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(row.id, 'REACTIVATE');
              }}
              disabled={isUpdating}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              Reactivate
            </Button>
          )}
          {row.status !== 'CANCELLED' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(row.id, 'CANCEL');
              }}
              disabled={isUpdating}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Health Summary Alert */}
      {healthSummary.data && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Subscription Health Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <span className="text-xs text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-900">{healthSummary.data.total_subscriptions}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <span className="text-xs text-green-600">Active</span>
              <p className="text-xl font-bold text-green-900">{healthSummary.data.active_subscriptions}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <span className="text-xs text-orange-600">Past Due</span>
              <p className="text-xl font-bold text-orange-900">{healthSummary.data.past_due_subscriptions}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <span className="text-xs text-yellow-600">Suspended</span>
              <p className="text-xl font-bold text-yellow-900">{healthSummary.data.suspended_subscriptions}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="text-xs text-blue-600">Expiring Soon</span>
              <p className="text-xl font-bold text-blue-900">{healthSummary.data.expiring_soon}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <span className="text-xs text-red-600">Expired Recently</span>
              <p className="text-xl font-bold text-red-900">{healthSummary.data.expired_recently}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status Breakdown
          </h3>
          {statusBreakdown.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : statusBreakdown.data ? (
            <div className="flex justify-center">
              <PieChart
                labels={Object.keys(statusBreakdown.data)}
                data={Object.values(statusBreakdown.data)}
                colors={[
                  'rgba(34, 197, 94, 0.8)', // green - active
                  'rgba(107, 114, 128, 0.8)', // gray - inactive
                  'rgba(234, 179, 8, 0.8)', // yellow - suspended
                  'rgba(239, 68, 68, 0.8)', // red - cancelled
                  'rgba(249, 115, 22, 0.8)', // orange - past_due
                ]}
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Revenue Trend Line Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trend
          </h3>
          {revenueTrend.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : revenueTrend.data && revenueTrend.data.length > 0 ? (
            <LineChart
              label="Revenue (£)"
              labels={revenueTrend.data.map(item => item.month)}
              data={revenueTrend.data.map(item => item.revenue)}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-500">Active Subscriptions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.data.total_active_subscriptions}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-500">Monthly Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.data.total_monthly_revenue_formatted}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <span className="text-xs text-gray-500">Status Distribution</span>
            <div className="mt-2 space-y-1">
              {analytics.data.status_distribution.map((item) => (
                <div key={item.status} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.status}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <span className="text-xs text-gray-500">Plan Distribution</span>
            <div className="mt-2 space-y-1">
              {analytics.data.plan_distribution.map((item) => (
                <div key={item.plan_name} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.plan_name}</span>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search by garage name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Garage Subscriptions</h3>
        </div>
        <ReusableTable
          data={subscriptions}
          columns={columns}
          isLoading={garageSubscriptions.isLoading}
          skeletonRows={itemsPerPage}
          onRowClick={(row) => setSelectedSubscriptionId(row.id)}
          className="mt-0"
        />
        {!garageSubscriptions.isLoading && totalPages > 1 && (
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={(page) => setFilters({ ...filters, page })}
            onItemsPerPageChange={(limit) => setFilters({ ...filters, limit, page: 1 })}
            className="border-t"
          />
        )}
      </div>

      {/* Subscription Details Modal */}
      <CustomReusableModal
        isOpen={Boolean(selectedSubscriptionId)}
        onClose={() => setSelectedSubscriptionId(null)}
        title="Subscription Details"
        description="Garage subscription details"
        className="max-w-2xl"
      >
        {subscriptionDetails.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : subscriptionDetails.data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Garage Name</span>
                <p className="text-sm font-medium">{subscriptionDetails.data.garage_name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Email</span>
                <p className="text-sm font-medium">{subscriptionDetails.data.garage_email}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Plan</span>
                <p className="text-sm font-medium">{subscriptionDetails.data.plan_name}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscriptionDetails.data.status)}`}>
                  {subscriptionDetails.data.status}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Price</span>
                <p className="text-sm font-medium">{subscriptionDetails.data.price_formatted}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Next Billing Date</span>
                <p className="text-sm font-medium">{formatDate(subscriptionDetails.data.next_billing_date)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Period Start</span>
                <p className="text-sm font-medium">{formatDate(subscriptionDetails.data.current_period_start)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Period End</span>
                <p className="text-sm font-medium">{formatDate(subscriptionDetails.data.current_period_end)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No details available.</p>
        )}
      </CustomReusableModal>
    </div>
  );
}

