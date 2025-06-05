import React from 'react';
import Navbar from './_components/Shared/Navbar';
import Footer from './_components/Shared/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow">
                {children}
            </div>
            <Footer />
        </div>
    );
}
