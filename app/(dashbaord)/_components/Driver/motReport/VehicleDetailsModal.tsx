import Link from 'next/link'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { MotReportWithVehicle } from '../../../driver/mot-reports/_types'
import { formatDate } from '../../../driver/mot-reports/_utils'

interface VehicleDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    vehicle: MotReportWithVehicle | null
}

export default function VehicleDetailsModal({ isOpen, onClose, vehicle }: VehicleDetailsModalProps) {
    return (
        <CustomReusableModal
            isOpen={isOpen}
            onClose={onClose}
            title={vehicle ? `MOT Details for ${vehicle.vehicleReg}` : "MOT Details"}
            showHeader={false}
            className="max-w-sm sm:max-w-md"
        >
            {vehicle && (
                <div className="bg-white rounded-lg overflow-hidden">
                    <div className="bg-[#19CA32] text-white p-4 text-center">
                        <h2 className="text-lg font-semibold">MOT check</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium text-sm sm:text-base">MOT</span>
                            <span className="text-xs sm:text-sm text-gray-600">
                                Expired {formatDate(vehicle.motExpiryDate)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium text-sm sm:text-base">Road Tax</span>
                            <span className="text-xs sm:text-sm text-gray-600">
                                Expired {formatDate(vehicle.motExpiryDate)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium text-sm sm:text-base">Model variant</span>
                            <span className="text-xs sm:text-sm text-gray-600">
                                {vehicle.vehicleMake} {vehicle.vehicleModel}
                            </span>
                        </div>

                        <Link
                            href={`/driver/mot-reports/${vehicle.vehicleReg}`}
                            className="w-full bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium py-2 mt-6 rounded-lg block text-center text-sm sm:text-base"
                        >
                            MOT Reports
                        </Link>
                    </div>
                </div>
            )}
        </CustomReusableModal>
    )
}
