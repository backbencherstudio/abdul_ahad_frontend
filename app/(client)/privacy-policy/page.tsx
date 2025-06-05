import React from 'react'
import HeroSectionReused from '../_components/Shared/HeroSectionReused'

const privacyPolicyData = {
    lastUpdated: "May 2025",
    disclaimer: "simplymot.co.uk (\"we\", \"us\", or \"our\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you use our website and services.",
    sections: [
        {
            id: 1,
            title: "Information We Collect",
            content: [
                "From Drivers:",
                "• Name",
                "• Email address",
                "• Phone number",
                "• Postal address",
                "• Vehicle details (make, model, registration)",
                "• MOT expiry date",
                "",
                "From Garages:",
                "• Garage name and contact details",
                "• Profile information necessary to provide booking services",
                "• Automatically collected:",
                "• Cookies and similar tracking technologies",
                "• IP address, browser type, device type, and pages visited"
            ]
        },
        {
            id: 2,
            title: "How We Use Your Information",
            content: [
                "We use your information to:",
                "• Process and manage MOT booking requests",
                "• Communicate confirmations, updates, and service-related information",
                "• Improve and personalise the website and our services",
                "• Send marketing communications (with your consent)",
                "• Comply with legal and regulatory requirements"
            ]
        },
        {
            id: 3,
            title: "Legal Basis for Processing",
            content: [
                "We process your data under one or more of the following legal bases:",
                "• Your consent",
                "• To fulfil a contract with you (e.g., bookings)",
                "• Compliance with legal obligations",
                "• Legitimate interests, such as improving our platform"
            ]
        },
        {
            id: 4,
            title: "Sharing Your Information",
            content: [
                "We share necessary driver information with garages to facilitate bookings.",
                "We may use trusted third-party service providers for website and communication support.",
                "We do not sell your personal data.",
                "We may disclose information if required by law."
            ]
        },
        {
            id: 5,
            title: "Cookies",
            content: [
                "We use cookies to enhance your browsing experience and gather website usage analytics. You can manage or disable cookies in your browser settings."
            ]
        },
        {
            id: 6,
            title: "Your Rights",
            content: [
                "You have the right to:",
                "• Access your personal data",
                "• Correct inaccurate information",
                "• Request data deletion (where applicable)",
                "• Object to or limit data processing",
                "• Withdraw consent (e.g., for marketing)",
                "• Request data portability",
                "• To exercise any of these rights, please contact us (see Section 11)."
            ]
        },
        {
            id: 7,
            title: "Data Security",
            content: [
                "We take reasonable measures to protect your data from loss, misuse, and unauthorised access. However, no internet-based service is 100% secure."
            ]
        },
        {
            id: 8,
            title: "Data Retention",
            content: [
                "We retain personal data only as long as necessary to:",
                "• Provide services",
                "• Comply with legal and regulatory obligations",
                "• Resolve disputes and enforce our agreements"
            ]
        },
        {
            id: 9,
            title: "Children's Privacy",
            content: [
                "Our website and services are not intended for users under the age of 17. We do not knowingly collect personal data from children."
            ]
        },
        {
            id: 10,
            title: "Changes to This Policy",
            content: [
                "We may occasionally update this policy. Any changes will be posted here, and the updated date will appear at the top of the page."
            ]
        },
        {
            id: 11,
            title: "Contact Us",
            content: [
                "If you have questions or concerns about this Privacy Policy or how we handle your data, please contact us.",
                "Email Address:",
                "info@simplymot.co.uk",
                "Website:",
                "https://www.simplymot.co.uk"
            ]
        }
    ]
}

export default function PrivacyPolicy() {
    return (
        <div>
            <HeroSectionReused title="Privacy Policy" />

            {/* content section */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className=" p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-4">Last Updated: {privacyPolicyData.lastUpdated}</p>
                        <p className="text-gray-700 mb-6">{privacyPolicyData.disclaimer}</p>
                    </div>

                    {privacyPolicyData.sections.map((section) => (
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
