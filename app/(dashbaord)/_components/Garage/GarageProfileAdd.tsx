'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'
import Image from 'next/image'

interface GarageProfileFormData {
    garageName: string
    vtsNumber: string
    postcode: string
    email: string
    contactNumber: string
}

interface FileUploadProps {
    onFileSelect: (file: File | null) => void
    selectedFile: File | null
    className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, className }) => {
    const [isDragOver, setIsDragOver] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = e.dataTransfer.files
        if (files && files[0]) {
            handleFileSelection(files[0])
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelection(file)
        }
    }

    const handleFileSelection = (file: File) => {
        onFileSelect(file)

        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }
    React.useEffect(() => {
        if (!selectedFile) {
            setImagePreview(null)
        }
    }, [selectedFile])

    return (
        <div className={cn("space-y-2", className)}>
            <Label className="text-sm font-medium text-gray-700">Upload Garage Profile</Label>

            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    "hover:border-green-400 hover:bg-green-50/50",
                    isDragOver ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50",
                    "cursor-pointer"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Download className="w-6 h-6 text-gray-500" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                            Drag and drop files here
                        </p>
                        <p className="text-xs text-gray-500">
                            Maximum file size is 5MB
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                            e.stopPropagation()
                            document.getElementById('file-input')?.click()
                        }}
                    >
                        Browse file
                    </Button>
                </div>

                <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                />
            </div>

            {selectedFile && (
                <div className="mt-4 space-y-3">
                    {imagePreview && (
                        <div className="relative h-48 flex items-center justify-center">
                            <Image
                                width={100}
                                height={100}
                                src={imagePreview}
                                alt="Selected image preview"
                                className="w-full max-w-md h-full object-cover rounded-lg border border-gray-200"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function GarageProfileAdd() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<GarageProfileFormData>({
        defaultValues: {
            garageName: '',
            vtsNumber: '',
            postcode: '',
            email: '',
            contactNumber: '',
        }
    })

    const onSubmit = async (data: GarageProfileFormData) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()
            Object.entries(data).forEach(([key, value]) => {
                if (value) formData.append(key, value)
            })

            if (selectedFile) {
                formData.append('garageProfile', selectedFile)
            }

            await new Promise(resolve => setTimeout(resolve, 2000))

            reset()
            setSelectedFile(null)

            toast.success('Garage profile created successfully!')

        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('Error creating garage profile. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mt-10">
            <Card className="py-10 border border-[#19CA32]">
                <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        Add Garage Profile
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Name of Garage - Full Width */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                                Name of Garage
                            </Label>
                            <Input
                                {...register('garageName', {
                                    required: 'Garage name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Garage name must be at least 2 characters'
                                    }
                                })}
                                placeholder="Enter garage name"
                                className="w-full h-11  border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                            />
                            {errors.garageName && (
                                <p className="text-sm text-red-500">{errors.garageName.message}</p>
                            )}
                        </div>

                        {/* VTS Number & Postcode - Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    VTS Number
                                </Label>
                                <Input
                                    {...register('vtsNumber', {
                                        required: 'VTS Number is required'
                                    })}
                                    placeholder="Enter VTS number"
                                    className="h-11 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                />
                                {errors.vtsNumber && (
                                    <p className="text-sm text-red-500">{errors.vtsNumber.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Postcode
                                </Label>
                                <Input
                                    {...register('postcode', {
                                        required: 'Postcode is required'
                                    })}
                                    placeholder="Enter postcode"
                                    className="h-11 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                />
                                {errors.postcode && (
                                    <p className="text-sm text-red-500">{errors.postcode.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Email & Contact Number - Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Email
                                </Label>
                                <Input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Please enter a valid email address'
                                        }
                                    })}
                                    type="email"
                                    placeholder="Enter email address"
                                    className="h-11 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                    Contact Number
                                </Label>
                                <Input
                                    {...register('contactNumber', {
                                        required: 'Contact number is required',
                                        minLength: {
                                            value: 10,
                                            message: 'Contact number must be at least 10 digits'
                                        }
                                    })}
                                    type="tel"
                                    placeholder="Enter contact number"
                                    className="h-11 border border-[#19CA32] focus:border-green-500 focus:ring-green-500"
                                />
                                {errors.contactNumber && (
                                    <p className="text-sm text-red-500">{errors.contactNumber.message}</p>
                                )}
                            </div>
                        </div>

                        {/* File Upload */}
                        <FileUpload
                            onFileSelect={setSelectedFile}
                            selectedFile={selectedFile}
                            className="w-full"
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-[#19CA32] cursor-pointer hover:bg-[#16b82e] text-white font-medium text-base"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
