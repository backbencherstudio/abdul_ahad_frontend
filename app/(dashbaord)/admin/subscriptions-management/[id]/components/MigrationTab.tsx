'use client';

import React, { useState } from 'react';
import { RefreshCw, Database, Mail, ArrowRight, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import {
  useGetMigrationStatusQuery,
  useGetMigrationSummaryQuery,
  useGetMigrationStatisticsQuery,
  useSyncPlanToStripeMutation,
  useCreateMigrationPriceMutation,
  useSendMigrationNoticesMutation,
  useBulkMigrateMutation,
} from '@/rtk/api/admin/subscriptions-management/subscriptionManagementAPI';
import CreateMigrationPriceDialog from './CreateMigrationPriceDialog';

interface Props {
  subscriptionId: string;
}

export default function MigrationTab({ subscriptionId }: Props) {
  const [openPriceDialog, setOpenPriceDialog] = useState(false);

  const migrationStatus = useGetMigrationStatusQuery(subscriptionId);
  const migrationSummary = useGetMigrationSummaryQuery(subscriptionId);
  const migrationStatistics = useGetMigrationStatisticsQuery(subscriptionId);

  const [syncPlanToStripe, { isLoading: isSyncing }] = useSyncPlanToStripeMutation();
  const [createMigrationPrice, { isLoading: isCreatingPrice }] = useCreateMigrationPriceMutation();
  const [sendMigrationNotices, { isLoading: isSendingNotices }] = useSendMigrationNoticesMutation();
  const [bulkMigrate, { isLoading: isBulkMigrating }] = useBulkMigrateMutation();

  const handleSyncToStripe = async () => {
    try {
      await syncPlanToStripe(subscriptionId).unwrap();
      toast.success('Plan synced to Stripe successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to sync plan to Stripe.');
    }
  };

  const handleCreateMigrationPrice = async (price: number) => {
    try {
      await createMigrationPrice({
        id: subscriptionId,
        body: { new_price_pence: price },
      }).unwrap();
      toast.success('Migration price created successfully!');
      setOpenPriceDialog(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create migration price.');
    }
  };

  const handleSendNotices = async () => {
    try {
      await sendMigrationNotices({ id: subscriptionId, body: { notice_period_days: 30 } }).unwrap();
      toast.success('Migration notices sent successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to send migration notices.');
    }
  };

  const handleBulkMigrate = async () => {
    try {
      await bulkMigrate({ id: subscriptionId, body: { batch_size: 50 } }).unwrap();
      toast.success('Bulk migration started successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to start bulk migration.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex gap-3 min-w-max">
          <Button
            onClick={handleSyncToStripe}
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
            disabled={isSyncing}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isSyncing ? 'Syncing...' : 'Sync to Stripe'}
          </Button>
          <Button
            onClick={() => setOpenPriceDialog(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white whitespace-nowrap"
            disabled={isCreatingPrice}
          >
            <Database className="mr-2 h-4 w-4" />
            Create New Price
          </Button>
          <Button
            onClick={handleSendNotices}
            className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
            disabled={isSendingNotices}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Notices
          </Button>
          <Button
            onClick={handleBulkMigrate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap"
            disabled={isBulkMigrating}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Bulk Migrate
          </Button>
        </div>
      </div>

      {/* Migration Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Migration Status
        </h3>
        {migrationStatus.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : migrationStatus.data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-gray-500">Total</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {migrationStatus.data.totals?.total || 0}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <span className="text-xs text-blue-600">Grandfathered</span>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {migrationStatus.data.totals?.grandfathered || 0}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <span className="text-xs text-yellow-600">Notice Sent</span>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {migrationStatus.data.totals?.notice_sent || 0}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <span className="text-xs text-orange-600">Ready to Migrate</span>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {migrationStatus.data.totals?.ready_to_migrate || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <span className="text-xs text-green-600">Migrated</span>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {migrationStatus.data.totals?.migrated || 0}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No migration status available</p>
        )}
      </div>

      {/* Migration Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Migration Summary</h3>
        {migrationSummary.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : migrationSummary.data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-gray-500">Total Subscriptions</span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {migrationSummary.data.subs_total || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-gray-500">Grandfathered</span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {migrationSummary.data.grandfathered || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-gray-500">Ready to Migrate</span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {migrationSummary.data.ready_to_migrate || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-gray-500">Migrated</span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {migrationSummary.data.migrated || 0}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No summary available</p>
        )}
      </div>

      {/* Migration Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Migration Statistics</h3>
        {migrationStatistics.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : migrationStatistics.data?.statistics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-xs text-gray-500">Total Jobs</span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {migrationStatistics.data.statistics.total_jobs || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <span className="text-xs text-green-600">Completed</span>
              <p className="text-xl font-bold text-green-900 mt-1">
                {migrationStatistics.data.statistics.completed_jobs || 0}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <span className="text-xs text-red-600">Failed</span>
              <p className="text-xl font-bold text-red-900 mt-1">
                {migrationStatistics.data.statistics.failed_jobs || 0}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <span className="text-xs text-yellow-600">Running</span>
              <p className="text-xl font-bold text-yellow-900 mt-1">
                {migrationStatistics.data.statistics.running_jobs || 0}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <span className="text-xs text-blue-600">Success Rate</span>
              <p className="text-xl font-bold text-blue-900 mt-1">
                {migrationStatistics.data.statistics.success_rate || 0}%
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No statistics available</p>
        )}
      </div>

      <CreateMigrationPriceDialog
        open={openPriceDialog}
        onOpenChange={setOpenPriceDialog}
        onSubmit={handleCreateMigrationPrice}
        isLoading={isCreatingPrice}
      />
    </div>
  );
}

