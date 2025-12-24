import React from 'react'
import HeroSectionReused from '../_components/Shared/HeroSectionReused'

const cookiePolicyData = {
    lastUpdated: "December 2025",
    disclaimer: "This Cookie Policy explains how simplymot.co.uk (\"we\", \"us\", or \"our\") uses cookies and similar technologies on our website. By using our website, you consent to our use of cookies in accordance with this policy.",
    sections: [
        {
            id: 1,
            title: "What Are Cookies?",
            content: [
                "Cookies are small text files placed on your device by websites you visit. They help websites function properly, remember your preferences, and gather information to improve your experience."
            ]
        },
        {
            id: 2,
            title: "Types of Cookies We Use",
            content: [
                "Essential Cookies",
                "",
                "These are necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you, such as setting your privacy preferences or filling in forms.",
                "",
                "Performance & Analytics Cookies",
                "",
                "These cookies help us understand how visitors interact with the site by collecting and reporting information anonymously (e.g., pages visited, time on site). We may use tools like Google Analytics.",
                "",
                "Functional Cookies",
                "",
                "These cookies allow the website to remember choices you make (like your location or login details) and provide enhanced features.",
                "",
                "Marketing & Advertising Cookies",
                "",
                "We may use these to deliver relevant ads or offers and track the effectiveness of our marketing campaigns. These cookies may be set through our site by third-party advertising partners."
            ]
        },
        {
            id: 3,
            title: "How to Manage Cookies",
            content: [
                "You can control and manage cookies through your browser settings. Most browsers allow you to:",
                "• View which cookies are stored",
                "• Delete cookies",
                "• Block cookies from certain websites or all websites",
                "• Please note: Disabling certain cookies may affect website functionality."
            ]
        },
        {
            id: 4,
            title: "Third-Party Cookies",
            content: [
                "We may allow trusted third parties to place cookies on your device for analytics, advertising, or social media integration. We do not control the use of these cookies. You should refer to the third parties' privacy and cookie policies."
            ]
        },
        {
            id: 5,
            title: "Changes to This Cookie Policy",
            content: [
                "We may update this policy from time to time. Any changes will be posted on this page with an updated revision date."
            ]
        },
        {
            id: 6,
            title: "Contact Us",
            content: [
                "If you have any questions about our use of cookies, please contact us:",
                "Email: info@simplymot.co.uk"
            ]
        }
    ]
}

export default function CookiesPolicy() {
    return (
        <div>
            <HeroSectionReused title="Cookie Policy" />

            {/* content section */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className=" p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-4">Last Updated: {cookiePolicyData.lastUpdated}</p>
                        <p className="text-gray-700 mb-6">{cookiePolicyData.disclaimer}</p>
                    </div>

                    {cookiePolicyData.sections.map((section) => (
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
