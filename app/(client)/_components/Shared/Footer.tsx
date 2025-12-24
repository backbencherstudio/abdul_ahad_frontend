import React from 'react'
import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaWhatsapp, FaLinkedinIn, FaTiktok } from 'react-icons/fa'

export default function Footer() {
    const socialMedia = [
        {
            name: 'Facebook',
            icon: <FaFacebookF />,
            link: 'https://www.facebook.com/profile.php?id=61577620696056'
        },
        {
            name: 'Instagram',
            icon: <FaInstagram />,
            link: 'https://www.instagram.com/simplymot.co.uk?igsh=MXdkOWd3YnBoNXVpZA%3D%3D&utm_source=qr'
        },
        {
            name: 'Tiktok',
            icon: <FaTiktok />,
            link: 'https://www.tiktok.com/@simplymot.co.uk?_t=ZN-8zv8cvYmDiw&_r=1'
        },
        {
            name: 'LinkedIn',
            icon: <FaLinkedinIn />,
            link: 'https://www.linkedin.com/company/simplymot-co-uk'
        }
    ]

    const footerLinks = [
        { name: 'Contact Us', href: '/contact-us' },
        { name: 'Terms & Conditions for Customers', href: '/terms-drivers' },
        { name: 'Terms & Conditions for Garages', href: '/terms-garages' },
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Cookie Policy', href: '/cookies-policy' }
    ]

    return (
        <footer className="bg-[#19CA32] text-white py-8 px-4 sm:py-10 lg:py-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
                    <div className="w-full lg:flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                            {footerLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm sm:text-base hover:text-green-200 transition-colors duration-200 font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
                        <span className="text-sm font-medium lg:mr-2">Follow Us:</span>
                        <div className="flex space-x-3 sm:space-x-4">
                            {socialMedia.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 sm:w-10 sm:h-10 bg-transparent border border-white rounded-lg flex items-center justify-center hover:bg-white hover:text-[#19CA32] transition-all duration-300 hover:scale-105"
                                    aria-label={item.name}
                                >
                                    <span className="text-base sm:text-lg">
                                        {item.icon}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    )
}
