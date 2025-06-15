'use client'

import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

interface ServiceField {
    serviceName: string
}

interface AdditionalServicesFormData {
    services: ServiceField[]
}

export default function AdditionalServicesAdd() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasServices, setHasServices] = useState(false)
    const [saveError, setSaveError] = useState<string>('')

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm<AdditionalServicesFormData>({
        defaultValues: {
            services: []
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'services'
    })

    const addFirstService = () => {
        append({ serviceName: '' })
        setHasServices(true)
        setSaveError('')
    }

    const addNewService = () => {
        append({ serviceName: '' })
        setSaveError('')
    }

    const removeService = (index: number) => {
        remove(index)
        if (fields.length <= 1) {
            setHasServices(false)
        }
        setSaveError('')
    }

    const onSubmit = async (data: AdditionalServicesFormData) => {
        if (!hasServices || fields.length === 0) {
            setSaveError('Please add at least one service before saving.')
            toast.error('Please add at least one service before saving.')
            return
        }

        const validServices = data.services.filter(service => service.serviceName.trim() !== '')

        if (validServices.length === 0) {
            setSaveError('Please fill in at least one service name.')
            toast.error('Please fill in at least one service name.')
            return
        }

        setSaveError('')
        setIsSubmitting(true)

        try {
            console.log('Additional Services Data:', validServices)

            await new Promise(resolve => setTimeout(resolve, 1500))

            reset({ services: [] })
            setHasServices(false)
            toast.success(`${validServices.length} additional service(s) saved successfully!`)

        } catch (error) {
            console.error('Error submitting additional services:', error)
            toast.error('Error updating additional services. Please try again.')
            setSaveError('Error saving services. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mb-6">
            <Card className="border border-[#19CA32]">
                <CardContent className="p-6">
                    <div className="mb-4 space-y-2">
                        <Label className="text-lg font-medium text-gray-900">
                            Additional Services
                        </Label>
                        <p className="text-sm text-gray-600">
                            Got extra services your garage offers? Add them here and we'll feature them on your profile.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {!hasServices && fields.length === 0 && (
                            <div className="flex flex-col py-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addFirstService}
                                    className="max-w-80 w-full cursor-pointer border border-[#19CA32] hover:border-[#19CA32] hover:bg-green-50 py-5"
                                >
                                    <Plus className="h-6 w-6 text-gray-500 hover:text-[#19CA32]" />
                                </Button>
                                {saveError && !hasServices && (
                                    <div className="mt-3 flex items-center gap-2 text-red-500">
                                        <AlertCircle className="h-4 w-4" />
                                        <p className="text-sm">{saveError}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {hasServices && fields.length > 0 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="space-y-2">
                                            <div className="relative">
                                                <Input
                                                    {...register(`services.${index}.serviceName` as const, {
                                                        required: 'Service name is required'
                                                    })}
                                                    placeholder="Tire change"
                                                    className="h-11 border border-[#19CA32] focus:border-green-500 focus:ring-green-500 pr-10"
                                                />

                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => removeService(index)}
                                                        className="h-8 w-8 p-0 hover:bg-red-50"
                                                    >
                                                        <X className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {errors.services?.[index]?.serviceName && (
                                                <p className="text-sm text-red-500">
                                                    {errors.services[index]?.serviceName?.message}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-start">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addNewService}
                                        className="border-[#19CA32] text-[#19CA32] hover:bg-green-50"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Another Service
                                    </Button>
                                </div>

                                {saveError && hasServices && (
                                    <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
                                        <AlertCircle className="h-4 w-4" />
                                        <p className="text-sm">{saveError}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-10 bg-[#19CA32] cursor-pointer hover:bg-[#16b82e] text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>

                        {hasServices && fields.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-gray-500">
                                    {fields.length} service{fields.length > 1 ? 's' : ''} added
                                </p>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
