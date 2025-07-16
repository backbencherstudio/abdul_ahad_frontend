"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useForm } from "react-hook-form"
import { Edit2, ImageDownIcon, Loader2 } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfile } from "@/hooks/useProfile"
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import Image from 'next/image'
import { useAuth } from "@/hooks/useAuth";

interface ProfileFormData {
    name: string
    email: string
    phone: string
}

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
    },
    phone: {
        required: "Phone number is required"
    }
}

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
}) => {
    const isEditing = editingField === id

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    disabled={!isEditing}
                    className={`pr-10 ${isEditing ? 'border-blue-500' : 'border-gray-300 bg-gray-50'}`}
                    {...register(id, validation)}
                    onBlur={onBlur}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${isEditing ? 'text-blue-600' : 'text-gray-500'}`}
                    onClick={() => onEditClick(id)}
                >
                    <Edit2 className="h-4 w-4" />
                </Button>
            </div>
            {errors[id] && (
                <p className="text-sm text-red-500">{errors[id].message}</p>
            )}
        </div>
    )
}

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
                {
                    profileImage ? (
                        <Image
                            src={profileImage}
                            alt="Profile"
                            width={96}
                            height={96}
                        />
                    ) : (
                        <AvatarFallback className="bg-gray-200">
                            <ImageDownIcon className="h-8 w-8 text-gray-400" />
                        </AvatarFallback>
                    )
                }
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

export default function MyProfile() {
    const { profile, isLoading, error, refetch } = useProfile();
    const { isLoading: isUpdating, error: updateError, success: updateSuccess, mutate } = useUpdateProfile();
    const { checkAuth } = useAuth();

    // State
    const [profileImage, setProfileImage] = useState<string>("/api/placeholder/96/96");
    const [editingField, setEditingField] = useState<string | null>(null);
    const [originalValues, setOriginalValues] = useState<ProfileFormData | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form
    const profileForm = useForm<ProfileFormData>({
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    });

    useEffect(() => {
        if (profile) {
            const formValues = {
                name: profile.name || "",
                email: profile.email || "",
                phone: profile.phone_number || "",
            };
            profileForm.reset(formValues);
            setOriginalValues(formValues);
            setProfileImage(profile.avatar_url || "/api/placeholder/96/96");
        }
    }, [profile, profileForm]);

    const checkForChanges = () => {
        if (!originalValues) return false;
        const currentValues = profileForm.getValues();
        const formChanged = Object.keys(currentValues).some(key =>
            currentValues[key as keyof ProfileFormData] !== originalValues[key as keyof ProfileFormData]
        );
        const imageChanged = profileImage !== (profile?.avatar_url || "/api/placeholder/96/96");
        const hasAnyChanges = formChanged || imageChanged || !!selectedFile;
        setHasChanges(hasAnyChanges);
        return hasAnyChanges;
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const newImage = e.target?.result as string;
                setProfileImage(newImage);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = (fieldName: string) => {
        setEditingField(editingField === fieldName ? null : fieldName);
        if (editingField !== fieldName) {
            setTimeout(() => {
                const element = document.getElementById(fieldName);
                if (element) element.focus();
            }, 100);
        }
    };

    const handleFieldBlur = () => {
        setTimeout(() => {
            checkForChanges();
            setEditingField(null);
        }, 100);
    };

    const watchedValues = profileForm.watch();
    useEffect(() => { if (originalValues) checkForChanges(); }, [watchedValues]);
    useEffect(() => { if (originalValues) checkForChanges(); }, [profileImage, selectedFile]);

    const onProfileSubmit = async (data: ProfileFormData) => {
        try {
            let payload: any;
            let isFormData = false;
            if (selectedFile) {
                payload = new FormData();
                payload.append('name', data.name);
                payload.append('email', data.email);
                payload.append('phone', data.phone);
                payload.append('image', selectedFile);
                isFormData = true;
            } else {
                payload = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                };
                if (profileImage && profileImage !== profile?.avatar_url) {
                    payload.image = profileImage;
                }
            }
            await mutate(payload, isFormData);
            setOriginalValues(data);
            setHasChanges(false);
            setSelectedFile(null);
            if (updateSuccess) {
                toast.success('Profile updated successfully!');
                refetch();
                checkAuth();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(updateError || 'Failed to update profile. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <Card className="shadow-sm">
                <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
                    <CardTitle className="text-2xl">My Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#14A228]" />
                        <span className="ml-2 text-gray-600">Loading profile data...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="shadow-sm">
                <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
                    <CardTitle className="text-2xl">My Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <p className="text-red-500 mb-4">{error}</p>
                        <Button
                            onClick={refetch}
                            className="bg-[#14A228] hover:bg-green-600"
                        >
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
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

                {updateError && (
                    <p className="text-sm text-red-500 mb-2">{updateError}</p>
                )}
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
                        disabled={!hasChanges || isUpdating}
                        className={`w-full transition-all ${hasChanges && !isUpdating
                            ? 'bg-[#14A228] hover:bg-green-600'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {isUpdating ? (
                            <><Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />Updating...</>
                        ) : hasChanges ? 'Save Changes' : 'No Changes to Save'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
