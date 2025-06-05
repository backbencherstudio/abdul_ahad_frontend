import React from 'react'
import HeroSectionReused from '../_components/Shared/HeroSectionReused'

const termsData = {
    lastUpdated: "May 2025",
    disclaimer: "By subscribing to and using the simplymot.co.uk platform, you agree to the following terms:",
    sections: [
        {
            id: 1,
            title: "Garage Eligibility and Responsibilities",
            content: [
                "You confirm that your garage is fully registered and authorised by the DVSA (Driver and Vehicle Standards Agency) to carry out MOT tests.",
                "You agree to provide MOT services in accordance with all applicable laws, regulations, and professional standards.",
                "You are responsible for the accuracy and completeness of the information provided on your garage profile.",
                "You agree to respond promptly to booking requests and notify customers of any cancellations or rescheduling."
            ]
        },
        {
            id: 2,
            title: "Subscription and Payment",
            content: [
                "Garages pay a monthly subscription fee to be listed and receive booking requests through simplymot.co.uk.",
                "Subscription fees are payable in advance and are non-refundable unless otherwise agreed in writing.",
                "simplymot.co.uk reserves the right to revise subscription fees periodically. Garages will be notified of any such changes in advance by email and/or postal mail.",
                "simplymot.co.uk does not take any commission on MOT service fees charged by the garage to customers."
            ]
        },
        {
            id: 3,
            title: "Booking Management",
            content: [
                "Booking confirmations, cancellations, and communication with customers are the responsibility of the garage.",
                "Garages must ensure that booked MOT services are provided as agreed.",
                "Garages may cancel bookings but must notify customers as soon as possible."
            ]
        },
        {
            id: 4,
            title: "Liability and Indemnity",
            content: [
                "simplymot.co.uk acts solely as a booking platform and is not responsible for the quality, safety, or legality of any MOT services provided by garages.",
                "The garage indemnifies simplymot.co.uk against any claims, damages, or losses arising from the garage's actions or omissions.",
                "Garages must comply with all relevant laws and standards."
            ]
        },
        {
            id: 5,
            title: "Suspension and Termination",
            content: [
                "simplymot.co.uk reserves the right to suspend or terminate a garage's access to the platform for breach of these terms or repeated customer complaints.",
                "Subscription fees paid prior to suspension or termination are non-refundable."
            ]
        },
        {
            id: 6,
            title: "Governing Law",
            content: [
                "These Terms are governed by the laws of England and Wales. Disputes shall be subject to the exclusive jurisdiction of the English courts."
            ]
        },
        {
            id: 7,
            title: "Contact Us",
            content: [
                "If you have any questions or concerns regarding these terms or your subscription, please contact us at:",
                "Email Address: info@simplymot.co.uk",
                "Website: https://www.simplymot.co.uk"
            ]
        }
    ]
}

export default function TermsDrivers() {
    return (
        <div>
            <HeroSectionReused title="Terms and Conditions for Garages" />

            {/* content section */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white  p-6">
                    <div className="mb-6">
                        <p className="text-md mb-4 font-medium">Last Updated: {termsData.lastUpdated}</p>
                        <p className="text-gray-700 mb-6">{termsData.disclaimer}</p>
                    </div>

                    {termsData.sections.map((section) => (
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
