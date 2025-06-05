import React from 'react'
import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa'

export default function Footer() {
    const socialMedia = [
        {
            name: 'Facebook',
            icon: <FaFacebookF />,
            link: 'https://facebook.com'
        },
        {
            name: 'Instagram',
            icon: <FaInstagram />,
            link: 'https://instagram.com'
        },
        {
            name: 'WhatsApp',
            icon: <FaWhatsapp />,
            link: 'https://wa.me/1234567890'
        },
        {
            name: 'LinkedIn',
            icon: <FaLinkedinIn />,
            link: 'https://linkedin.com'
        }
    ]

    return (
        <footer className="bg-[#19CA32] text-white py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    {/* Footer Links */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-8 text-sm">
                        <Link href="/contact" className="hover:text-green-200 transition-colors">
                            Contact Us
                        </Link>
                        <Link href="/terms-drivers" className="hover:text-green-200 transition-colors">
                            Terms & Conditions for Drivers
                        </Link>
                        <Link href="/terms-garages" className="hover:text-green-200 transition-colors">
                            Terms & Conditions for Garages
                        </Link>
                        <Link href="/privacy" className="hover:text-green-200 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/cookies" className="hover:text-green-200 transition-colors">
                            Cookie Policy
                        </Link>
                    </div>

                    {/* Social Media Icons */}
                    <div className="flex space-x-3">
                        {socialMedia.map((item) => (
                            <Link
                                key={item.name}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-transparent border border-white rounded flex items-center justify-center hover:bg-opacity-30 transition-all"
                                aria-label={item.name}
                            >
                                {item.icon}
                            </Link>
                        ))}

                    </div>
                </div>

            </div>
        </footer>
    )
}
