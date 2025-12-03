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
    vehicleReg?: string
    vehicleImage?: string
    vehicleMake?: string
    vehicleModel?: string
}

export type TabType = 'All Reports' | 'Pass' | 'Fail'

export const TABS: readonly TabType[] = ['All Reports', 'Pass', 'Fail'] as const
