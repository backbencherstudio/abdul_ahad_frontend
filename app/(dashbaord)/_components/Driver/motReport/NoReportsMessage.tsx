interface NoReportsMessageProps {}

export default function NoReportsMessage({}: NoReportsMessageProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="text-gray-400 text-base sm:text-lg mb-2">No reports found</div>
            <p className="text-sm sm:text-base text-gray-600">There are no MOT reports available.</p>
        </div>
    )
}
