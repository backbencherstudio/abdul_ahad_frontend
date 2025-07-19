"use client"
import React, { useState, useRef, useEffect } from 'react'
import { useForm } from "react-hook-form"
import { Edit2, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProfile } from "@/hooks/useProfile"
import ProfileImageUpload from '../Common/CommonImage';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useAuth } from '@/hooks/useAuth';
import { EmailChangeModal } from '@/components/reusable/EmailChangeModal';

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
}) => {
    const isEditing = editingField === id
    const isEmailField = id === 'email'

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    disabled={!isEditing || isEmailField}
                    className={`pr-10 ${isEditing && !isEmailField ? 'border-blue-500' : 'border-gray-300 bg-gray-50'}`}
                    {...register(id, validation)}
                    onBlur={onBlur}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute cursor-pointer right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${isEditing && !isEmailField ? 'text-blue-600' : 'text-gray-500'}`}
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

export default function AccountSettingsComponent() {
    // Profile hook
    const { profile, isLoading, error, refetch } = useProfile()
    const { isLoading: isUpdating, error: updateError, success: updateSuccess, mutate } = useUpdateProfile();
    const { checkAuth } = useAuth();

    // State
    const [profileImage, setProfileImage] = useState<string>("/api/placeholder/96/96")
    const [editingField, setEditingField] = useState<string | null>(null)
    const [originalValues, setOriginalValues] = useState<ProfileFormData | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

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


    useEffect(() => {
        if (profile) {
            const formValues = {
                name: profile.garage_name || profile.name || "",
                vtsNumber: profile.vts_number || "",
                primaryContact: profile.primary_contact || "",
                email: profile.email || "",
                phone: profile.phone_number || "",
                contactNumber: profile.phone_number || "",
            }
            profileForm.reset(formValues)
            setOriginalValues(formValues)
            setProfileImage(profile.avatar_url || "/api/placeholder/96/96");
        }
    }, [profile, profileForm])


    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = (fieldName: string) => {
        if (fieldName === 'email') {
            setIsEmailModalOpen(true);
            return;
        }
        
        if (editingField === fieldName) {
            setEditingField(null)
        } else {
            setEditingField(fieldName)
            setTimeout(() => {
                const element = document.getElementById(fieldName)
                if (element) {
                    element.focus()
                }
            }, 100)
        }
    }

    const checkForChanges = () => {
        if (!originalValues) return false;
        const currentValues = profileForm.getValues();
        // Exclude email from form changes since it's handled separately via modal
        const formChanged = Object.keys(currentValues).some(key => {
            if (key === 'email') return false; // Email changes are handled via modal
            return currentValues[key as keyof ProfileFormData] !== originalValues[key as keyof ProfileFormData];
        });
        const imageChanged = profileImage !== (profile?.avatar_url || "/api/placeholder/96/96");
        const hasAnyChanges = formChanged || imageChanged || !!selectedFile;
        setHasChanges(hasAnyChanges);
        return hasAnyChanges;
    };

    const handleFieldBlur = () => {
        setTimeout(() => {
            checkForChanges()
            setEditingField(null)
        }, 100)
    }

    const watchedValues = profileForm.watch()

    useEffect(() => {
        if (originalValues) {
            checkForChanges()
        }
    }, [watchedValues])

    useEffect(() => {
        if (originalValues) {
            checkForChanges()
        }
    }, [profileImage, selectedFile]);

    const onProfileSubmit = async (data: ProfileFormData) => {
        try {
            let payload: any;
            let isFormData = false;
            if (selectedFile) {
                payload = new FormData();
                payload.append('garage_name', data.name);
                payload.append('vts_number', data.vtsNumber);
                payload.append('primary_contact', data.primaryContact);
                payload.append('email', data.email);
                payload.append('phone_number', data.contactNumber);
                payload.append('image', selectedFile);
                isFormData = true;
            } else {
                payload = {
                    garage_name: data.name,
                    vts_number: data.vtsNumber,
                    primary_contact: data.primaryContact,
                    email: data.email,
                    phone_number: data.contactNumber,
                };
                if (profileImage && profileImage !== profile?.avatar_url) {
                    payload.image = profileImage;
                }
            }
            await mutate(payload, isFormData);
            await refetch();
            await checkAuth();
            setOriginalValues(data);
            setHasChanges(false);
            setSelectedFile(null);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(updateError || 'Failed to update profile. Please try again.');
        }
    };

    const handleEmailChangeSuccess = async (newEmail: string) => {
        try {
            await refetch();
            await checkAuth();
            // Update the form with new email
            profileForm.setValue('email', newEmail);
            setOriginalValues(prev => prev ? { ...prev, email: newEmail } : null);
            setHasChanges(false);
        } catch (error) {
            console.error('Error updating email:', error);
        }
    };

    if (isLoading) {
        return (
            <Card className="shadow-sm">
                <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
                    <CardTitle className="text-2xl">Account Settings</CardTitle>
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
                    <CardTitle className="text-2xl">Account Settings</CardTitle>
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
        <>
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
                        onImageError={() => setProfileImage("")}
                    />

                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <EditableInput
                            id="name"
                            label="Garage Name"
                            placeholder="Enter Garage Name"
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
                            disabled={!hasChanges || isSaving}
                            className={`w-full transition-all  ${hasChanges && !isSaving
                                ? 'bg-[#14A228] hover:bg-green-600 cursor-pointer'
                                : 'bg-gray-300 cursor-not-allowed '
                                }`}
                        >
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </div>
                            ) : hasChanges ? (
                                'Save Changes'
                            ) : (
                                'No Changes to Save'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Email Change Modal */}
            <EmailChangeModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                currentEmail={profile?.email || ""}
                onEmailChangeSuccess={handleEmailChangeSuccess}
            />
        </>
    )
}
