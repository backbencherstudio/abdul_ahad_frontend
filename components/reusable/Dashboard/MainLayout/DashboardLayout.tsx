'use client'

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
interface LayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Dynamic user role detection based on URL
    const getUserRole = () => {
        if (pathname.startsWith('/garage')) {
            return 'garage';
        } else if (pathname.startsWith('/driver')) {
            return 'driver';
        } else if (pathname.startsWith('/admin')) {
            return 'admin';
        }
        return 'driver'; // default
    };

    // Dynamic user data based on role
    const getUserData = () => {
        const role = getUserRole();

        if (role === 'garage') {
            return {
                name: 'Garage Owner',
                email: 'garage@example.com',
                role: 'garage',
                avatar: '/api/placeholder/32/32'
            };
        } else if (role === 'driver') {
            return {
                name: 'Driver User',
                email: 'driver@example.com',
                role: 'driver',
                avatar: '/api/placeholder/32/32'
            };
        } else if (role === 'admin') {
            return {
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                avatar: '/api/placeholder/32/32'
            };
        }
    };

    const user = getUserData();

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 md:static md:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={toggleSidebar} user={user} />

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#ECEFF3] p-4">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
