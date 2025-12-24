import { Skeleton } from '@/components/ui/skeleton'

export default function VehicleHeaderShimmer() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
            {/* Header with Vehicle Info and Download Button Shimmer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Skeleton className="h-6 sm:h-7 w-32 sm:w-40 bg-gray-200" />
                    <Skeleton className="h-7 w-20 sm:w-24 rounded bg-gray-300" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded bg-gray-200" />
                    <Skeleton className="h-8 w-28 sm:w-36 rounded bg-[#19CA32]/20" />
                </div>
            </div>

            {/* Vehicle Details Shimmer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                    <Skeleton className="h-4 w-16 mb-2 bg-gray-200" />
                    <Skeleton className="h-10 w-full rounded bg-gray-100" />
                </div>
                <div>
                    <Skeleton className="h-4 w-20 mb-2 bg-gray-200" />
                    <Skeleton className="h-10 w-full rounded bg-gray-100" />
                </div>
                <div>
                    <Skeleton className="h-4 w-28 mb-2 bg-gray-200" />
                    <Skeleton className="h-10 w-full rounded bg-gray-100" />
                </div>
            </div>
        </div>
    )
}

