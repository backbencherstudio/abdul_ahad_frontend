'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Download, Printer, Car, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import VehiclesCardReusble from '@/components/reusable/Dashboard/Driver/VehiclesCardReusble'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import Link from 'next/link'

// Types
interface MOTReport {
    id: number
    color: string
    fuelType: string
    registrationDate: string
    motTestNumber: string
    motPassDate: string
    motExpiryDate: string
    motStatus: 'Pass' | 'Fail'
}

interface Vehicle {
    id: number
    registrationNumber: string
    expiryDate: string
    roadTax: string
    make: string
    model: string
    year?: number
    image: string
    motReport: MOTReport[]
}

interface MotReportWithVehicle extends MOTReport {
    vehicleReg?: string
    vehicleImage?: string
    vehicleMake?: string
    vehicleModel?: string
}

type TabType = 'All Reports' | 'Pass' | 'Fail'

// Constants
const TABS: readonly TabType[] = ['All Reports', 'Pass', 'Fail']
const BRAND_COLOR = '#19CA32'

// Utility Functions
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

const getStatusStyles = (status: 'Pass' | 'Fail') => ({
    badge: status === 'Pass' ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
    passDate: status === 'Pass' ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300',
    expiryDate: status === 'Fail' ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'
})

// Loading Component
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
    <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#19CA32]" />
            <div className="text-lg text-gray-600">{message}</div>
        </div>
    </div>
)

// No Vehicle Selected State
const NoVehicleSelected = () => (
    <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-12 h-12 text-gray-400" />
            </div>
            <div className="text-xl font-semibold text-gray-900 mb-3">No Vehicle Selected</div>
            <p className="text-gray-600 mb-6">
                Click on a vehicle card above and then click "MOT Reports" to view details.
            </p>
        </div>
    </div>
)

// Header Component
const Header = ({ showTabs = false, activeTab, onTabChange, tabs }: {
    onBack: () => void
    showTabs?: boolean
    activeTab?: TabType
    onTabChange?: (tab: TabType) => void
    tabs?: readonly TabType[]
}) => (
    <div className="flex items-center justify-between mb-6">
        <div >
            <h1 className="text-2xl font-bold text-gray-900">MOT Reports</h1>
        </div>

        {showTabs && tabs && activeTab && onTabChange && (
            <div className="bg-gray-100 p-1 rounded-full flex items-center gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-full cursor-pointer transition-all duration-200 ${activeTab === tab
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        )}
    </div>
)

// Report Field Component
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

