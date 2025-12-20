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
import ReportCardShimmer from '@/app/(dashbaord)/_components/Driver/motReport/ReportCardShimmer'
import NoReportsMessage from '@/app/(dashbaord)/_components/Driver/motReport/NoReportsMessage'
import NoVehicleSelected from '@/app/(dashbaord)/_components/Driver/motReport/NoVehicleSelected'
import VehicleDetailsModal from '@/app/(dashbaord)/_components/Driver/motReport/VehicleDetailsModal'
import DownloadModal from '@/app/(dashbaord)/_components/Driver/motReport/DownloadModal'


// Main Component
export default function MotReports() {
    const router = useRouter()
    const params = useParams()

    // Get vehicle ID from URL
    const getVehicleIdFromURL = useCallback(() => {
        if (!params?.id) return null
        if (Array.isArray(params.id)) return params.id[0] || null
        return params.id || null
    }, [params])

    const vehicleIdFromURL = getVehicleIdFromURL()
    const { 
        vehicles, 
        motReports, 
        foundVehicle,
        isLoadingVehicles,
        isLoadingMotReports,
        vehiclesError,
        motReportsError
    } = useVehicleData(vehicleIdFromURL)

    // UI State
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('All Reports')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<MotReportWithVehicle | null>(null)

    // Download Modal State
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
    const [selectedReportForDownload, setSelectedReportForDownload] = useState<{ report: MOTReport; vehicle: Vehicle } | null>(null)

    // Handle URL navigation from other pages - Reset and set selected vehicle when URL changes
    useEffect(() => {
        if (vehicleIdFromURL) {
            // Always update selectedVehicleId when URL changes, even if vehicles are still loading
            if (selectedVehicleId !== vehicleIdFromURL) {
                setSelectedVehicleId(vehicleIdFromURL)
            }
            
            // If vehicles are loaded, verify the vehicle exists
            if (!isLoadingVehicles && vehicles.length > 0) {
                const foundVehicleInList = vehicles.find(v => 
                    v.apiVehicleId === vehicleIdFromURL
                )
                
                // If vehicle not found in list but we have foundVehicle from API, it's still valid
                if (!foundVehicleInList && !foundVehicle) {
                    console.warn('Vehicle not found in list:', vehicleIdFromURL)
                }
            }
        } else {
            // No vehicle ID in URL, reset selection
            if (selectedVehicleId) {
                setSelectedVehicleId(null)
            }
        }
    }, [vehicleIdFromURL, isLoadingVehicles, vehicles, selectedVehicleId, foundVehicle])

    // Show details when vehicle is selected
    useEffect(() => {
        if (selectedVehicleId) {
            if (!isLoadingVehicles && vehicles.length > 0) {
                // Find vehicle by matching API vehicle ID
                const foundVehicleInList = vehicles.find(v =>
                    v.apiVehicleId === selectedVehicleId
                )
                
                if (foundVehicleInList) {
                    // Show details immediately with initial data, update when detailed reports load
                    setIsLoadingDetails(false)
                    setShowDetails(true)
                } else {
                    // Vehicle might not be in list yet, but we still want to show loading state
                    // This can happen if the vehicle exists but hasn't been transformed yet
                    setIsLoadingDetails(true)
                    setShowDetails(true)
                }
            } else {
                // Still loading vehicles, show loading state
                setIsLoadingDetails(true)
                setShowDetails(true)
            }
        } else {
            // No vehicle selected, hide details
            setShowDetails(false)
            setIsLoadingDetails(false)
        }
    }, [selectedVehicleId, isLoadingVehicles, vehicles])

    // Event Handlers
    const handleVehicleClick = (vehicle: MotReportWithVehicle) => {
        if (vehicle.vehicleId) {
            // Set selected vehicle and navigate to its MOT reports using vehicle ID
            setSelectedVehicleId(vehicle.vehicleId)
            router.push(`/driver/mot-reports/${vehicle.vehicleId}`)
        } else if (vehicle.vehicleReg) {
            // Fallback: try to find vehicle ID from vehicles list
            const foundVehicle = vehicles.find(v => v.registrationNumber === vehicle.vehicleReg)
            if (foundVehicle?.apiVehicleId) {
                // Use the API vehicle ID to navigate
                setSelectedVehicleId(foundVehicle.apiVehicleId)
                router.push(`/driver/mot-reports/${foundVehicle.apiVehicleId}`)
            } else {
                // If we can't find the vehicle ID, show modal as fallback
                setSelectedVehicleForModal(vehicle)
                setIsModalOpen(true)
            }
        } else {
            // Fallback to modal if no ID or registration
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

    // Get selected vehicle - find by matching API vehicle ID
    // Use selectedVehicleId (from state) or vehicleIdFromURL (from URL) as fallback
    const vehicleIdToFind = selectedVehicleId || vehicleIdFromURL
    const selectedVehicle = vehicleIdToFind
        ? vehicles.find(v => v.apiVehicleId === vehicleIdToFind)
        : null

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
                            selectedVehicleId={selectedVehicleId}
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
                        {/* Show shimmer when loading MOT reports */}
                        {(isLoadingMotReports || isLoadingDetails) && showDetails && (
                            <div className="space-y-4 sm:space-y-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <ReportCardShimmer key={`shimmer-${index}`} />
                                ))}
                            </div>
                        )}

                        {/* Show actual reports when loaded */}
                        {!isLoadingMotReports && !isLoadingDetails && showDetails && selectedVehicle && (
                            <div className="space-y-4 sm:space-y-6">
                                {filteredReports.map((report) => (
                                    <ReportCard 
                                        key={report.id} 
                                        report={report} 
                                        vehicleData={selectedVehicle} 
                                        onDownloadClick={handleDownloadClick} 
                                    />
                                ))}
                                {filteredReports.length === 0 && !isLoadingMotReports && (
                                    <NoReportsMessage activeTab={activeTab} />
                                )}
                            </div>
                        )}

                        {/* Show message when no vehicle selected */}
                        {!isLoadingDetails && !showDetails && !isLoadingMotReports && <NoVehicleSelected />}
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
