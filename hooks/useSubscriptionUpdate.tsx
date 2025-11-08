import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/rtk'
import { updateSubscriptionStatus } from '@/rtk/slices/subscriptionSlice'
import { useGetCurrentSubscriptionQuery } from '@/rtk'

export const useSubscriptionUpdate = () => {
    const dispatch = useAppDispatch()
    const subscriptionState = useAppSelector((state) => state.subscription)
    const { refetch: refetchCurrentSubscription } = useGetCurrentSubscriptionQuery()

    const triggerUpdate = useCallback(() => {
        // Update Redux state immediately
        dispatch(updateSubscriptionStatus())

        // Force refetch to ensure UI updates
        setTimeout(() => {
            refetchCurrentSubscription()
        }, 100)
    }, [dispatch, refetchCurrentSubscription])

    return {
        triggerUpdate,
        lastUpdated: subscriptionState.lastUpdated
    }
}
