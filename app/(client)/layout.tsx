import React from 'react'
import Navbar from './_components/Navbar/Navbar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <div className='w-full h-full'>
                {children}
            </div>
        </>
    )
}
