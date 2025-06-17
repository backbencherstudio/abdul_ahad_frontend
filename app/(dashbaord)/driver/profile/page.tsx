"use client"
import React, { useState, useRef } from 'react'
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Edit2, User, Lock, Upload, ImageDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Types
interface ProfileFormData {
    name: string
    email: string
    phone: string
}

interface PasswordFormData {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}

interface EditableInputProps {
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
}

// Components
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
    <div className="flex justify-center mb-8">
        <div className="relative">
            <div className="cursor-pointer" onClick={onImageClick}>
                <Avatar className="w-24 h-24">
                    <AvatarImage src={profileImage} alt="Profile" />
                    <AvatarFallback>RD</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#14A228] rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors">
                    <ImageDownIcon className="h-4 w-4" />
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    </div>
)

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
}: EditableInputProps) => (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                disabled={editingField !== id}
                onBlur={onBlur}
                className={`${editingField !== id ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                {...register(id, validation)}
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEditClick(id)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            >
                <Edit2 className="h-4 w-4 text-gray-500" />
            </Button>
        </div>
        {errors[id] && (
            <p className="text-sm text-red-500">{errors[id].message}</p>
        )}
    </div>
)

const PasswordInput = ({
    id,
    label,
    placeholder,
    showPassword,
    onTogglePassword,
    register,
    errors,
    validation
}: {
    id: string
    label: string
    placeholder: string
    showPassword: boolean
    onTogglePassword: () => void
    register: any
    errors: any
    validation: any
}) => (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
            <Input
                id={id}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                {...register(id, validation)}
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={onTogglePassword}
            >
                {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </Button>
        </div>
        {errors[id] && (
            <p className="text-sm text-red-500">{errors[id].message}</p>
        )}
    </div>
)

const TabButton = ({
    isActive,
    onClick,
    icon: Icon,
    children
}: {
    isActive: boolean
    onClick: () => void
    icon: React.ComponentType<any>
    children: React.ReactNode
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 text-sm lg:text-base cursor-pointer p-3 rounded-lg text-left transition-all ${isActive
            ? 'bg-green-100 text-green-700'
            : 'text-gray-700 hover:bg-gray-50'
            }`}
    >
        <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-500'
            }`} />
        {children}
    </button>
)

// Main Component
export default function Profile() {
    // State
    const [activeTab, setActiveTab] = useState('profile')
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [profileImage, setProfileImage] = useState<string>("/api/placeholder/96/96")
    const [editingField, setEditingField] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Forms
    const profileForm = useForm<ProfileFormData>({
        defaultValues: {
            name: "Robbi Darwis",
            email: "",
            phone: "",
        },
    })

    const passwordForm = useForm<PasswordFormData>({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
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
        console.log("Profile updated:", data)
    }

    const onPasswordSubmit = (data: PasswordFormData) => {
        if (data.newPassword !== data.confirmPassword) {
            passwordForm.setError("confirmPassword", {
                type: "manual",
                message: "Passwords don't match"
            })
            return
        }
        console.log("Password updated:", data)
    }

    // Validation rules
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
                value: /^\S+@\S+$/i,
                message: "Please enter a valid email address"
            }
        },
        phone: {
            required: "Phone number is required",
            minLength: {
                value: 10,
                message: "Phone number must be at least 10 characters"
            }
        }
    }

    const passwordValidation = {
        required: "This field is required",
        minLength: {
            value: 8,
            message: "Password must be at least 8 characters"
        }
    }

    return (
        <div className="">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full lg:w-64">
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <div className="space-y-2 flex flex-row lg:flex-col gap-2">
                                <TabButton
                                    isActive={activeTab === 'profile'}
                                    onClick={() => setActiveTab('profile')}
                                    icon={User}
                                >
                                    My Profile
                                </TabButton>
                                <TabButton
                                    isActive={activeTab === 'password'}
                                    onClick={() => setActiveTab('password')}
                                    icon={Lock}
                                >
                                    Password
                                </TabButton>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <Card className="shadow-sm">
                            <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
                                <CardTitle className="text-2xl">My Profile</CardTitle>
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
                                        label="Name"
                                        placeholder="Enter your name"
                                        editingField={editingField}
                                        onEditClick={handleEditClick}
                                        onBlur={handleFieldBlur}
                                        register={profileForm.register}
                                        errors={profileForm.formState.errors}
                                        validation={profileValidation.name}
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
                                        id="phone"
                                        label="Phone Number"
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        editingField={editingField}
                                        onEditClick={handleEditClick}
                                        onBlur={handleFieldBlur}
                                        register={profileForm.register}
                                        errors={profileForm.formState.errors}
                                        validation={profileValidation.phone}
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
                    )}

                    {activeTab === 'password' && (
                        <Card className="shadow-sm">
                            <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
                                <CardTitle className="text-2xl">Password</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                    <PasswordInput
                                        id="oldPassword"
                                        label="Old Password"
                                        placeholder="Enter your old password"
                                        showPassword={showOldPassword}
                                        onTogglePassword={() => setShowOldPassword(!showOldPassword)}
                                        register={passwordForm.register}
                                        errors={passwordForm.formState.errors}
                                        validation={passwordValidation}
                                    />

                                    <PasswordInput
                                        id="newPassword"
                                        label="New Password"
                                        placeholder="New Password"
                                        showPassword={showNewPassword}
                                        onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                                        register={passwordForm.register}
                                        errors={passwordForm.formState.errors}
                                        validation={passwordValidation}
                                    />

                                    <PasswordInput
                                        id="confirmPassword"
                                        label="Confirm Password"
                                        placeholder="Conform Password"
                                        showPassword={showConfirmPassword}
                                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                                        register={passwordForm.register}
                                        errors={passwordForm.formState.errors}
                                        validation={passwordValidation}
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
                    )}
                </div>
            </div>
        </div>
    )
}
