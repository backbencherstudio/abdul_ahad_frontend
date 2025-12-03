import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
    message?: string
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
    return (
        <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#19CA32]" />
                <div className="text-lg text-gray-600">{message}</div>
            </div>
        </div>
    )
}
