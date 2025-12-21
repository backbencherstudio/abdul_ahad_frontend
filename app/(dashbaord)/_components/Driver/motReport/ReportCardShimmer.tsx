import { Skeleton } from '@/components/ui/skeleton'

export default function ReportCardShimmer() {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Shimmer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex sm:items-center gap-2 sm:gap-4 justify-between w-full">
                        <div className='flex gap-2 items-center'>
                            <Skeleton className="h-6 w-32 sm:w-40 bg-gray-200" />
                            <Skeleton className="h-6 w-16 rounded bg-gray-200" />
                        </div>
                        <Skeleton className="h-6 w-20 bg-gray-300 block sm:hidden" />
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Skeleton className="h-8 w-8 rounded bg-gray-200" />
                        <Skeleton className="h-8 w-28 sm:w-32 rounded bg-[#19CA32]/20" />
                    </div>
                </div>
                <div className="mt-2 sm:mt-3 hidden sm:block">
                    <Skeleton className="h-6 w-24 bg-gray-300" />
                </div>
            </div>

            {/* Content Shimmer */}
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {/* First Column */}
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <Skeleton className="h-4 w-20 mb-2 bg-gray-200" />
                            <Skeleton className="h-10 w-full rounded bg-gray-100" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-28 mb-2 bg-gray-200" />
                            <Skeleton className="h-10 w-full rounded bg-gray-100" />
                        </div>
                    </div>
                    
                    {/* Second Column */}
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <Skeleton className="h-4 w-20 mb-2 bg-gray-200" />
                            <Skeleton className="h-10 w-full rounded bg-gray-100" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-24 mb-2 bg-gray-200" />
                            <Skeleton className="h-10 w-full rounded bg-gray-100" />
                        </div>
                    </div>
                    
                    {/* Third Column */}
                    <div className="space-y-3 sm:space-y-4 sm:col-span-2 xl:col-span-1">
                        <div>
                            <Skeleton className="h-4 w-24 mb-2 bg-gray-200" />
                            <Skeleton className="h-10 w-full rounded bg-gray-100" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-28 mb-2 bg-gray-200" />
                            <Skeleton className="h-10 w-full rounded bg-gray-100" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

