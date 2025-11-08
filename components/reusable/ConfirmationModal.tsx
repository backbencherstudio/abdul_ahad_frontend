import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    isLoading = false,
}: ConfirmationModalProps) {
    const variantConfig = {
        danger: {
            icon: AlertCircle,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            buttonClass: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            buttonClass: 'bg-blue-600 hover:bg-blue-700',
        },
        success: {
            icon: CheckCircle,
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            buttonClass: 'bg-green-600 hover:bg-green-700',
        },
    };

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && !isLoading && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${config.bgColor} ${config.borderColor} border`}>
                            <Icon className={`w-5 h-5 ${config.iconColor}`} />
                        </div>
                        <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-left pt-2">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={isLoading} className="cursor-pointer">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className={`${config.buttonClass} cursor-pointer`}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

