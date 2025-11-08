import { useState, useEffect } from 'react'

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

/**
 * Custom hook for debouncing callbacks
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number,
    deps: React.DependencyList = []
): T {
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

    const debouncedCallback = ((...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        const newTimeoutId = setTimeout(() => {
            callback(...args)
        }, delay)

        setTimeoutId(newTimeoutId)
    }) as T

    // Cleanup on unmount or deps change
    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    }, [timeoutId, ...deps])

    return debouncedCallback
}
