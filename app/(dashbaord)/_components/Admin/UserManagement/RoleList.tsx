import React from 'react'
import { Shield } from 'lucide-react'

interface RoleItem {
    id: string
    name: string
    title?: string
    permission_count?: number
}

interface RoleListProps {
    roles: RoleItem[]
    selectedIds: string[]
    onToggle: (id: string) => void
    isDisabled?: (role: RoleItem) => boolean
    className?: string
}

export default function RoleList({ roles, selectedIds, onToggle, isDisabled, className = '' }: RoleListProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {roles.map((r) => {
                const disabled = isDisabled ? isDisabled(r) : false
                const active = selectedIds.includes(r.id)
                return (
                    <button
                        key={r.id}
                        type="button"
                        onClick={() => { if (!disabled) onToggle(r.id) }}
                        className={`w-full cursor-pointer flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : active ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center min-w-0">
                            <input type="checkbox" readOnly checked={active} className="mr-2" />
                            <Shield className="w-4 h-4 mr-2" />
                            <span className="truncate">{r.title || r.name}</span>
                            {typeof r.permission_count === 'number' && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">{r.permission_count}</span>
                            )}
                        </div>
                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${active ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{active ? 'Active' : 'Add'}</span>
                    </button>
                )
            })}
        </div>
    )
}


