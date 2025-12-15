import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
    error: string | null
    onRetry?: () => void
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    if (!error) return null

    return (
        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 text-center">
            <div className="text-red-500 text-base sm:text-lg mb-2">Error</div>
            <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
            <Button 
                onClick={onRetry || (() => window.location.reload())} 
                className="bg-[#19CA32] hover:bg-[#16b82e] text-white"
            >
                Try Again
            </Button>
        </div>
    )
}
