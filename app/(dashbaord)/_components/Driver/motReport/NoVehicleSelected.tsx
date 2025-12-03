import { Car } from 'lucide-react'

export default function NoVehicleSelected() {
    return (
        <div className="flex items-center justify-center min-h-[30vh] sm:min-h-[40vh] px-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Car className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <div className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No Vehicle Selected</div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Click on a vehicle card above and then click "MOT Reports" to view details.
                </p>
            </div>
        </div>
    )
}
