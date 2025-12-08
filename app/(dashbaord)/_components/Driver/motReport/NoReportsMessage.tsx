import { TabType } from '@/app/(dashbaord)/driver/mot-reports/_types'

interface NoReportsMessageProps {
    activeTab: TabType
}

export default function NoReportsMessage({ activeTab }: NoReportsMessageProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="text-gray-400 text-base sm:text-lg mb-2">No {activeTab.toLowerCase()} reports found</div>
            <p className="text-sm sm:text-base text-gray-600">There are no MOT reports available for the selected filter.</p>
        </div>
    )
}
