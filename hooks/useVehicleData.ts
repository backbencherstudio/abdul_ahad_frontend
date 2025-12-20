import { useState, useEffect, useMemo } from 'react'
import { useGetVehiclesQuery, useGetVehicleMotReportsQuery, ApiVehicle, MotTest } from '@/rtk/api/driver/vehiclesApis'
import { getBrandLogo } from '@/helper/vehicle.helper'
import { Vehicle, MOTReport, MotReportWithVehicle } from '../app/(dashbaord)/driver/mot-reports/_types'

export const useVehicleData = (regFromURL: string | null) => {
    const { data: vehiclesResponse, isLoading: isLoadingVehicles, error: vehiclesError } = useGetVehiclesQuery()
    
    const foundVehicle = useMemo(() => {
        if (!vehiclesResponse?.data || !regFromURL) return null
        return vehiclesResponse.data.find(v => 
            v.registration_number.toLowerCase() === regFromURL.toLowerCase()
        )
    }, [vehiclesResponse?.data, regFromURL])
    
    const { data: motReportsData, isLoading: isLoadingMotReports, error: motReportsError } = useGetVehicleMotReportsQuery(
        foundVehicle?.id || '',
        { skip: !foundVehicle?.id }
    )

    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [motReports, setMotReports] = useState<MotReportWithVehicle[]>([])

    const transformApiVehicle = (apiVehicle: ApiVehicle): Vehicle => {
        let roadTax = 'N/A'
        try {
            const dvlaData = JSON.parse(apiVehicle.dvla_data || '{}')
            roadTax = dvlaData.taxDueDate || apiVehicle.mot_expiry_date || 'N/A'
        } catch (e) {
            roadTax = apiVehicle.mot_expiry_date || 'N/A'
        }

        const imageUrl = getBrandLogo(apiVehicle.make)
        
        const motReportArray: MOTReport[] = []
        try {
            const motData = JSON.parse(apiVehicle.mot_data || '{}')
            if (motData.motTests && Array.isArray(motData.motTests)) {
                motData.motTests.forEach((test: MotTest) => {
                    motReportArray.push({
                        id: parseInt(test.motTestNumber) || Date.now(),
                        color: motData.primaryColour || apiVehicle.color,
                        fuelType: motData.fuelType || apiVehicle.fuel_type,
                        registrationDate: motData.registrationDate || motData.firstUsedDate || '',
                        motTestNumber: test.motTestNumber,
                        motPassDate: test.completedDate,
                        motExpiryDate: test.expiryDate || '',
                        motStatus: test.testResult === 'PASSED' ? 'Pass' : 'Fail'
                    })
                })
            }
        } catch (e) {
            console.error('Error transforming mot tests:', e)
        }

        return {
            id: parseInt(apiVehicle.id) || Date.now(),
            registrationNumber: apiVehicle.registration_number,
            expiryDate: apiVehicle.mot_expiry_date || '',
            roadTax: roadTax,
            make: apiVehicle.make,
            model: apiVehicle.model,
            year: apiVehicle.year_of_manufacture,
            image: imageUrl,
            motReport: motReportArray
        }
    }

    useEffect(() => {
        if (vehiclesResponse?.data) {
            const transformedVehicles = vehiclesResponse.data.map(transformApiVehicle)
            setVehicles(transformedVehicles)

            // Create motReports entries for ALL vehicles, not just those with MOT reports
            const processedReports: MotReportWithVehicle[] = []
            transformedVehicles.forEach(vehicle => {
                if (vehicle.motReport && vehicle.motReport.length > 0) {
                    // If vehicle has MOT reports, use the latest one
                    const latestReport = vehicle.motReport[0]
                    processedReports.push({
                        ...latestReport,
                        vehicleReg: vehicle.registrationNumber,
                        vehicleImage: vehicle.image,
                        vehicleMake: vehicle.make,
                        vehicleModel: vehicle.model
                    })
                } else {
                    // If vehicle has no MOT reports, create a placeholder entry so it still shows in the list
                    processedReports.push({
                        id: vehicle.id,
                        color: '',
                        fuelType: '',
                        registrationDate: '',
                        motTestNumber: '',
                        motPassDate: '',
                        motExpiryDate: vehicle.expiryDate || '',
                        motStatus: 'Pass' as const,
                        vehicleReg: vehicle.registrationNumber,
                        vehicleImage: vehicle.image,
                        vehicleMake: vehicle.make,
                        vehicleModel: vehicle.model
                    })
                }
            })
            setMotReports(processedReports)
        }
    }, [vehiclesResponse])

    useEffect(() => {
        if (motReportsData && foundVehicle && vehicles.length > 0) {
            const transformedReports: MOTReport[] = motReportsData.motTests.map((test: MotTest) => ({
                id: parseInt(test.motTestNumber) || Date.now(),
                color: motReportsData.primaryColour || foundVehicle.color,
                fuelType: motReportsData.fuelType || foundVehicle.fuel_type,
                registrationDate: motReportsData.registrationDate || motReportsData.firstUsedDate || '',
                motTestNumber: test.motTestNumber,
                motPassDate: test.completedDate,
                motExpiryDate: test.expiryDate || '',
                motStatus: test.testResult === 'PASSED' ? 'Pass' : 'Fail'
            }))

            setVehicles(prevVehicles => {
                const updatedVehicles = prevVehicles.map(vehicle => {
                    if (vehicle.registrationNumber === foundVehicle.registration_number) {
                        return {
                            ...vehicle,
                            motReport: transformedReports
                        }
                    }
                    return vehicle
                })
                return updatedVehicles
            })
        }
    }, [motReportsData, foundVehicle])

    return {
        vehicles,
        motReports,
        foundVehicle,
        isLoadingVehicles,
        isLoadingMotReports,
        vehiclesError,
        motReportsError
    }
}
