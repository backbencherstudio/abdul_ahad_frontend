import React from 'react'
import Navbar from './_components/Shared/Navbar'
import Footer from './_components/Shared/Footer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <div >
                {children}
            </div>
            <Footer />
        </>
    )
}
