"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldX, Home, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <ShieldX className="mx-auto h-24 w-24 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is restricted to specific user types.
          </p>
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">Need access?</p>
            <p>Contact your administrator or try logging in with a different account type.</p>
          </div> */}
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full bg-[#19CA32] hover:bg-[#19CA32]/90">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 