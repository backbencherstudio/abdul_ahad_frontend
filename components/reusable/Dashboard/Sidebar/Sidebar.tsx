'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IoClose } from 'react-icons/io5';
// import logo from '@/public/logo/mainLogo.png';
import Image from 'next/image';
import {
    HiSearch,
    HiTruck,
    HiDocumentText,
    HiCalendar,
    HiBell,
    HiMail,
    HiCog
} from 'react-icons/hi';
import { HiArrowRightOnRectangle } from "react-icons/hi2";
import { toast } from 'react-toastify';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        email: string;
        role: string;
        avatar: string;
    };
}

export default function Sidebar({ onClose, user }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [

        // Driver
        { icon: HiSearch, label: 'Book My MOT', href: '/driver/book-my-mot', role: 'driver' },
        { icon: HiTruck, label: 'My Vehicles', href: '/driver/my-vehicles', role: 'driver' },
        // dynamic route
        { icon: HiDocumentText, label: 'MOT Reports', href: '/driver/mot-reports', role: 'driver' },
        { icon: HiCalendar, label: 'My Bookings', href: '/driver/my-bookings', role: 'driver' },
        { icon: HiBell, label: 'Notifications', href: '/driver/notifications', role: 'driver' },
        { icon: HiMail, label: 'Contact Us', href: '/driver/contact-us', role: 'driver' },


        // garage
        { icon: HiTruck, label: 'Garage Profile', href: '/garage/garage-profile', role: 'garage' },
        { icon: HiTruck, label: 'Pricing', href: '/garage/pricing', role: 'garage' },
    ];

    const handleLogout = () => {
        router.push('/login');
        toast.success('Logout successful');
    };

    return (
        <div className="w-64 h-screen bg-white flex flex-col">
            <div className="py-5 px-3 flex justify-between items-center mt-2">
                <div>
                    <h1 className='text-2xl font-bold text-[#19CA32]'>simplymot.co.uk</h1>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full cursor-pointer hover:bg-gray-100 md:hidden"
                >
                    <IoClose className="h-6 w-6" />
                </button>
            </div>

            <nav className="mt-4 flex-1 px-3">
                <ul className="space-y-3 ">
                    {menuItems
                        .filter(item => item.role === user.role)
                        .map((item) => {
                            const isActive = item.href === '/driver/book-my-mot'
                                ? pathname.startsWith('/driver/book-my-mot')
                                : pathname === item.href;
                            return (
                                <li key={item.href}>
                                    <Link href={item.href}>
                                        <span
                                            className={`flex items-center px-4 py-2 transition-colors duration-200
                                            ${isActive
                                                    ? 'bg-[#DDF7E0] text-[#19CA32] font-[400] rounded-[8px]'
                                                    : 'text-gray-800 hover:bg-gray-100 hover:text-gray-700 rounded-[8px]'
                                                }`}
                                        >
                                            <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white]' : ''}`} />
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                </ul>
            </nav>

            {/* role based alert */}
            {
                user.role === 'garage' && (
                    <div className="p-2">
                        <div className="bg-red-500 text-white px-6 py-6 rounded-lg space-y-2" role="alert">
                            <h1 className="font-bold text-md text-center font-Inter">Account not active</h1>
                            <p className="text-sm leading-relaxed text-center text-[#EDEDED]">
                                To activate your garage subscription and start receiving bookings, please proceed to the payment page.
                            </p>

                            <button className='bg-white text-red-500 px-2 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors duration-200 w-full cursor-pointer font-Inter text-sm'>
                                Activate Account
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Logout button */}
            <div className=" p-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center cursor-pointer w-full px-4 py-2 text-[#19CA32] hover:bg-[#19CA32] hover:text-white rounded-md transition-colors duration-300 group"
                >
                    <HiArrowRightOnRectangle className="h-5 w-5 mr-3 transition-transform duration-300 group-hover:translate-x-1" />
                    Logout
                </button>
            </div>
        </div >
    );
}
