import { Skeleton } from '@/components/ui/skeleton'

export default function ReportCardShimmer() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Pass Badge Shimmer */}
                <div className="flex-shrink-0">
                    <Skeleton className="h-7 w-16 rounded-md bg-gray-200" />
                </div>

                {/* MOT Test Number Shimmer */}
                <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-28 mb-2 bg-gray-200" />
                    <Skeleton className="h-10 w-full rounded bg-gray-100" />
                </div>

                {/* MOT Pass Date Shimmer */}
                <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-24 mb-2 bg-gray-200" />
                    <Skeleton className="h-10 w-full rounded bg-green-100" />
                </div>

                {/* MOT Expired On Shimmer */}
                <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-28 mb-2 bg-gray-200" />
                    <Skeleton className="h-10 w-full rounded bg-gray-100" />
                </div>
            </div>
        </div>
    )
}

