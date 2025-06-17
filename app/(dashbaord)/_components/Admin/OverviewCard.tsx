import React from 'react'

export default function OverviewCard() {
    const data = [
        {
            title: 'Total Garages',
            value: 0,
        },
        {
            title: 'Total Drivers',
            value: 0,
        },
        {
            title: 'Total Bookings',
            value: 0,
        }
    ]
    return (
        <>
            <h1 className='text-2xl font-semibold mb-5'>Overview</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {data.map((item, index) => (
                    <div key={index} className='bg-white px-6 py-10 rounded-lg shadow-sm flex flex-col gap-3'>
                        <h3 className='text-md '>{item.title}</h3>
                        <p className='text-2xl font-bold'>{item.value}</p>
                    </div>
                ))}
            </div>
        </>
    )
}
