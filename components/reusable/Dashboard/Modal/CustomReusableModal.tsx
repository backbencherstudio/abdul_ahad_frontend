import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface CustomReusableModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    showHeader?: boolean
    className?: string
}

export default function CustomReusableModal({
    isOpen,
    onClose,
    title = "Modal",
    children,
    showHeader = true,
    className = ""
}: CustomReusableModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`max-w-md mx-auto border border-[#19CA32] p-0 overflow-hidden ${className}`}>
                <DialogHeader className={showHeader ? "p-4 pb-0" : "sr-only"}>
                    <div className="flex items-center justify-between">
                        <DialogTitle className={showHeader ? "text-lg font-semibold" : "sr-only"}>
                            {title}
                        </DialogTitle>

                    </div>
                </DialogHeader>
                <div className="p-0">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}
