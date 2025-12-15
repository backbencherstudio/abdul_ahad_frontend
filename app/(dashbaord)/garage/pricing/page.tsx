'use client'

import React from 'react'
import MotFeeAdd from '../../_components/Garage/MotFeeAdd'
import AdditionalServicesAdd from '../../_components/Garage/AdditionalServicesAdd'
import { Button } from '@/components/ui/button'

export default function Pricing() {
    const handleGlobalSave = () => {
        const btn = document.getElementById('pricing-main-save') as HTMLButtonElement | null
        btn?.click()
    }

    return (
        <>
            <MotFeeAdd />
            <AdditionalServicesAdd />

            <div className="mb-10">
                <Button
                    type="button"
                    onClick={handleGlobalSave}
                    className="w-full h-10 bg-[#19CA32] cursor-pointer hover:bg-[#16b82e] text-white font-medium text-base"
                >
                    Save
                </Button>
            </div>
        </>
    )
}
