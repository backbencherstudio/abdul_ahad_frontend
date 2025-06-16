import React from 'react'
import OverviewCard from '../../_components/Admin/OverviewCard'
import NewGarages from '../../_components/Admin/NewGarages'
import NewDrivers from '../../_components/Admin/NewDrivers'

export default function AdminDashboard() {
    return (
        <div className='space-y-5'>
            {/* overview card */}
            <OverviewCard />
            <NewGarages />
            <NewDrivers />
        </div>
    )
}
