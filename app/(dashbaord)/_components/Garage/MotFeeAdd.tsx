'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'

interface MotFeeFormData {
    motFee: string
    motRetestFee: string
}

export default function MotFeeAdd() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MotFeeFormData>({
        defaultValues: {
            motFee: '',
            motRetestFee: '',
        }
    })

    const onSubmit = async (data: MotFeeFormData) => {
        setIsSubmitting(true)

        try {
            // TODO: Replace with your API call
            console.log('MOT Fee Data:', data)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Reset form on success
            reset()
            toast.success('MOT fees updated successfully!')

        } catch (error) {
            console.error('Error submitting MOT fees:', error)
            toast.error('Error updating MOT fees. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mb-6">
            <Card className="border border-[#19CA32]">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* MOT Fee and MOT Retest Fee - Side by Side */}
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

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-10 bg-[#19CA32] cursor-pointer hover:bg-[#16b82e] text-white font-medium text-base"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
