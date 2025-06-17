'use client'
import React from 'react'
import ReusableTable from '@/components/reusable/Dashboard/Table/ReuseableTable'
import { Button } from '@/components/ui/button'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { toast } from 'react-toastify'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

const data = [
    {
        name: 'Cody Fisher',
        VehicleNumber: '1234567890',
        email: 'cody.fisher@gmail.com',
        phone: '+1234567890',
        motDate: '2025-01-01',
        reminder: 'Sent',
    },
    {
        name: 'Marvin McKinney',
        VehicleNumber: '1234567890',
        email: 'esther.howard@gmail.com',
        phone: '+1234567890',
        motDate: '2025-01-01',
        reminder: 'Sent',
    },
    {
        name: 'Guy Hawkins',
        VehicleNumber: '1234567890',
        email: 'jane.cooper@gmail.com',
        phone: '+1234567890',
        motDate: '2025-01-01',
        reminder: 'Sent',
    }
]

const BRAND_COLOR = '#19CA32';
const BRAND_COLOR_HOVER = '#16b82e';
const DANGER_COLOR = '#F04438';

export default function NewDrivers() {
    const [openMessageModal, setOpenMessageModal] = React.useState(false);
    const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
    const [selectedDriver, setSelectedDriver] = React.useState<any>(null);
    const [message, setMessage] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const columns = [
        { key: 'name', label: 'Drivers Name', width: '15%' },
        { key: 'email', label: 'Email', width: '20%' },
        { key: 'phone', label: 'Contact Number', width: '15%' },
        { key: 'VehicleNumber', label: 'Vehicle Number', width: '15%' },
        { key: 'motDate', label: 'MOT Date', width: '15%' },
        {
            key: 'reminder',
            label: 'Reminder',
            width: '10%',
            render: (value: string, row: any) => (
                <span
                    className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${value.toLowerCase() === 'sent'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                    onClick={() => {
                        setSelectedDriver(row);
                        setOpenMessageModal(true);
                    }}
                >
                    {value}
                </span>
            )
        },
    ]

    const handleDelete = (row: any) => {
        setSelectedDriver(row);
        setOpenDeleteModal(true);
    }

    // Send Message Handler
    const handleSendMessage = () => {
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setOpenMessageModal(false);
            setMessage('');
            toast.success('Message sent successfully!');
        }, 1500);
    };

    // Delete Driver Handler
    const handleDeleteDriver = () => {
        setIsDeleting(true);
        setTimeout(() => {
            setIsDeleting(false);
            setOpenDeleteModal(false);
            toast.success('Driver deleted successfully!');
        }, 1500);
    };

    const actions = [
        {
            label: '',
            render: (row: any) => (
                <Button variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center bg-red-100 border border-red-300 cursor-pointer text-red-600 hover:bg-red-100" onClick={() => handleDelete(row)}>
                    <Trash2 className="h-5 w-5" />
                </Button>
            )
        }
    ]

    return (
        <>
            <div className='flex justify-between items-center'>
                <h1 className='text-2xl font-semibold '>New Drivers</h1>
                <div>
                    <Link href="/admin/manage-drivers" className='underline hover:text-green-600 cursor-pointer transition-all duration-300'>View All Drivers</Link>
                </div>
            </div>

            <ReusableTable
                data={data}
                columns={columns}
                actions={actions}
                className="mt-4"
            />

            {/* Send Message Modal */}
            <CustomReusableModal
                isOpen={openMessageModal}
                onClose={() => setOpenMessageModal(false)}
                title="Send Message"
                showHeader={false}
                className="max-w-sm border-green-600"
            >
                <div className="bg-white rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className={`bg-[${BRAND_COLOR}] text-white p-4 flex items-center justify-between`}>
                        <h2 className="text-lg font-semibold">Send Message</h2>
                    </div>
                    {/* Content */}
                    <div className="p-6">
                        <textarea
                            className="w-full border rounded-md p-2 mb-4"
                            placeholder="Input Message"
                            rows={4}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            disabled={isSending}
                        />
                        <button
                            className={`w-full bg-[${BRAND_COLOR}] hover:bg-[${BRAND_COLOR_HOVER}] text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center`}
                            onClick={handleSendMessage}
                            disabled={isSending}
                        >
                            {isSending ? <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> : null}
                            {isSending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            </CustomReusableModal>

            {/* Delete Driver Account Modal */}
            <CustomReusableModal
                isOpen={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                title="Delete Driver Account"
                showHeader={false}
                className="max-w-sm border-red-600"
            >
                <div className="bg-white rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className={`bg-[${DANGER_COLOR}] text-white p-4 flex items-center justify-between`}>
                        <h2 className="text-lg font-semibold">Delete Driver Account</h2>
                    </div>
                    {/* Content */}
                    <div className="p-6 space-y-3">
                        <div className="text-sm font-medium text-gray-700">Drivers Name</div>
                        <input className="w-full border rounded-md p-2" value={selectedDriver?.name || ''} readOnly placeholder="Drivers Name" />
                        <div className="text-sm font-medium text-gray-700">Vehicle Number</div>
                        <input className="w-full border rounded-md p-2" value={selectedDriver?.VehicleNumber || ''} readOnly placeholder="Vehicle Number" />
                        <div className="text-sm font-medium text-gray-700">Email</div>
                        <input className="w-full border rounded-md p-2" value={selectedDriver?.email || ''} readOnly placeholder="Email" />
                        <div className="text-sm font-medium text-gray-700">Contact Number</div>
                        <input className="w-full border rounded-md p-2" value={selectedDriver?.phone || ''} readOnly placeholder="Contact Number" />
                        <button
                            className={`w-full bg-[${DANGER_COLOR}] hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center`}
                            onClick={handleDeleteDriver}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> : null}
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </CustomReusableModal>
        </>
    )
}

