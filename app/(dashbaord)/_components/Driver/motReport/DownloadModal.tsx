import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { TiArrowSortedDown } from "react-icons/ti"
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { MOTReport, Vehicle } from '../_types'

interface DownloadModalProps {
    isOpen: boolean
    onClose: () => void
    report: MOTReport | null
    vehicle: Vehicle | null
}

export default function DownloadModal({ isOpen, onClose, report, vehicle }: DownloadModalProps) {
    const [v5cNumber, setV5cNumber] = useState('')
    const [showWhereToFind, setShowWhereToFind] = useState(false)

    const handleDownloadCertificates = () => {
        if (v5cNumber.length === 11) {
            console.log('Downloading certificates for V5C:', v5cNumber)
            alert('Download started!')
            handleClose()
        } else {
            alert('Please enter a valid 11 digit V5C number.')
        }
    }

    const handleClose = () => {
        setV5cNumber('')
        setShowWhereToFind(false)
        onClose()
    }

    return (
        <CustomReusableModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Download Test Certificates"
            showHeader={false}
            className="max-w-md sm:max-w-lg"
        >
            <div className="bg-white rounded-lg overflow-hidden">
                <div className="bg-[#19CA32] text-white p-4 text-center relative">
                    <h2 className="text-base sm:text-lg font-semibold">Download Test Certificates</h2>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                    <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                            What is your vehicle log book (V5C) document reference number?
                        </h3>

                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm text-gray-700">
                                Document reference number <span className="text-gray-500">(This is an 11 digit number)</span>
                            </Label>
                            <Input
                                value={v5cNumber}
                                onChange={(e) => setV5cNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                placeholder="Enter 11 digit number"
                                className="border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] text-sm sm:text-base"
                                maxLength={11}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <button
                            onClick={() => setShowWhereToFind(!showWhereToFind)}
                            className="text-gray-700 cursor-pointer font-medium flex items-center gap-1 hover:text-gray-900 text-sm sm:text-base"
                        >
                            Where can I find this number?
                            <span className={`transform transition-transform ${showWhereToFind ? 'rotate-180' : ''}`}>
                                <TiArrowSortedDown className='text-xl sm:text-2xl' />
                            </span>
                        </button>

                        {showWhereToFind && (
                            <div className="mt-4 p-4 rounded-lg">
                                <Image
                                    src="/Image/driver/testCetification.png"
                                    alt="V5C Document showing reference number location"
                                    width={1000}
                                    height={1000}
                                    className='w-full h-full object-contain'
                                />
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleDownloadCertificates}
                        className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium py-3 text-sm sm:text-base"
                        disabled={v5cNumber.length !== 11}
                    >
                        Download Certificates
                    </Button>
                </div>
            </div>
        </CustomReusableModal>
    )
}
