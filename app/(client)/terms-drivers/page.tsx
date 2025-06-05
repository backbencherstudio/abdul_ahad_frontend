import React from 'react'
import HeroSectionReused from '../_components/Shared/HeroSectionReused'

const driverTermsData = {
    lastUpdated: "May 2025",
    disclaimer: "Welcome to simplymot.co.uk! By accessing or using our website, you agree to the following Terms and Conditions. If you have any concerns or do not agree with these terms, we kindly ask that you refrain from using our services.",
    sections: [
        {
            id: 1,
            title: "About Us",
            content: [
                "simplymot.co.uk (referred to as \"us\" or \"our\") is an online booking platform operated in the UK under the name simplymot.co.uk. We connect vehicle owners (\"users\") with local garages for the purpose of booking MOT tests. We provide a booking service, but we do not perform MOT tests or any other vehicle-related services ourselves."
            ]
        },
        {
            id: 2,
            title: "Use of the Website",
            content: [
                "You must be at least 17 years old and legally permitted to drive a vehicle in the UK to use this site.",
                "You agree to provide accurate and current information when creating an account or booking a service.",
                "You are responsible for maintaining the confidentiality of your account and login credentials."
            ]
        },
        {
            id: 3,
            title: "Our Role",
            content: [
                "simplymot.co.uk is a booking facilitator. We do not own or operate any garages.",
                "We do not charge drivers for bookings. Garages pay us a monthly subscription to be listed and receive bookings.",
                "Payment for MOT services is made directly to the garage. We are not involved in the financial transaction between drivers and garages."
            ]
        },
        {
            id: 4,
            title: "Bookings and Cancellations (Drivers)",
            content: [
                "Bookings made via simplymot.co.uk are subject to confirmation by the garage.",
                "Garages reserve the right to cancel or reschedule a booking at any time.",
                "simplymot.co.uk is not responsible for cancellations, delays, or the performance of any service provided by a garage."
            ]
        },
        {
            id: 5,
            title: "Limitation of Liability",
            content: [
                "simplymot.co.uk accepts no responsibility or liability for:",
                "• Loss or damage resulting from the use of our website or services",
                "• Any disputes between users and garages",
                "• Our total liability to you shall not exceed any amount paid by you to us (typically £0 for drivers)."
            ]
        },
        {
            id: 6,
            title: "Data Protection and Privacy",
            content: [
                "We collect and process your personal information in accordance with our Privacy Policy."
            ]
        },
        {
            id: 7,
            title: "Marketing and Communication",
            content: [
                "By using our website, you agree to receive service-related communications and optional marketing emails. You can opt out of marketing at any time."
            ]
        },
        {
            id: 8,
            title: "Intellectual Property",
            content: [
                "All website content (text, graphics, logos, software) is owned by or licensed to simplymot.co.uk. You may not copy, reproduce, or use our content without permission."
            ]
        },
        {
            id: 9,
            title: "Third Party Links",
            content: [
                "Our website may contain links to external websites. We are not responsible for the content or practices of those sites."
            ]
        },
        {
            id: 10,
            title: "Changes to Terms",
            content: [
                "We may revise these Terms and Conditions from time to time. Continued use of the website indicates acceptance of any updated terms."
            ]
        },
        {
            id: 11,
            title: "Governing Law",
            content: [
                "These Terms are governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the English courts."
            ]
        },
        {
            id: 12,
            title: "User Responsibility",
            content: [
                "simplymot.co.uk only lists garages that are officially registered with the DVSA (Driver and Vehicle Standards Agency), ensuring they meet required MOT testing standards.",
                "While this registration verifies garages' legal qualifications, simplymot.co.uk does not guarantee or endorse the quality, customer service, or performance of any garage listed.",
                "It remains the responsibility of the user (driver) to assess the suitability and trustworthiness of a garage before proceeding with a booking.",
                "We recommend users carry out additional checks such as reading customer reviews or confirming garage reputation before booking."
            ]
        },
        {
            id: 13,
            title: "Contact Us",
            content: [
                "If you have any questions or concerns, please contact us at:",
                "Email Address:",
                "info@simplymot.co.uk",
                "Website:",
                "https://www.simplymot.co.uk"
            ]
        }
    ]
}

export default function TermsDrivers() {
    return (
        <div>
            <HeroSectionReused title="Terms and Conditions for Drivers" />

            {/* content section */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className=" p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-4">Last Updated: {driverTermsData.lastUpdated}</p>
                        <p className="text-gray-700 mb-6">{driverTermsData.disclaimer}</p>
                    </div>

                    {driverTermsData.sections.map((section) => (
                        <div key={section.id} className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                {section.id}. {section.title}
                            </h2>
                            <div className="space-y-3">
                                {section.content.map((paragraph, index) => (
                                    <p key={index} className="text-gray-700 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
