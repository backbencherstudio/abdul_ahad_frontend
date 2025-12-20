"use client"

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const containerClass = fullScreen 
    ? 'flex justify-center items-center min-h-screen bg-gray-50'
    : 'flex justify-center items-center py-10'

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-4">
        {/* Custom Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div 
            className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}
          />
          {/* Animated spinner */}
          <div 
            className={`${sizeClasses[size]} border-4 border-[#19CA32] border-t-transparent rounded-full animate-spin absolute top-0 left-0`}
          />
          {/* Inner dot */}
          <div 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} bg-[#19CA32] rounded-full animate-pulse`}
          />
        </div>
        
        {/* Loading text */}
        {text && (
          <div className="text-sm font-medium text-gray-600 animate-pulse">
            {text}
          </div>
        )}
      </div>
    </div>
  )
}

