'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-toastify'
import {
    setMot,
    setRetest,
    setPricingFromResponse,
    useAppDispatch,
    useAppSelector,
    useCreatePricingMutation
} from '@/rtk'
import { store } from '@/rtk/store'
import { syncAdditionalServicesForm } from './AdditionalServicesAdd'

// Shared loading state for Save button
let isLoadingState = false
export const getPricingLoadingState = () => isLoadingState

interface MotFeeFormData {
    motFee: string
    motRetestFee: string
}

export default function MotFeeAdd() {
    const dispatch = useAppDispatch()
    const { mot, retest, additionals, formVersion } = useAppSelector(state => state.pricing)
    const [createPricing, { isLoading }] = useCreatePricingMutation()
    const prevFormVersionRef = React.useRef(formVersion)
    const hasInitializedRef = React.useRef(false)

    // Update shared loading state
    React.useEffect(() => {
        isLoadingState = isLoading
    }, [isLoading])

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<MotFeeFormData>({
        defaultValues: {
            motFee: mot.price ?? '',
            motRetestFee: retest.price ?? ''
        }
    })

    const motFeeValue = watch('motFee')
    const retestFeeValue = watch('motRetestFee')

    // Initialize form when data changes
    useEffect(() => {
        if (prevFormVersionRef.current !== formVersion || !hasInitializedRef.current) {
            prevFormVersionRef.current = formVersion
            hasInitializedRef.current = true
            reset({
                motFee: mot.price ?? '',
                motRetestFee: retest.price ?? ''
            })
        }
    }, [formVersion, reset, mot.price, retest.price])

    // Sync form values to Redux
    useEffect(() => {
        if (motFeeValue !== (mot.price ?? '')) {
            dispatch(setMot({ price: motFeeValue ?? '' }))
        }
    }, [motFeeValue, dispatch, mot.price])

    useEffect(() => {
        if (retestFeeValue !== (retest.price ?? '')) {
            dispatch(setRetest({ price: retestFeeValue ?? '' }))
        }
    }, [retestFeeValue, dispatch, retest.price])

    const parsePrice = (value: string) => {
        const parsed = parseFloat(value)
        return Number.isNaN(parsed) ? 0 : parsed
    }

    const onSubmit = async (data: MotFeeFormData) => {
        // Sync and get latest additional services from form
        const syncedServices = syncAdditionalServicesForm()
        let currentAdditionals = syncedServices

        // Fallback to Redux if no synced services
        if (currentAdditionals.length === 0) {
            const reduxState = store.getState().pricing.additionals || additionals
            currentAdditionals = reduxState.map(service => ({
                id: service.id ?? null,
                name: service.name
            }))
        }

        // Build payload
        const payload = {
            mot: { name: mot.name || 'MOT Test', price: parsePrice(data.motFee) },
            retest: { name: retest.name || 'MOT Retest', price: parsePrice(data.motRetestFee) },
            additionals: currentAdditionals
                .filter(service => service.name?.trim())
                .map(service => ({ name: service.name.trim() }))
        }

        try {
            const response = await createPricing(payload).unwrap()
            dispatch(setPricingFromResponse(response.data))
            toast.success(response.message || 'Service prices updated successfully')
        } catch (error: any) {
            toast.error(error?.data?.message || 'Error updating service prices. Please try again.')
        }
    }

    return (
        <div className="mb-6">
            <Card className="border border-[#19CA32]">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    MOT Fee
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                        £
                                    </span>
                                    <Input
                                        {...register('motFee', {
                                            required: 'MOT Fee is required',
                                            pattern: {
                                                value: /^\d+(\.\d{1,2})?$/,
                                                message: 'Please enter a valid amount'
                                            }
                                        })}
                                        type="number"
                                        step="0.01"
                                        placeholder=""
                                        className="h-11 pl-8 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                {errors.motFee && (
                                    <p className="text-sm text-red-500">{errors.motFee.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    MOT Retest Fee
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                        £
                                    </span>
                                    <Input
                                        {...register('motRetestFee', {
                                            required: 'MOT Retest Fee is required',
                                            pattern: {
                                                value: /^\d+(\.\d{1,2})?$/,
                                                message: 'Please enter a valid amount'
                                            }
                                        })}
                                        type="number"
                                        step="0.01"
                                        placeholder=""
                                        className="h-11 pl-8 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                                {errors.motRetestFee && (
                                    <p className="text-sm text-red-500">{errors.motRetestFee.message}</p>
                                )}
                            </div>
                        </div>

                        <Button
                            id="pricing-main-save"
                            type="submit"
                            disabled={isLoading}
                            className="hidden"
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
