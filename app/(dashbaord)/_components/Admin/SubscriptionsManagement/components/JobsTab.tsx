'use client';

import React, { useState } from 'react';
import { Loader2, Play, X, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import {
  useGetMigrationJobsQuery,
  useGetMigrationJobDetailsQuery,
  useCancelMigrationJobMutation,
  useRetryMigrationJobMutation,
  JobType,
} from '@/rtk/api/admin/subscriptions-management/subscriptionManagementAPI';

interface Props {
  subscriptionId: string;
  selectedJobType?: JobType;
  onJobTypeChange: (type: JobType | undefined) => void;
}

export default function JobsTab({ subscriptionId, selectedJobType, onJobTypeChange }: Props) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const migrationJobs = useGetMigrationJobsQuery(
    { id: subscriptionId, job_type: selectedJobType },
    { refetchOnMountOrArgChange: true }
  );

  const jobDetails = useGetMigrationJobDetailsQuery(
    { id: subscriptionId, jobId: selectedJobId || '' },
    { skip: !selectedJobId }
  );

  const [cancelJob, { isLoading: isCancelling }] = useCancelMigrationJobMutation();
  const [retryJob, { isLoading: isRetrying }] = useRetryMigrationJobMutation();

  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJob({ id: subscriptionId, jobId }).unwrap();
      toast.success('Job cancelled successfully!');
      migrationJobs.refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to cancel job.');
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await retryJob({ id: subscriptionId, jobId }).unwrap();
      toast.success('Job retry initiated successfully!');
      migrationJobs.refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to retry job.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Normalize jobs array from API (supports both data.jobs and data.data shapes)
  const jobs =
    migrationJobs.data?.jobs ||
    migrationJobs.data?.data ||
    [];

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={selectedJobType === undefined ? 'default' : 'outline'}
          onClick={() => onJobTypeChange(undefined)}
          size="sm"
          className="cursor-pointer"
        >
          All Jobs
        </Button>
        <Button
          variant={selectedJobType === 'NOTICE' ? 'default' : 'outline'}
          onClick={() => onJobTypeChange('NOTICE')}
          size="sm"
          className="cursor-pointer"
        >
          Notices
        </Button>
        <Button
          variant={selectedJobType === 'MIGRATION' ? 'default' : 'outline'}
          onClick={() => onJobTypeChange('MIGRATION')}
          size="sm"
          className="cursor-pointer"
        >
          Migrations
        </Button>
      </div>

      {/* Jobs List */}
      {migrationJobs.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No jobs found
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedJobId(job.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {job.job_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-1">Job ID: {job.id}</p>
                  {job.progress_percentage !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{job.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${job.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelJob(job.id)}
                      disabled={isCancelling}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                  {job.status === 'FAILED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetryJob(job.id)}
                      disabled={isRetrying}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created
                  </span>
                  <p className="text-sm font-medium mt-1">{formatDate(job.created_at)}</p>
                </div>
                {job.started_at && (
                  <div>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Started
                    </span>
                    <p className="text-sm font-medium mt-1">{formatDate(job.started_at)}</p>
                  </div>
                )}
                {job.completed_at && (
                  <div>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </span>
                    <p className="text-sm font-medium mt-1">{formatDate(job.completed_at)}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500">Success/Failed</span>
                  <p className="text-sm font-medium mt-1">
                    <span className="text-green-600">{job.success_count || 0}</span>
                    {' / '}
                    <span className="text-red-600">{job.failed_count || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJobId && jobDetails.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Job Details</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedJobId(null)}
              >
                ×
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Job Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Job ID</span>
                  <p className="text-sm font-mono">{jobDetails.data.job?.id}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Job Type</span>
                  <p className="text-sm font-medium">{jobDetails.data.job?.job_type}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(jobDetails.data.job?.status || '')}`}>
                    {jobDetails.data.job?.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Plan</span>
                  <p className="text-sm font-medium">{jobDetails.data.job?.plan_name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Total Count</span>
                  <p className="text-sm font-medium">{jobDetails.data.job?.total_count || 0}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Success / Failed</span>
                  <p className="text-sm font-medium">
                    <span className="text-green-600">{jobDetails.data.job?.success_count || 0}</span>
                    {' / '}
                    <span className="text-red-600">{jobDetails.data.job?.failed_count || 0}</span>
                  </p>
                </div>
              </div>

              {/* Attempts */}
              {jobDetails.data.attempts && jobDetails.data.attempts.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Attempts</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Subscription ID</th>
                          <th className="px-3 py-2 text-left">Garage ID</th>
                          <th className="px-3 py-2 text-left">Status</th>
                          <th className="px-3 py-2 text-left">Error</th>
                          <th className="px-3 py-2 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {jobDetails.data.attempts.map((attempt: any) => (
                          <tr key={attempt.id}>
                            <td className="px-3 py-2 font-mono text-xs">{attempt.subscription_id}</td>
                            <td className="px-3 py-2 font-mono text-xs">{attempt.garage_id}</td>
                            <td className="px-3 py-2">
                              {attempt.success ? (
                                <span className="text-green-600">✓ Success</span>
                              ) : (
                                <span className="text-red-600">✗ Failed</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-red-600">
                              {attempt.error_message || '-'}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-500">
                              {formatDate(attempt.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

