'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import VehiclesCardReusble from '@/components/reusable/Dashboard/Driver/VehiclesCardReusble'
import { useVehicleData } from '../../../../../hooks/useVehicleData'
import { MOTReport, Vehicle, MotReportWithVehicle } from '../_types'
import ErrorDisplay from '@/app/(dashbaord)/_components/Driver/motReport/ErrorDisplay'
import LoadingSpinner from '@/app/(dashbaord)/_components/Driver/motReport/LoadingSpinner'
import ReportCard from '@/app/(dashbaord)/_components/Driver/motReport/ReportCard'
import ReportCardShimmer from '@/app/(dashbaord)/_components/Driver/motReport/ReportCardShimmer'
import NoReportsMessage from '@/app/(dashbaord)/_components/Driver/motReport/NoReportsMessage'
import NoVehicleSelected from '@/app/(dashbaord)/_components/Driver/motReport/NoVehicleSelected'
import VehicleDetailsModal from '@/app/(dashbaord)/_components/Driver/motReport/VehicleDetailsModal'
import DownloadModal from '@/app/(dashbaord)/_components/Driver/motReport/DownloadModal'
import { Button } from '@/components/ui/button'
import { RotateCw } from 'lucide-react'
import { useRefreshMotReportsMutation } from '@/rtk/api/driver/vehiclesApis'
import { toast } from 'react-toastify'


// Main Component
export default function MotReports() {
    const router = useRouter()
    const params = useParams()

    const getVehicleIdFromURL = useCallback(() => {
        if (!params?.id) return null
        if (Array.isArray(params.id)) return params.id[0] || null
        return params.id || null
    }, [params])

    const vehicleIdFromURL = getVehicleIdFromURL()

    // UI State
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const limit = 10
    // No status filtering - always show all reports
    const statusFilter = ''

    const {
        vehicles,
        motReports,
        foundVehicle,
        isLoadingVehicles,
        isLoadingMotReports,
        vehiclesError,
        motReportsError,
        hasMore
    } = useVehicleData(vehicleIdFromURL, currentPage, limit, statusFilter)

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
                setCurrentPage(1) // Reset pagination when vehicle changes
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
                setCurrentPage(1) // Reset pagination
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

    const handleLoadMore = () => {
        setCurrentPage(prev => prev + 1)
    }

    const [refreshMotReports] = useRefreshMotReportsMutation()

    const handleRefreshReports = async () => {
        const vehicleId = selectedVehicleId || vehicleIdFromURL
        if (!vehicleId) return

        try {
            setIsRefreshing(true)
            const res: any = await refreshMotReports(vehicleId).unwrap()

            const newRecords = res?.data?.new_records ?? 0
            const message = res?.message

            if (newRecords > 0) {
                toast.success(message || `${newRecords} new MOT record(s) found and synced.`)
            } else {
                toast.info(message || 'MOT history is already up to date.')
            }

            // After refresh, reset to first page so latest data is fetched
            setCurrentPage(1)
        } finally {
            setIsRefreshing(false)
        }
    }

    // Get selected vehicle - find by matching API vehicle ID
    // Use selectedVehicleId (from state) or vehicleIdFromURL (from URL) as fallback
    const vehicleIdToFind = selectedVehicleId || vehicleIdFromURL
    const selectedVehicle = vehicleIdToFind
        ? vehicles.find(v => v.apiVehicleId === vehicleIdToFind)
        : null

    // Reports are already filtered by API, so use them directly
    const filteredReports = selectedVehicle?.motReport || []

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

                    {/* Header + Refresh Button */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                        {/* title */}
                        <h2 className="text-lg sm:text-xl font-bold">MOT Reports</h2>
                        <div className="flex items-center gap-2">
                            {showDetails && selectedVehicle && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefreshReports}
                                    disabled={isRefreshing || isLoadingMotReports}
                                    className="flex items-center gap-1 cursor-pointer"
                                >
                                    <RotateCw
                                        className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                    />
                                    <span className="hidden sm:inline">
                                        {isRefreshing ? 'Refreshing...' : 'Reload'}
                                    </span>
                                </Button>
                            )}
                            {/* Header tabs removed - only showing "View All" option */}

                        </div>
                    </div>

                    {/* Details Section */}
                    <div>
                        {/* Show shimmer when loading or refreshing MOT reports */}
                        {(isLoadingMotReports || isLoadingDetails || isRefreshing) && showDetails && (
                            <div className="space-y-4 sm:space-y-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <ReportCardShimmer key={`shimmer-${index}`} />
                                ))}
                            </div>
                        )}

                        {/* Show actual reports when loaded */}
                        {!isLoadingMotReports && !isLoadingDetails && !isRefreshing && showDetails && selectedVehicle && (
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
                                    <NoReportsMessage />
                                )}

                                {/* Load More Button */}
                                {hasMore && filteredReports.length > 0 && (
                                    <div className="flex justify-center mt-6">
                                        <Button
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMotReports}
                                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md cursor-pointer"
                                        >
                                            {isLoadingMotReports ? 'Loading...' : 'More'}
                                        </Button>
                                    </div>
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
