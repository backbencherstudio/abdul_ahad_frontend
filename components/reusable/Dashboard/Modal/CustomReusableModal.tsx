import React, { useEffect } from 'react'
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
        ? 'bg-destructive/10 text-destructive ring-destructive/20'
        : variant === 'success'
            ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
            : 'bg-accent text-accent-foreground ring-accent'

    // Ensure proper cleanup when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Small delay to ensure modal cleanup is complete
            const timer = setTimeout(() => {
                // Remove any lingering pointer-events or overflow styles
                const body = document.body
                body.style.pointerEvents = ''
                body.style.overflow = ''
                
                // Remove any backdrop that might be stuck
                const backdrops = document.querySelectorAll('[data-radix-dialog-overlay]')
                backdrops.forEach(backdrop => {
                    if (backdrop instanceof HTMLElement) {
                        backdrop.style.pointerEvents = ''
                    }
                })
            }, 150)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent 
                className={`max-w-md mx-auto border p-0 overflow-hidden rounded-xl shadow-lg ${className}`}
                onInteractOutside={(e) => {
                    // Allow closing on outside click
                    onClose()
                }}
                onEscapeKeyDown={(e) => {
                    onClose()
                }}
            >
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
                                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
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