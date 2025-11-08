'use client'
import { Check, Star } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useGetSubscriptionPlansQuery, useCheckoutSubscriptionMutation, useGetCurrentSubscriptionQuery, useAppDispatch, useAppSelector, setCheckoutLoading, setSelectedPlan } from '../../../../rtk'
import { PAGINATION_CONFIG } from '../../../../config/pagination.config'
import CustomReusableModal from '../../../../components/reusable/Dashboard/Modal/CustomReusableModal'
import SubscriptionDetails from '../../_components/Garage/Subscription/SubscriptionDetails'
import CancelSubscription from '../../_components/Garage/Subscription/CancelSubscription'
import { toast } from 'react-toastify'


export default function SubscriptionPage() {
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)


    // Fetch subscription plans
    const { data: plansData, isLoading, error } = useGetSubscriptionPlansQuery({
        page: PAGINATION_CONFIG.DEFAULT_PAGE,
        limit: PAGINATION_CONFIG.DEFAULT_LIMIT
    })

    // Fetch current subscription
    const {
        data: currentSubscriptionData,
        isLoading: isLoadingCurrent,
        refetch: refetchCurrentSubscription
    } = useGetCurrentSubscriptionQuery(undefined, {
        refetchOnFocus: true,
        refetchOnReconnect: true,
        refetchOnMountOrArgChange: true
    })
    const [checkoutSubscription] = useCheckoutSubscriptionMutation()


    const dispatch = useAppDispatch()

    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const handleSelectPlan = async (plan: any) => {
        setLoadingPlanId(plan.id)
        dispatch(setSelectedPlan(plan))
        dispatch(setCheckoutLoading(true))
        try {
            const result = await checkoutSubscription({ plan_id: plan.id }).unwrap()
            if (result.success && result.data.checkout_url) {
                window.open(result.data.checkout_url, '_blank')

                // Begin short-lived polling to detect subscription activation after checkout
                const startTime = Date.now()
                if (pollingRef.current) clearInterval(pollingRef.current)
                pollingRef.current = setInterval(async () => {
                    try {
                        const refetchResult = await refetchCurrentSubscription()
                        const updated = (refetchResult as any)?.data?.data
                        if (updated?.status === 'ACTIVE' && updated?.plan?.id === plan.id) {
                            setLoadingPlanId(null)
                            dispatch(setCheckoutLoading(false))
                            dispatch(setSelectedPlan(null))
                            if (pollingRef.current) {
                                clearInterval(pollingRef.current)
                                pollingRef.current = null
                            }
                        }
                    } catch (e) {
                        // swallow
                    } finally {
                        // Stop polling after 2 minutes max
                        if (Date.now() - startTime > 120000 && pollingRef.current) {
                            clearInterval(pollingRef.current)
                            pollingRef.current = null
                            dispatch(setCheckoutLoading(false))
                        }
                    }
                }, 2000)
            }
        } catch (error) {
            const err: any = error
            const status = err?.status
            const apiMessage = err?.data?.message?.message || err?.data?.message || err?.error || 'Checkout failed. Please try again.'
            if (status === 409) {
                toast.error(apiMessage)
            } else {
                toast.error(apiMessage)
            }
            setLoadingPlanId(null)
            dispatch(setCheckoutLoading(false))
        }
    }


    useEffect(() => {
        const onFocus = () => {
            refetchCurrentSubscription().then((res: any) => {
                const updated = res?.data?.data
                if (updated?.status === 'ACTIVE') {
                    setLoadingPlanId(null)
                    dispatch(setCheckoutLoading(false))
                    dispatch(setSelectedPlan(null))
                }
            })
        }
        window.addEventListener('focus', onFocus)
        return () => {
            window.removeEventListener('focus', onFocus)
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [refetchCurrentSubscription, dispatch])


    if (isLoading || isLoadingCurrent) {
        return (
            <div className="flex-1 lg:flex-1 flex items-center justify-center  h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading subscription data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex-1 lg:flex-1 flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-red-600">Error loading subscription plans. Please try again.</p>
                </div>
            </div>
        )
    }

    const plans = plansData?.data?.plans || []
    const currentSubscription = currentSubscriptionData?.data


    // If no plans available, show empty state
    if (plans.length === 0) {
        return (
            <div className="flex-1 lg:flex-1 flex items-center justify-center  h-full">
                <div className="text-center max-w-md mx-auto">
                    <div className="mb-8">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h1 className="xs:text-2xl text-3xl font-bold text-gray-900 mb-4">No Subscription Plans Available</h1>
                        <p className="text-gray-600 text-lg mb-6">
                            We're currently working on setting up subscription plans for your garage business.
                        </p>
                        <p className="text-gray-500 text-sm">
                            Please check back later or contact our support team for more information.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 lg:flex-1 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
                    <p className="text-gray-600 text-lg">
                        Select the perfect plan for your garage business
                    </p>
                </div>

                <div className="grid gap-6 justify-center grid-cols-[repeat(auto-fit,minmax(320px,max-content))]">
                    {plans.map((plan) => {
                        // Check if this plan is the current subscription (regardless of status)
                        const isCurrentPlan = currentSubscription &&
                            currentSubscription.plan?.id === plan.id

                        // Check if the current subscription is active
                        const isActiveSubscription = currentSubscription &&
                            currentSubscription.status === 'ACTIVE'

                        // Check if the subscription is cancelled but still in period (including trial)
                        const isCancelledButActive = currentSubscription &&
                            currentSubscription.status === 'CANCELLED' &&
                            (new Date(currentSubscription.current_period_end) > new Date() ||
                                (currentSubscription.trial_information?.days_remaining && currentSubscription.trial_information.days_remaining > 0))

                        const isPopular = plan.name === 'Gold Plan'

                        return (
                            <div
                                key={plan.id}
                                className={`relative w-fit min-w-[320px] max-w-[420px] border rounded-2xl p-8 bg-white transition-all duration-200 hover:shadow-lg ${isCurrentPlan && isActiveSubscription
                                    ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
                                    : isCurrentPlan && isCancelledButActive
                                        ? 'border-orange-500 ring-2 ring-orange-100 bg-orange-50'
                                        : isCurrentPlan && !isActiveSubscription && !isCancelledButActive
                                            ? 'border-red-500 ring-2 ring-red-100 bg-red-50'
                                            : isPopular
                                                ? 'border-[#19CA32] ring-2 ring-green-100'
                                                : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {isCurrentPlan && isActiveSubscription && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                                            <Check className="w-4 h-4" />
                                            Current Plan
                                        </span>
                                    </div>
                                )}

                                {isCurrentPlan && isCancelledButActive && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {currentSubscription.trial_information?.days_remaining > 0
                                                ? `Cancelled (${currentSubscription.trial_information.days_remaining} days trial left)`
                                                : `Cancelled (Active Until ${new Date(currentSubscription.current_period_end).toLocaleDateString()})`
                                            }
                                        </span>
                                    </div>
                                )}

                                {isCurrentPlan && !isActiveSubscription && !isCancelledButActive && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancelled
                                        </span>
                                    </div>
                                )}

                                {!isCurrentPlan && isPopular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-[#19CA32] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                            <Star className="w-4 h-4" />
                                            Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="sm:text-2xl text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                                    <div className="mb-4">
                                        <span className="sm:text-4xl text-2xl font-bold text-gray-900">{plan.price_formatted}</span>
                                        <span className="text-gray-600 ml-1">/month</span>
                                    </div>

                                    {isCurrentPlan && isActiveSubscription ? (
                                        <div className="space-y-2">
                                            <p className="text-green-600 text-sm font-medium">
                                                ✓ Currently Active
                                            </p>
                                        </div>
                                    ) : isCurrentPlan && isCancelledButActive ? (
                                        <div className="space-y-2">
                                            <p className="text-orange-600 text-sm font-medium">
                                                ⚠ Cancelled - {currentSubscription.trial_information?.days_remaining > 0
                                                    ? `Trial active for ${currentSubscription.trial_information.days_remaining} more days`
                                                    : `Active until ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`
                                                }
                                            </p>
                                        </div>
                                    ) : isCurrentPlan && !isActiveSubscription && !isCancelledButActive ? (
                                        <div className="space-y-2">
                                            <p className="text-red-600 text-sm font-medium">
                                                ✗ Cancelled
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-xs">
                                            Billed automatically every month (unless cancelled)
                                        </p>
                                    )}
                                </div>

                                {/* choose plan button */}
                                {isCurrentPlan ? (
                                    <div className="space-y-3 mb-6 ">
                                        {/* Cancel Subscription Component - Only show for active subscriptions */}
                                        {isActiveSubscription && (
                                            <CancelSubscription currentSubscription={currentSubscription} />
                                        )}

                                        {/* Resubscribe Button for cancelled subscriptions */}
                                        {!isActiveSubscription && (
                                            <button
                                                onClick={() => handleSelectPlan(plan)}
                                                disabled={loadingPlanId === plan.id}
                                                className="w-full cursor-pointer py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 text-sm disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-700 text-white"
                                            >
                                                {loadingPlanId === plan.id ? 'Processing...' : 'Resubscribe'}
                                            </button>
                                        )}

                                        {/* Subscription Details - Same Line */}
                                        <div className="flex items-center justify-center gap-2 flex-wrap">
                                            {/* Subscription Type Badge */}
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActiveSubscription
                                                ? 'bg-blue-100 text-blue-800'
                                                : isCancelledButActive
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {currentSubscription.subscription_type?.replace(/_/g, ' ')}
                                            </span>

                                            {/* Days Remaining Badge */}
                                            {currentSubscription.trial_information?.days_remaining && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    {currentSubscription.trial_information.days_remaining} days left
                                                </span>
                                            )}

                                            {/* View Details Button */}
                                            <button
                                                onClick={() => setShowDetailsModal(true)}
                                                className="text-blue-600 cursor-pointer hover:bg-blue-100 hover:text-blue-700 text-sm font-medium py-1 px-2 rounded transition-colors duration-200"
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    //  choose plan button
                                    <button
                                        onClick={() => handleSelectPlan(plan)}
                                        disabled={loadingPlanId === plan.id}
                                        className={`w-full cursor-pointer py-3 px-6 rounded-lg font-semibold transition-colors duration-200 mb-6 disabled:opacity-50 text-sm disabled:cursor-not-allowed ${plan.name === 'Gold Plan'
                                            ? 'bg-[#19CA32] hover:bg-green-600 text-white'
                                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                                            }`}
                                    >
                                        {loadingPlanId === plan.id ? 'Processing...' : `Choose ${plan.name}`}
                                    </button>
                                )}

                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Features</h4>
                                    <div className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                </div>
                                                <p className="text-sm text-gray-700">{feature}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>


            {/* Subscription Details Modal */}
            <CustomReusableModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Subscription Details"
                className="max-w-xl"
                customHeader={
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Subscription Details</h3>
                                <p className="text-sm text-gray-500">{currentSubscription?.plan.name}</p>
                            </div>
                        </div>
                    </div>
                }
            >
                <SubscriptionDetails currentSubscription={currentSubscription} />
            </CustomReusableModal>
        </div>
    )
}
