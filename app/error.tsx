'use client' // Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4">⚠️</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Something went wrong!</h2>
          <p className="text-gray-600">An unexpected error occurred while processing your request.</p>
        </div>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => reset()}
              className="bg-red-600 hover:bg-red-700 text-white font-medium cursor-pointer py-2 px-6 rounded-md transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-[#19CA32] hover:bg-[#19CA32] text-white font-medium cursor-pointer py-2 px-6 rounded-md transition-colors"
            >
              Go Home
            </button>
          </div>

          {/* Additional Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              If this error persists, please contact support or try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}