import React from 'react'

interface SubscriptionDetailsProps {
    currentSubscription: any
}

export default function SubscriptionDetails({ currentSubscription }: SubscriptionDetailsProps) {
    if (!currentSubscription) return null

    return (
        <div className="max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Information */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Plan Information</h4>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Plan Name</span>
                            <span className="text-sm text-gray-900">{currentSubscription?.plan.name}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Price</span>
                            <span className="text-sm text-gray-900">{currentSubscription?.plan.price_formatted}/month</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Currency</span>
                            <span className="text-sm text-gray-900">{currentSubscription?.plan.currency}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentSubscription?.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {currentSubscription?.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subscription Details */}
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Subscription Details</h4>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Subscription Type</span>
                            <span className="text-sm text-gray-900 capitalize">
                                {currentSubscription?.subscription_type?.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Created</span>
                            <span className="text-sm text-gray-900">
                                {currentSubscription?.created_at ? new Date(currentSubscription.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Current Period Start</span>
                            <span className="text-sm text-gray-900">
                                {currentSubscription?.current_period_start ? new Date(currentSubscription.current_period_start).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Current Period End</span>
                            <span className="text-sm text-gray-900">
                                {currentSubscription?.current_period_end ? new Date(currentSubscription.current_period_end).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Next Billing</span>
                            <span className="text-sm text-gray-900">
                                {currentSubscription?.next_billing_date ? new Date(currentSubscription.next_billing_date).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Can Cancel</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentSubscription?.can_cancel
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {currentSubscription?.can_cancel ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trial Information */}
            {currentSubscription?.trial_information?.is_trial && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-yellow-800 mb-3">Trial Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-yellow-700">Trial Status</span>
                            <span className="text-sm text-yellow-800 capitalize">
                                {currentSubscription.trial_information.trial_status}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-yellow-700">Days Remaining</span>
                            <span className="text-sm text-yellow-800 font-semibold">
                                {currentSubscription.trial_information.days_remaining} days
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-yellow-700">Trial End</span>
                            <span className="text-sm text-yellow-800">
                                {new Date(currentSubscription.trial_information.trial_end).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-yellow-700">Trial Active</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentSubscription.trial_information.is_trial_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {currentSubscription.trial_information.is_trial_active ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Information */}
            {currentSubscription?.cancellation_information?.is_scheduled_for_cancellation && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-lg font-semibold text-red-800 mb-3">Cancellation Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-red-700">Scheduled for Cancellation</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentSubscription.cancellation_information.is_scheduled_for_cancellation
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                                }`}>
                                {currentSubscription.cancellation_information.is_scheduled_for_cancellation ? 'Yes' : 'No'}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-red-700">Days Until Cancellation</span>
                            <span className="text-sm text-red-800 font-semibold">
                                {currentSubscription.cancellation_information.days_until_cancellation} days
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-red-700">Cancellation Date</span>
                            <span className="text-sm text-red-800">
                                {new Date(currentSubscription.cancellation_information.cancellation_date).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-red-700">Will Cancel at Period End</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentSubscription.cancellation_information.will_cancel_at_period_end
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                                }`}>
                                {currentSubscription.cancellation_information.will_cancel_at_period_end ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Visibility Information */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">Visibility Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-blue-700">Visible to Drivers</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${currentSubscription?.visibility.is_visible_to_drivers
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {currentSubscription?.visibility.is_visible_to_drivers ? 'Yes' : 'No'}
                        </span>
                    </div>

                    {currentSubscription?.visibility.visible_until && (
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-blue-700">Visible Until</span>
                            <span className="text-sm text-blue-800">
                                {new Date(currentSubscription.visibility.visible_until).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
