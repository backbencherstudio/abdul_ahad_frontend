'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function NotFound() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-red-500 mb-2">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <p className="text-gray-600 mb-3">
            The requested page could not be found:
          </p>
          <code className="bg-red-50 text-red-800 px-3 py-2 rounded text-sm font-mono block break-all">
            {pathname || 'Unknown path'}
          </code>
        </div>

        <div className="space-y-3">
          <p className="text-gray-600">
            The page you are looking for doesn't exist, has been moved, or the URL is incorrect.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-[#19CA32] hover:bg-[#19CA32] text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Go Back Home
            </Link>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Error Code: 404 - Resource Not Found</p>
          <p>Timestamp: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
} 