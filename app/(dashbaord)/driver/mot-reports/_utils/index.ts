export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

export const getStatusStyles = (status: 'Pass' | 'Fail') => ({
    badge: status === 'Pass' ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
    passDate: status === 'Pass' ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300',
    expiryDate: status === 'Fail' ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-300'
})
