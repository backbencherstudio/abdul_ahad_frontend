import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CustomReusableModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    showHeader?: boolean
    className?: string
    customHeader?: React.ReactNode
    icon?: React.ReactNode
    description?: string
    variant?: 'default' | 'danger' | 'success'
}

export default function CustomReusableModal({
    isOpen,
    onClose,
    title = "Modal",
    children,
    showHeader = true,
    className = "",
    customHeader,
    icon,
    description,
    variant = 'default'
}: CustomReusableModalProps) {
    const accentClasses = variant === 'danger'
        ? 'bg-rose-100 text-rose-700 ring-rose-200'
        : variant === 'success'
            ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
            : 'bg-slate-100 text-slate-700 ring-slate-200'

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className={`max-w-md mx-auto border p-0 overflow-hidden rounded-xl shadow-lg ${className}`}>
                {customHeader ? (
                    <>
                        {/* Visually hidden DialogTitle for accessibility */}
                        <DialogTitle className="sr-only">{title}</DialogTitle>
                        {customHeader}
                    </>
                ) : (
                    <DialogHeader className={showHeader ? "p-5 pb-0" : "sr-only"}>
                        <div className="flex items-start gap-3">
                            {icon ? (
                                <div className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full ring-4 ${accentClasses}`}>
                                    {icon}
                                </div>
                            ) : null}
                            <div className="flex-1">
                                <DialogTitle className={showHeader ? "text-lg font-semibold" : "sr-only"}>
                                    {title}
                                </DialogTitle>
                                {description ? (
                                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                                ) : null}
                            </div>
                        </div>
                    </DialogHeader>
                )}
                <div className="p-5">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}