"use client"
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePasswordChange } from "@/hooks/usePasswordChange"

// Types
interface PasswordFormData {
    oldPassword: string
    newPassword: string
    confirmPassword: string
}

// Password Input Component
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

export default function GaragePasswordChangeComponent() {
    // Password change hook
    const { changePassword, isLoading, error, resetError } = usePasswordChange()

    // State
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Form
    const passwordForm = useForm<PasswordFormData>({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    // Validation
    const passwordValidation = {
        required: "This field is required",
        minLength: {
            value: 6,
            message: "Password must be at least 6 characters"
        }
    }

    // Handlers
    const onPasswordSubmit = async (data: PasswordFormData) => {
        try {
            if (data.newPassword !== data.confirmPassword) {
                toast.error('New password and confirm password do not match')
                return
            }

            if (data.oldPassword === data.newPassword) {
                toast.error('New password must be different from old password')
                return
            }

            const success = await changePassword({
                old_password: data.oldPassword,
                new_password: data.newPassword
            })

            if (success) {
                toast.success('Password changed successfully!')
                passwordForm.reset()
                resetError()
            } else {
                toast.error(error || 'Failed to change password')
            }
        } catch (error) {
            toast.error('Failed to change password. Please try again.')
        }
    }

    return (
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
                        disabled={isLoading}
                        className={`w-full transition-all ${isLoading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-[#14A228] hover:bg-green-600'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Changing Password...
                            </div>
                        ) : (
                            'Change Password'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