// Report Card Component
const ReportCard = ({ report, vehicleData }: { report: MOTReport; vehicleData: Vehicle }) => {
    const styles = getStatusStyles(report.motStatus)

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-gray-900">
                            {vehicleData.make.toUpperCase()} {vehicleData.model.toUpperCase()}
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${styles.badge}`}>
                            {report.motStatus}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1 px-3 py-1">
                            <Printer className="w-3 h-3" />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-[#19CA32] hover:bg-[#16b82e] text-white px-3 py-1 flex items-center gap-1"
                        >
                            <Download className="w-3 h-3" />
                            Download Reports
                        </Button>
                    </div>
                </div>
                <div className="mt-2">
                    <div className="bg-gray-900 text-white px-3 py-1 rounded text-sm font-bold inline-block">
                        {vehicleData.registrationNumber}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <ReportField label="Colour" value={report.color} />
                        <ReportField label="MOT test number" value={report.motTestNumber} />
                    </div>
                    <div className="space-y-4">
                        <ReportField label="Fuel type" value={report.fuelType} />
                        <ReportField
                            label="MOT Pass Date"
                            value={formatDate(report.motPassDate)}
                            className={`border-2 text-gray-900 ${styles.passDate}`}
                        />
                    </div>
                    <div className="space-y-4">
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

// No Reports Message
const NoReportsMessage = ({ activeTab }: { activeTab: TabType }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">No {activeTab.toLowerCase()} reports found</div>
        <p className="text-gray-600">There are no MOT reports available for the selected filter.</p>
    </div>
)

// Main Component
export default function MotReports() {
    const router = useRouter()
    const params = useParams()


    // Data State
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [motReports, setMotReports] = useState<MotReportWithVehicle[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // UI State
    const [selectedVehicleReg, setSelectedVehicleReg] = useState<string | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('All Reports')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<MotReportWithVehicle | null>(null)

    // Get registration from URL
    const getRegistrationFromURL = useCallback(() => {
        if (!params?.id) return null
        if (Array.isArray(params.id)) return params.id[0] || null
        return params.id || null
    }, [params])

    // Fetch data once
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoadingData(true)
        setError(null)

        try {
            const response = await fetch('/data/vehicle.json')
            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)

            const vehicleData: Vehicle[] = await response.json()

            // Process data for cards
            const processedReports: MotReportWithVehicle[] = []
            vehicleData.forEach(vehicle => {
                if (vehicle.motReport && vehicle.motReport.length > 0) {
                    const latestReport = vehicle.motReport[vehicle.motReport.length - 1]
                    processedReports.push({
                        ...latestReport,
                        vehicleReg: vehicle.registrationNumber,
                        vehicleImage: vehicle.image,
                        vehicleMake: vehicle.make,
                        vehicleModel: vehicle.model
                    })
                }
            })
            setVehicles(vehicleData)
            setMotReports(processedReports)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoadingData(false)
        }
    }

    // Handle URL navigation from other pages
    useEffect(() => {
        if (isLoadingData || vehicles.length === 0) return

        const regFromURL = getRegistrationFromURL()

        if (regFromURL) {
            const foundVehicle = vehicles.find(v =>
                v.registrationNumber.toLowerCase() === regFromURL.toLowerCase()
            )

            if (foundVehicle) {
                setSelectedVehicleReg(regFromURL)
                autoShowDetails(regFromURL)
            }
        }
    }, [isLoadingData, vehicles, getRegistrationFromURL])

    // Auto show details when coming from URL
    const autoShowDetails = async (registrationNumber: string) => {
        setIsLoadingDetails(true)
        setShowDetails(false)

        await new Promise(resolve => setTimeout(resolve, 800))

        setIsLoadingDetails(false)
        setShowDetails(true)
    }

    // Event Handlers
    const handleGoBack = () => {
        router.push('/driver/my-vehicles')
    }

    const handleVehicleClick = (vehicle: MotReportWithVehicle) => {
        setSelectedVehicleForModal(vehicle)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedVehicleForModal(null)
    }

    // Get selected vehicle
    const selectedVehicle = vehicles.find(v => v.registrationNumber === selectedVehicleReg)

    // Filter reports based on tab
    const filteredReports = selectedVehicle?.motReport?.filter(report => {
        if (activeTab === 'Pass') return report.motStatus === 'Pass'
        if (activeTab === 'Fail') return report.motStatus === 'Fail'
        return true
    }) || []

    return (
        <div className="p-6 mx-auto">
            {/* Error */}
            {error && (
                <div className="bg-white rounded-md shadow-sm p-6 text-center">
                    <div className="text-red-500 text-lg mb-2">Error</div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={fetchData} className="bg-[#19CA32] hover:bg-[#16b82e] text-white">
                        Try Again
                    </Button>
                </div>
            )}

            {/* Main Content - Always show cards */}
            {!error && (
                <>
                    {/* Vehicle Cards - Always visible */}
                    <div className="mb-6">
                        <VehiclesCardReusble
                            motReports={motReports}
                            onVehicleClick={handleVehicleClick}
                            selectedRegistration={selectedVehicleReg}
                        />
                    </div>

                    {/* Header - Below Cards */}
                    <Header
                        onBack={handleGoBack}
                        showTabs={showDetails && !!selectedVehicle}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tabs={TABS}
                    />

                    {/* Details Section */}
                    <div>
                        {isLoadingDetails && <LoadingSpinner message="Loading vehicle details..." />}

                        {!isLoadingDetails && showDetails && selectedVehicle && (
                            <div className="space-y-6">
                                {filteredReports.map((report) => (
                                    <ReportCard key={report.id} report={report} vehicleData={selectedVehicle} />
                                ))}
                                {filteredReports.length === 0 && <NoReportsMessage activeTab={activeTab} />}
                            </div>
                        )}

                        {!isLoadingDetails && !showDetails && <NoVehicleSelected />}
                    </div>
                </>
            )}

            {/* Modal */}
            <CustomReusableModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedVehicleForModal ? `MOT Details for ${selectedVehicleForModal.vehicleReg}` : "MOT Details"}
                showHeader={false}
                className="max-w-sm"
            >
                {selectedVehicleForModal && (
                    <div className="bg-white rounded-lg overflow-hidden">
                        <div className={`bg-[${BRAND_COLOR}] text-white p-4 text-center`}>
                            <h2 className="text-lg font-semibold">MOT check</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">MOT</span>
                                <span className="text-sm text-gray-600">
                                    Expired {formatDate(selectedVehicleForModal.motExpiryDate)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Road Tax</span>
                                <span className="text-sm text-gray-600">
                                    Expired {formatDate(selectedVehicleForModal.motExpiryDate)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Model variant</span>
                                <span className="text-sm text-gray-600">
                                    {selectedVehicleForModal.vehicleMake} {selectedVehicleForModal.vehicleModel}
                                </span>
                            </div>

                            <Link
                                href={`/driver/mot-reports/${selectedVehicleForModal.vehicleReg}`}
                                className={`w-full bg-[${BRAND_COLOR}] hover:bg-[#16b82e] text-white font-medium py-2 mt-6 rounded-lg block text-center`}
                            >
                                MOT Reports
                            </Link>
                        </div>
                    </div>
                )}
            </CustomReusableModal>
        </div>
    )
}
