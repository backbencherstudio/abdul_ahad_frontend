export interface MOTReport {
    id: number
    color: string
    fuelType: string
    registrationDate: string
    motTestNumber: string
    motPassDate: string
    motExpiryDate: string
    motStatus: 'Pass' | 'Fail'
}

export interface Vehicle {
    id: number
    apiVehicleId?: string // API vehicle ID (string format)
    registrationNumber: string
    expiryDate: string
    roadTax: string
    make: string
    model: string
    year?: number
    image: string
    motReport: MOTReport[]
}

export interface MotReportWithVehicle extends MOTReport {
    vehicleId?: string
    vehicleReg?: string
    vehicleImage?: string
    vehicleMake?: string
    vehicleModel?: string
}

export type TabType = 'View All'

export const TABS: readonly TabType[] = ['View All'] as const
