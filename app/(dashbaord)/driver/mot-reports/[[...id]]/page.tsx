'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import VehiclesCardReusble from '@/components/reusable/Dashboard/Driver/VehiclesCardReusble'
import { useVehicleData } from '../../../../../hooks/useVehicleData'
import { TabType, TABS, MOTReport, Vehicle, MotReportWithVehicle } from '../_types'
import ErrorDisplay from '@/app/(dashbaord)/_components/Driver/motReport/ErrorDisplay'
import Header from '@/app/(dashbaord)/_components/Driver/motReport/Header'
import LoadingSpinner from '@/app/(dashbaord)/_components/Driver/motReport/LoadingSpinner'
import ReportCard from '@/app/(dashbaord)/_components/Driver/motReport/ReportCard'
import NoReportsMessage from '@/app/(dashbaord)/_components/Driver/motReport/NoReportsMessage'
import NoVehicleSelected from '@/app/(dashbaord)/_components/Driver/motReport/NoVehicleSelected'
import VehicleDetailsModal from '@/app/(dashbaord)/_components/Driver/motReport/VehicleDetailsModal'
import DownloadModal from '@/app/(dashbaord)/_components/Driver/motReport/DownloadModal'


// Main Component
export default function MotReports() {
    const router = useRouter()
    const params = useParams()

    // Get registration from URL
    const getRegistrationFromURL = useCallback(() => {
        if (!params?.id) return null
        if (Array.isArray(params.id)) return params.id[0] || null
        return params.id || null
    }, [params])

    const regFromURL = getRegistrationFromURL()
    const { 
        vehicles, 
        motReports, 
        foundVehicle,
        isLoadingVehicles,
        isLoadingMotReports,
        vehiclesError,
        motReportsError
    } = useVehicleData(regFromURL)

    // UI State
    const [selectedVehicleReg, setSelectedVehicleReg] = useState<string | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('All Reports')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<MotReportWithVehicle | null>(null)

    // Download Modal State
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
    const [selectedReportForDownload, setSelectedReportForDownload] = useState<{ report: MOTReport; vehicle: Vehicle } | null>(null)

    // Handle URL navigation from other pages
    useEffect(() => {
        if (isLoadingVehicles || vehicles.length === 0) return

        if (regFromURL && !selectedVehicleReg) {
            const foundVehicleInList = vehicles.find(v =>
                v.registrationNumber.toLowerCase() === regFromURL.toLowerCase()
            )

            if (foundVehicleInList) {
                setSelectedVehicleReg(regFromURL)
            }
        }
    }, [isLoadingVehicles, vehicles, regFromURL, selectedVehicleReg])

    // Show details when vehicle is selected
    useEffect(() => {
        if (selectedVehicleReg && !isLoadingVehicles && vehicles.length > 0) {
            const foundVehicleInList = vehicles.find(v =>
                v.registrationNumber.toLowerCase() === selectedVehicleReg.toLowerCase()
            )
            
            if (foundVehicleInList) {
                // Show details immediately with initial data, update when detailed reports load
                setIsLoadingDetails(false)
                setShowDetails(true)
            } else {
                // Vehicle might not be in list yet, but we still want to show loading state
                setIsLoadingDetails(true)
                setShowDetails(true)
            }
        } else if (!selectedVehicleReg) {
            // No vehicle selected, hide details
            setShowDetails(false)
            setIsLoadingDetails(false)
        }
    }, [selectedVehicleReg, isLoadingVehicles, vehicles])

    // Event Handlers
    const handleVehicleClick = (vehicle: MotReportWithVehicle) => {
        if (vehicle.vehicleReg) {
            // Set selected vehicle and navigate to its MOT reports
            setSelectedVehicleReg(vehicle.vehicleReg)
            router.push(`/driver/mot-reports/${vehicle.vehicleReg}`)
        } else {
            // Fallback to modal if no registration
            setSelectedVehicleForModal(vehicle)
            setIsModalOpen(true)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedVehicleForModal(null)
    }

    const handleDownloadClick = (report: MOTReport, vehicle: Vehicle) => {
        setSelectedReportForDownload({ report, vehicle })
        setIsDownloadModalOpen(true)
    }

    const handleCloseDownloadModal = () => {
        setIsDownloadModalOpen(false)
        setSelectedReportForDownload(null)
    }

    // Get selected vehicle
    const selectedVehicle = vehicles.find(v => v.registrationNumber === selectedVehicleReg)

    // Filter reports based on tab
    const filteredReports = selectedVehicle?.motReport?.filter(report => {
        if (activeTab === 'Pass') return report.motStatus === 'Pass'
        if (activeTab === 'Fail') return report.motStatus === 'Fail'
        return true
    }) || []

    // Error message
    const errorMessage = vehiclesError && 'data' in vehiclesError 
        ? (vehiclesError.data as any)?.message 
        : motReportsError && 'data' in motReportsError
        ? (motReportsError.data as any)?.message
        : vehiclesError ? 'Failed to load vehicles' 
        : motReportsError ? 'Failed to load MOT reports'
        : null

    return (
        <div className="w-full mx-auto">
            <ErrorDisplay error={errorMessage} />

            {!vehiclesError && (
                <>
                    {/* Vehicle Cards */}
                    <div className="mb-4 sm:mb-6">
                        <VehiclesCardReusble
                            motReports={motReports}
                            onVehicleClick={handleVehicleClick}
                            selectedRegistration={selectedVehicleReg}
                            isLoading={isLoadingVehicles}
                        />
                    </div>

                    {/* Header */}
                    <Header
                        showTabs={showDetails && !!selectedVehicle}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tabs={TABS}
                    />

                    {/* Details Section */}
                    <div>
                        {isLoadingDetails && (
                            <LoadingSpinner message="Loading vehicle details..." />
                        )}

                        {!isLoadingDetails && showDetails && selectedVehicle && (
                            <div className="space-y-4 sm:space-y-6">
                                {filteredReports.map((report) => (
                                    <ReportCard 
                                        key={report.id} 
                                        report={report} 
                                        vehicleData={selectedVehicle} 
                                        onDownloadClick={handleDownloadClick} 
                                    />
                                ))}
                                {filteredReports.length === 0 && (
                                    <NoReportsMessage activeTab={activeTab} />
                                )}
                            </div>
                        )}

                        {!isLoadingDetails && !showDetails && <NoVehicleSelected />}
                    </div>
                </>
            )}

            {/* Modals */}
            <VehicleDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                vehicle={selectedVehicleForModal}
            />

            <DownloadModal
                isOpen={isDownloadModalOpen}
                onClose={handleCloseDownloadModal}
                report={selectedReportForDownload?.report || null}
                vehicle={selectedReportForDownload?.vehicle || null}
            />
        </div>
    )
}
