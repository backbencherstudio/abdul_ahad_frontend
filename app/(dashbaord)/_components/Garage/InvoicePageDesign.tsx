'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { jsPDF } from 'jspdf'

interface InvoicePageDesignProps {
    invoice: {
        invoice_id: string
        membership_period: string
        issue_date: string
        invoice_amount: number
        invoice_status: string
    }
}

export default function InvoicePageDesign({ invoice }: InvoicePageDesignProps) {
    const handleDownload = () => {
        const doc = new jsPDF()

        // Set colors
        const primaryColor = '#19CA32' 
        const textColor = '#1f2937' 
        const secondaryColor = '#6b7280' 

        // Add header with background
        doc.setFillColor(primaryColor)
        doc.rect(0, 0, 210, 40, 'F')

        // Add logo text
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.text('simplymot.co.uk', 20, 20)

        // Add a small decorative line
        doc.setDrawColor(255, 255, 255)
        doc.setLineWidth(0.5)
        doc.line(20, 25, 60, 25)

        // Invoice ID and Date
        doc.setFontSize(11)
        doc.text(`Invoice #${invoice.invoice_id}`, 140, 20)
        doc.text(`Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 140, 28)

        // Reset text color for body
        doc.setTextColor(textColor)

        // Add company info section
        doc.setFillColor(249, 250, 251)
        doc.rect(10, 50, 190, 45, 'F')

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('From:', 20, 60)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.text('SimplyMOT', 20, 70)
        doc.text('123 Garage Street', 20, 80)
        doc.text('City, Country', 20, 90)

        // Add status section
        doc.setFont('helvetica', 'bold')
        doc.text('Status:', 140, 60)
        doc.setFont('helvetica', 'normal')

        // Status badge
        const statusColor = invoice.invoice_status.toLowerCase() === 'paid' ? '#19CA32' : '#d97706'
        doc.setFillColor(statusColor)
        doc.roundedRect(140, 65, 35, 12, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.text(invoice.invoice_status.toUpperCase(), 157, 73, { align: 'center' })

        // Reset text color
        doc.setTextColor(textColor)

        // Add invoice details section
        doc.setFillColor(249, 250, 251)
        doc.rect(10, 105, 190, 35, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('Invoice Details', 20, 120)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.text('Membership Period:', 20, 130)
        doc.text(invoice.membership_period, 20, 140)

        doc.text('Amount:', 140, 130)
        doc.setFont('helvetica', 'bold')
        doc.text(`£${invoice.invoice_amount.toFixed(2)}`, 140, 140)

        // Add payment info section with better styling
        doc.setFillColor(240, 253, 244)
        doc.rect(10, 150, 190, 60, 'F')

        // Payment header with icon
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(primaryColor)
        doc.text('Payment Information', 20, 165)

        // Payment details in a grid
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)

        // Bank details
        doc.text('Bank Details:', 20, 175)
        doc.setFont('helvetica', 'bold')
        doc.text('SimplyMOT Bank', 20, 185)
        doc.text('1234 5678 9012 3456', 20, 195)

        // Payment terms
        doc.setFont('helvetica', 'normal')
        doc.text('Payment Terms:', 140, 175)
        doc.setFont('helvetica', 'bold')
        doc.text('Due upon receipt', 140, 185)
        doc.text('Bank Transfer', 140, 195)

        // Add watermark if paid
        if (invoice.invoice_status.toLowerCase() === 'paid') {
            doc.setTextColor(200, 200, 200)
            doc.setFontSize(60)
            doc.setFont('helvetica', 'bold')
            doc.text('PAID', 105, 150, { align: 'center', angle: 45 })
        }

        // Add footer at the bottom
        doc.setTextColor(secondaryColor)
        doc.setFontSize(9)
        doc.text('Thank you for choosing SimplyMOT!', 20, 250)
        doc.setFontSize(8)
        doc.text('This is a computer-generated invoice, no signature required.', 20, 260)

        // Add border
        doc.setDrawColor(229, 231, 235)
        doc.rect(5, 5, 200, 270, 'S')

        // Save the PDF
        doc.save(`invoice-${invoice.invoice_id}.pdf`)
    }

    return (
        <div className="p-4">
            {/* Download Button */}
            <div className="flex justify-end mb-4">
                <Button
                    onClick={handleDownload}
                    className="border-[#19CA32] border cursor-pointer bg-transparent text-[#19CA32] hover:bg-transparent hover:text-[#19ca317e]  text-sm px-4 py-2"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                </Button>
            </div>

            {/* Invoice Design */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-[#19CA32] text-white p-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="flex flex-col">
                                <span className="text-xl font-bold">simplymot.co.uk</span>
                                <div className="h-0.5 w-10 bg-white/80 mt-1"></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white/80">Invoice #{invoice.invoice_id}</p>
                            <p className="text-sm text-white/80">Issue Date: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    {/* Company Info and Status */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-gray-500 text-sm font-medium mb-2">From:</h3>
                            <p className="font-semibold">SimplyMOT</p>
                            <p className="text-gray-500 text-sm">123 Garage Street</p>
                            <p className="text-gray-500 text-sm">City, Country</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-gray-500 text-sm font-medium mb-2">Status:</h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${invoice.invoice_status.toLowerCase() === 'paid'
                                ? 'bg-[#19CA32]/10 text-[#19CA32] border border-[#19CA32]/20'
                                : 'bg-orange-100 text-orange-800 border border-orange-200'
                                }`}>
                                {invoice.invoice_status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="text-gray-500 text-sm font-medium mb-3">Invoice Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Membership Period:</p>
                                <p className="font-medium">{invoice.membership_period}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm mb-1">Amount:</p>
                                <p className="font-medium text-lg">£{invoice.invoice_amount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-[#19CA32]/5 p-4 rounded-lg mb-6">
                        <h3 className="text-[#19CA32] text-sm font-medium mb-3">Payment Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[#19CA32] text-sm mb-1">Bank Details:</p>
                                <p className="font-medium">SimplyMOT Bank</p>
                                <p className="font-medium">1234 5678 9012 3456</p>
                            </div>
                            <div>
                                <p className="text-[#19CA32] text-sm mb-1">Payment Terms:</p>
                                <p className="font-medium">Due upon receipt</p>
                                <p className="font-medium">Bank Transfer</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
                        <p>Thank you for choosing SimplyMOT!</p>
                        <p className="mt-3 text-xs">This is a computer-generated invoice, no signature required.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
