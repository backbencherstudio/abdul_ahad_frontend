"use client"
import React, { useState, useRef } from 'react'
import { useForm } from "react-hook-form"
import { Edit2, ImageDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Types
interface ProfileFormData {
    name: string
    vtsNumber: string
    primaryContact: string
    email: string
    phone: string
    contactNumber: string
}

// Validation schemas
const profileValidation = {
    name: {
        required: "Name is required",
        minLength: {
            value: 2,
            message: "Name must be at least 2 characters"
        }
    },
    email: {
        required: "Email is required",
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address"
        }
    }
}

// Editable Input Component
const EditableInput = ({
    id,
    label,
    type = "text",
    placeholder,
    editingField,
    onEditClick,
    onBlur,
    register,
    errors,
    validation
}: {
    id: string
    label: string
    type?: string
    placeholder: string
    editingField: string | null
    onEditClick: (fieldName: string) => void
    onBlur: () => void
    register: any
    errors: any
    validation: any
}) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor={id}>{label}</Label>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEditClick(id)}
            >
                <Edit2 className="h-4 w-4" />
            </Button>
        </div>
        <Input
            id={id}
            type={type}
            placeholder={placeholder}
            className={`${editingField === id ? 'border-blue-500' : 'border-gray-300'}`}
            {...register(id, validation)}
            onBlur={onBlur}
        />
        {errors[id] && (
            <p className="text-sm text-red-500">{errors[id].message}</p>
        )}
    </div>
)

// Profile Image Upload Component
const ProfileImageUpload = ({
    profileImage,
    onImageClick,
    onImageChange,
    fileInputRef
}: {
    profileImage: string
    onImageClick: () => void
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    fileInputRef: React.RefObject<HTMLInputElement>
}) => (
    <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={onImageClick}>
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback className="bg-gray-200">
                    <ImageDownIcon className="h-8 w-8 text-gray-400" />
                </AvatarFallback>
            </Avatar>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
            />
        </div>
        <div>
            <h3 className="text-lg font-medium">Profile Picture</h3>
            <p className="text-sm text-gray-500">Click to upload a new image</p>
        </div>
    </div>
)

export default function AccountSettingsComponent() {
    // State
    const [profileImage, setProfileImage] = useState<string>("/api/placeholder/96/96")
    const [editingField, setEditingField] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form
    const profileForm = useForm<ProfileFormData>({
        defaultValues: {
            name: "",
            vtsNumber: "",
            primaryContact: "",
            email: "",
            phone: "",
            contactNumber: "",
        },
    })

    // Handlers
    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleEditClick = (fieldName: string) => {
        setEditingField(fieldName)
        setTimeout(() => {
            const element = document.getElementById(fieldName)
            if (element) {
                element.focus()
            }
        }, 100)
    }

    const handleFieldBlur = () => {
        setEditingField(null)
    }

    const onProfileSubmit = (data: ProfileFormData) => {
        console.log('Profile data:', data)
        // Handle profile update logic here
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
                <CardTitle className="text-2xl">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <ProfileImageUpload
                    profileImage={profileImage}
                    onImageClick={handleImageClick}
                    onImageChange={handleImageChange}
                    fileInputRef={fileInputRef}
                />

                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <EditableInput
                        id="name"
                        label="Name of Garage"
                        placeholder="Name of Garage"
                        editingField={editingField}
                        onEditClick={handleEditClick}
                        onBlur={handleFieldBlur}
                        register={profileForm.register}
                        errors={profileForm.formState.errors}
                        validation={profileValidation.name}
                    />

                    <EditableInput
                        id="vtsNumber"
                        label="VTS Number"
                        placeholder="Enter VTS Number"
                        editingField={editingField}
                        onEditClick={handleEditClick}
                        onBlur={handleFieldBlur}
                        register={profileForm.register}
                        errors={profileForm.formState.errors}
                        validation={{ required: "VTS Number is required" }}
                    />

                    <EditableInput
                        id="primaryContact"
                        label="Primary Contact Person"
                        placeholder="Enter Primary Contact Person"
                        editingField={editingField}
                        onEditClick={handleEditClick}
                        onBlur={handleFieldBlur}
                        register={profileForm.register}
                        errors={profileForm.formState.errors}
                        validation={{ required: "Primary Contact Person is required" }}
                    />

                    <EditableInput
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        editingField={editingField}
                        onEditClick={handleEditClick}
                        onBlur={handleFieldBlur}
                        register={profileForm.register}
                        errors={profileForm.formState.errors}
                        validation={profileValidation.email}
                    />

                    <EditableInput
                        id="contactNumber"
                        label="Contact Number"
                        type="tel"
                        placeholder="Enter contact number"
                        editingField={editingField}
                        onEditClick={handleEditClick}
                        onBlur={handleFieldBlur}
                        register={profileForm.register}
                        errors={profileForm.formState.errors}
                        validation={{ required: "Contact Number is required" }}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-[#14A228] hover:bg-green-600"
                    >
                        Save Change
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
