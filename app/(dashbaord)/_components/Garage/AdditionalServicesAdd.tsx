'use client'

import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import { useAppDispatch, useAppSelector, setAdditionals } from '@/rtk'

interface ServiceField {
    serviceName: string
    persistedId?: string | null
}

interface AdditionalServicesFormData {
    services: ServiceField[]
}

const buildDefaultServices = (services: { name: string; id?: string | null }[]) => {
    if (services.length === 0) {
        return [{ serviceName: '', persistedId: undefined }]
    }

    return services.map(service => ({
        serviceName: service.name,
        persistedId: service.id ?? undefined
    }))
}

export default function AdditionalServicesAdd() {
    const dispatch = useAppDispatch()
    const { additionals, formVersion } = useAppSelector(state => state.pricing)

    const {
        register,
        control,
        reset,
        watch,
        formState: { errors }
    } = useForm<AdditionalServicesFormData>({
        defaultValues: {
            services: buildDefaultServices(additionals)
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'services'
    })

    const watchedServices = watch('services')

    useEffect(() => {
        // when API data changes, refill the form
        reset({
            services: buildDefaultServices(additionals)
        })
    }, [formVersion, reset])

    useEffect(() => {
        // keep RTK slice in sync as user types
        const validServices =
            watchedServices
                ?.filter(service => service?.serviceName?.trim())
                .map(service => ({
                    id: service.persistedId ?? null,
                    name: service.serviceName.trim()
                })) ?? []

        dispatch(setAdditionals(validServices))
    }, [watchedServices, dispatch])

    const addServiceField = () => {
        append({ serviceName: '', persistedId: undefined })
    }

    const removeService = (index: number) => {
        remove(index)
    }

    const hasServices = fields.length > 0

    return (
        <div className="mb-6">
            <Card className="border border-[#19CA32] py-5">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle>Additional Services</CardTitle>
                        <CardDescription>
                            Add every extra service you offer so we can show them on your public garage profile.
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addServiceField}
                        className="border-[#19CA32] text-[#19CA32] hover:bg-green-50"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Button>
                </CardHeader>
                <CardContent className="p-6">
                    <form
                        // prevent enter key from submitting anything here
                        onSubmit={e => e.preventDefault()}
                        className="space-y-6"
                    >
                        {!hasServices && (
                            <div className="rounded-md border border-dashed border-[#19CA32] p-6 text-center">
                                <p className="text-sm text-gray-500">No services added yet.</p>
                                <p className="text-sm text-gray-500">
                                    Use the “Add Service” button to list your additional services. They will be saved
                                    when you press the green Save button above.
                                </p>
                            </div>
                        )}

                        {hasServices && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="space-y-2">
                                            <div className="space-y-2 rounded-md border border-[#19CA32] p-4">
                                                <input
                                                    type="hidden"
                                                    {...register(`services.${index}.persistedId` as const)}
                                                />
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Service Name {index + 1}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        {...register(`services.${index}.serviceName` as const, {
                                                            required: 'Service name is required'
                                                        })}
                                                        placeholder="e.g. Brake Check"
                                                        className="h-11 pr-10"
                                                    />
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => removeService(index)}
                                                            className="h-8 w-8 p-0 hover:bg-red-50"
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
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

                                {hasServices && (
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">
                                            These services will be submitted together when you click the main Save
                                            button.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
