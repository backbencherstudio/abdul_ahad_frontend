import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IoNotifications } from 'react-icons/io5'
import { MOTReport, Vehicle } from '@/app/(dashbaord)/driver/mot-reports/_types'
import { formatDate, getStatusStyles } from '@/app/(dashbaord)/driver/mot-reports/_utils'

interface ReportCardProps {
    report: MOTReport
    vehicleData: Vehicle
    onDownloadClick: (report: MOTReport, vehicle: Vehicle) => void
}

const ReportField = ({ label, value, className = "bg-gray-50 border-gray-300 text-gray-900" }: {
    label: string
    value: string
    className?: string
}) => (
    <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">{label}</Label>
        <Input value={value} readOnly className={className} />
    </div>
)

export default function ReportCard({ report, vehicleData, onDownloadClick }: ReportCardProps) {
    const styles = getStatusStyles(report.motStatus)

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex sm:items-center gap-2 sm:gap-4 justify-between w-full">
                        <div className='flex gap-2 items-center'>
                            <div className="text-base sm:text-lg font-bold text-gray-900">
                                {vehicleData.make.toUpperCase()} {vehicleData.model.toUpperCase()}
                            </div>
                            <span className={`px-3 py-1 rounded text-sm font-medium ${styles.badge} w-fit`}>
                                {report.motStatus}
                            </span>
                        </div>
                        <div className="bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold block sm:hidden">
                            {vehicleData.registrationNumber}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button variant="outline" size="sm" className="flex items-center gap-1 px-2 sm:px-3 py-1">
                            <IoNotifications className="text-lg sm:text-xl" />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-[#19CA32] cursor-pointer hover:bg-[#16b82e] text-white px-2 sm:px-3 py-1 flex items-center gap-1 text-xs sm:text-sm"
                            onClick={() => onDownloadClick(report, vehicleData)}
                        >
                            <Download className="w-3 h-3" />
                            Download Reports
                        </Button>
                    </div>
                </div>
                <div className="mt-2 sm:mt-3 hidden sm:block">
                    <div className="bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold inline-block">
                        {vehicleData.registrationNumber}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                        <ReportField label="Colour" value={report.color} />
                        <ReportField label="MOT test number" value={report.motTestNumber} />
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        <ReportField label="Fuel type" value={report.fuelType} />
                        <ReportField
                            label="MOT Pass Date"
                            value={formatDate(report.motPassDate)}
                            className={`border-2 text-gray-900 ${styles.passDate}`}
                        />
                    </div>
                    <div className="space-y-3 sm:space-y-4 sm:col-span-2 xl:col-span-1">
                        <ReportField label="Date registered" value={formatDate(report.registrationDate)} />
                        <ReportField
                            label="MOT expired on"
                            value={formatDate(report.motExpiryDate)}
                            className={`border-2 text-gray-900 ${styles.expiryDate}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
