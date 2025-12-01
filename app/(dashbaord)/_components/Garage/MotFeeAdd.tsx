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

interface MotFeeFormData {
    motFee: string
    motRetestFee: string
}

export default function MotFeeAdd() {
    const dispatch = useAppDispatch()
    const { mot, retest, additionals, formVersion } = useAppSelector(state => state.pricing)
    const [createPricing, { isLoading }] = useCreatePricingMutation()

    const {
        register,
        handleSubmit,
        setValue,
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

    useEffect(() => {
        setValue('motFee', mot.price ?? '')
        setValue('motRetestFee', retest.price ?? '')
    }, [formVersion, mot.price, retest.price, setValue])

    useEffect(() => {
        dispatch(setMot({ price: motFeeValue ?? '' }))
    }, [motFeeValue, dispatch])

    useEffect(() => {
        dispatch(setRetest({ price: retestFeeValue ?? '' }))
    }, [retestFeeValue, dispatch])

    const parsePrice = (value: string) => {
        const parsed = parseFloat(value)
        return Number.isNaN(parsed) ? 0 : parsed
    }

    const onSubmit = async (data: MotFeeFormData) => {
        if (!additionals.length) {
            toast.error('Please add at least one additional service before saving.')
            return
        }

        const payload = {
            mot: { name: mot.name || 'MOT Test', price: parsePrice(data.motFee) },
            retest: { name: retest.name || 'MOT Retest', price: parsePrice(data.motRetestFee) },
            additionals: additionals.map(service => ({
                name: service.name
            }))
        }

        try {
            const response = await createPricing(payload).unwrap()
            dispatch(setPricingFromResponse(response.data))
            toast.success(response.message || 'Service prices updated successfully')
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Error updating service prices. Please try again.'
            toast.error(errorMessage)
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
