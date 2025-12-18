'use client'

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector, setAdditionals } from '@/rtk'
import { useDeleteServiceMutation, useGetPricingQuery } from '@/rtk/api/garage/pricingApis'
import { toast } from 'react-toastify'

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
    const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation()
    const { refetch } = useGetPricingQuery()
    const [deletingId, setDeletingId] = useState<string | null>(null)

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
    const prevFormVersionRef = React.useRef(formVersion)
    const isResettingRef = React.useRef(false)
    const hasInitializedRef = React.useRef(false)

    // Initialize form with data from Redux on mount or when formVersion changes
    useEffect(() => {
        const shouldReset = 
            // Initial load: we have data but haven't initialized yet
            (!hasInitializedRef.current && additionals.length > 0) ||
            // Form version changed (new data loaded from API)
            (prevFormVersionRef.current !== formVersion)

        if (shouldReset) {
            prevFormVersionRef.current = formVersion
            hasInitializedRef.current = true
            isResettingRef.current = true
            
            const newServices = buildDefaultServices(additionals)
            reset({
                services: newServices
            })
            
            // Reset flag after form updates (give form time to fully update)
            setTimeout(() => {
                isResettingRef.current = false
            }, 300)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formVersion, reset, additionals.length]) // Include additionals.length to detect when data arrives

    useEffect(() => {
        // Skip if we're currently resetting the form
        if (isResettingRef.current) {
            return
        }

        // Skip if form hasn't been initialized yet (wait for data to load)
        if (!hasInitializedRef.current) {
            return
        }

        // keep RTK slice in sync as user types
        const validServices =
            watchedServices
                ?.filter(service => service?.serviceName?.trim())
                .map(service => ({
                    id: service.persistedId ?? null,
                    name: service.serviceName.trim()
                })) ?? []

        // Only dispatch if services actually changed (prevent unnecessary updates)
        const currentStr = JSON.stringify(validServices)
        const prevStr = JSON.stringify(additionals)
        if (currentStr !== prevStr) {
            dispatch(setAdditionals(validServices))
        }
    }, [watchedServices, dispatch, additionals])

    const addServiceField = () => {
        append({ serviceName: '', persistedId: undefined })
    }

    const removeService = async (index: number) => {
        const service = watchedServices[index]
        const serviceId = service?.persistedId

        // If service has an ID (persisted in database), delete it via API
        if (serviceId) {
            try {
                setDeletingId(serviceId)
                await deleteService(serviceId).unwrap()
                toast.success('Service deleted successfully')
                // Refetch data to update the store
                await refetch()
            } catch (error: any) {
                const errorMessage = error?.data?.message || 'Failed to delete service. Please try again.'
                toast.error(errorMessage)
            } finally {
                setDeletingId(null)
            }
        } else {
            // If it's a new service (no ID), just remove from form
            remove(index)
        }
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
                                                        disabled={deletingId === watchedServices[index]?.persistedId}
                                                    />
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => removeService(index)}
                                                            disabled={deletingId === watchedServices[index]?.persistedId || isDeleting}
                                                            className="h-8 w-8 p-0 hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                            {deletingId === watchedServices[index]?.persistedId ? (
                                                                <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                                            ) : (
                                                                <X className="h-4 w-4 text-red-500" />
                                                            )}
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
