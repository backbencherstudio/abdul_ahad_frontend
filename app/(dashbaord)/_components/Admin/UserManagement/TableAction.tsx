import React from 'react'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Pencil, Ban as BanIcon, CheckCircle, UserPlus, UserMinus, Shield } from 'lucide-react'
import RoleList from './RoleList'
import { useBanUserMutation, useUnbanUserMutation, useGetRolesQuery, useAssignRoleToUserMutation, useRemoveRoleFromUserMutation, setUserRoles, useAppDispatch } from '@/rtk'

import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

interface TableActionProps {
    row: any
    onEditClick?: (userId: string) => void
}

export default function TableAction({ row, onEditClick }: TableActionProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [banUser, { isLoading: banning }] = useBanUserMutation()
    const [unbanUser, { isLoading: unbanning }] = useUnbanUserMutation()
    const [assignRole, { isLoading: assigning }] = useAssignRoleToUserMutation()
    const [removeRole, { isLoading: removing }] = useRemoveRoleFromUserMutation()
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const isSuperAdmin = Array.isArray(row.roles) && row.roles.some((r: any) => r.name === 'super_admin')
    const isAdminAccount = String(row?.type) === 'ADMIN'
    const isBanned = !row?.approved_at
    const [reason, setReason] = React.useState('')
    const { data: fetchedRolesResp } = useGetRolesQuery()
    const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>(Array.isArray(row.roles) ? row.roles.map((r: any) => r.id) : [])
    const [confirmAssignOpen, setConfirmAssignOpen] = React.useState(false)
    const [assignResultOpen, setAssignResultOpen] = React.useState(false)
    const [assignMessage, setAssignMessage] = React.useState('')
    const [assignResult, setAssignResult] = React.useState<any>(null)

    const handleBanUnban = async () => {
        try {
            if (row.approved_at) {
                const res = await banUser({ id: row.id, reason }).unwrap()
                if ((res as any)?.success === false) {
                    toast.error(((res as any)?.message) || 'Operation failed')
                } else {
                    toast.success('User banned successfully')
                }
            } else {
                const res = await unbanUser(row.id).unwrap()
                if ((res as any)?.success === false) {
                    toast.error(((res as any)?.message) || 'Operation failed')
                } else {
                    toast.success('User unbanned successfully')
                }
            }
        } catch (e) {
            const err = e as any
            const payload = err?.data
            if (payload && typeof payload === 'object') {
                toast.error(payload?.message || 'Operation failed')
            } else {
                toast.error(err?.message || 'Operation failed')
            }
        }
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="bg-gray-100 cursor-pointer text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={() => router.push(`/admin/users-management/${row.id}`)}
                    className="cursor-pointer"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                </DropdownMenuItem>

                <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => onEditClick?.(row.id)}
                    disabled={isSuperAdmin}
                >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit User
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onSelect={(e) => { e.preventDefault(); setConfirmOpen(true); }}
                    disabled={Array.isArray(row.roles) && row.roles.some((r: any) => r.name === 'super_admin')}
                    className={`cursor-pointer ${row.approved_at ? 'text-red-600' : 'text-green-600'}`}
                >
                    {row.approved_at ? (
                        <BanIcon className={`w-4 h-4 mr-2 ${banning ? 'opacity-50' : ''}`} />
                    ) : (
                        <CheckCircle className={`w-4 h-4 mr-2 ${unbanning ? 'opacity-50' : ''}`} />
                    )}
                    {row.approved_at ? (banning ? 'Banning...' : 'Ban User') : (unbanning ? 'Unbanning...' : 'Unban User')}
                </DropdownMenuItem>



                {isSuperAdmin || !isAdminAccount || isBanned ? (
                    <DropdownMenuItem
                        disabled
                        className="cursor-not-allowed pointer-events-none opacity-60 text-gray-400"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign Role
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign Role
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-72">
                            {Array.isArray(fetchedRolesResp?.data?.roles) && fetchedRolesResp.data.roles.length > 0 ? (
                                <div className="p-2 space-y-2">
                                    <RoleList
                                        roles={fetchedRolesResp.data.roles}
                                        selectedIds={selectedRoleIds}
                                        onToggle={(id) => setSelectedRoleIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                                        isDisabled={(r) => r.name === 'super_admin'}
                                    />
                                    <div className="pt-2 flex justify-between gap-2">
                                        <Button
                                            variant="outline"
                                            className="!h-7 px-2 !text-sm cursor-pointer"
                                            onClick={(e) => { e.preventDefault(); setSelectedRoleIds(Array.isArray(row.roles) ? row.roles.map((r: any) => r.id) : []) }}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            className="!h-7 px-3 bg-emerald-600 hover:bg-emerald-700 !text-sm cursor-pointer"
                                            disabled={assigning}
                                            onClick={(e) => { e.preventDefault(); setConfirmAssignOpen(true) }}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <DropdownMenuItem disabled className="opacity-60">No roles found</DropdownMenuItem>
                            )}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                )}

                {isAdminAccount && !isBanned ? (
                    isSuperAdmin ? (
                        <DropdownMenuItem
                            disabled
                            className="cursor-not-allowed pointer-events-none opacity-60 text-gray-400"
                        >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove Role
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="cursor-pointer text-orange-600">
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Role
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-60">
                                {Array.isArray(row.roles) && row.roles.length > 0 ? (
                                    row.roles.map((r: any) => (
                                        <DropdownMenuItem
                                            key={r.id}
                                            disabled={r.name === 'super_admin' || removing}
                                            onSelect={async (e) => {
                                                e.preventDefault()
                                                if (r.name === 'super_admin') return
                                                try {
                                                    const res = await removeRole({ id: row.id, role_id: r.id }).unwrap()
                                                    if ((res as any)?.success === false) {
                                                        toast.error(((res as any)?.message) || 'Operation failed')
                                                    } else {
                                                        const roles = (row.roles || []).filter((rr: any) => rr.id !== r.id)
                                                        dispatch(setUserRoles({ id: row.id, roles }))
                                                        setSelectedRoleIds((prev) => prev.filter((rid) => rid !== r.id))
                                                        toast.success('Role removed')
                                                    }
                                                } catch (err: any) {
                                                    toast.error(err?.data?.message || 'Operation failed')
                                                }
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Shield className="w-4 h-4 mr-2" /> {r.title || r.name}
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled className="opacity-60">No roles to remove</DropdownMenuItem>
                                )}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    )
                ) : (
                    <DropdownMenuItem
                        disabled
                        className="cursor-not-allowed pointer-events-none opacity-60 text-gray-400"
                    >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove Role
                    </DropdownMenuItem>
                )}

            </DropdownMenuContent>


            {/* Confirm Modal */}
            <CustomReusableModal
                isOpen={confirmOpen}
                onClose={() => !banning && !unbanning && setConfirmOpen(false)}
                showHeader
                className="max-w-sm"
                title={row.approved_at ? 'Ban User' : 'Unban User'}
                description={row.approved_at ? 'Provide a reason for banning this user.' : 'Confirm unbanning this user.'}
                icon={row.approved_at ? <BanIcon className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                variant={row.approved_at ? 'danger' : 'success'}
            >
                <div className="space-y-4">
                    {row.approved_at ? (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Reason</label>
                            <input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                type="text"
                                placeholder="Write a short reason (optional)"
                                className="w-full h-10 rounded-md border border-gray-300 px-3 focus:outline-none"
                            />
                        </div>
                    ) : null}
                    <p className="text-sm text-gray-700">
                        Are you sure you want to {row.approved_at ? 'ban' : 'unban'} this user?
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => { setConfirmOpen(false); setReason('') }}
                            disabled={banning || unbanning}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={`${row.approved_at ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} cursor-pointer`}
                            onClick={async () => {
                                await handleBanUnban()
                                setConfirmOpen(false)
                                setReason('')
                            }}
                            disabled={banning || unbanning}
                        >
                            {banning || unbanning ? 'Processing...' : 'Confirm'}
                        </Button>
                    </div>
                </div>
            </CustomReusableModal>

            {/* Assign Roles Confirm Modal */}
            <CustomReusableModal
                isOpen={confirmAssignOpen}
                onClose={() => !assigning && setConfirmAssignOpen(false)}
                showHeader
                className="max-w-sm"
                title="Assign Roles"
                description={`You are assigning ${selectedRoleIds.length} role(s) to this user.`}
                icon={<Shield className="w-5 h-5" />}
                variant="default"
            >
                <div className="space-y-3 text-sm text-gray-700">
                    <ul className="list-disc pl-5 max-h-40 overflow-auto">
                        {(fetchedRolesResp?.data?.roles || []).filter((r: any) => selectedRoleIds.includes(r.id)).map((r: any) => (
                            <li key={r.id}>{r.title || r.name}</li>
                        ))}
                    </ul>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setConfirmAssignOpen(false)}
                            disabled={assigning}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                            disabled={assigning}
                            onClick={async () => {
                                try {
                                    const res = await assignRole({ id: row.id, role_ids: selectedRoleIds }).unwrap()
                                    if ((res as any)?.success === false) {
                                        toast.error(((res as any)?.message) || 'Operation failed')
                                    } else {
                                        toast.success('Roles updated')
                                        const roles = (fetchedRolesResp?.data?.roles || []).filter((r: any) => selectedRoleIds.includes(r.id))
                                        dispatch(setUserRoles({ id: row.id, roles }))
                                        setSelectedRoleIds(roles.map((r: any) => r.id))
                                        setConfirmAssignOpen(false)
                                        const msg = (res as any)?.message
                                        if (msg) {
                                            setAssignMessage(msg)
                                            setAssignResult(res)
                                            setTimeout(() => setAssignResultOpen(true), 700)
                                        }
                                    }
                                } catch (err: any) {
                                    toast.error(err?.data?.message || 'Operation failed')
                                }
                            }}
                        >
                            {assigning ? 'Processing...' : 'Confirm'}
                        </Button>
                    </div>
                </div>
            </CustomReusableModal>

            {/* Assign Result Alert Modal */}
            <CustomReusableModal
                isOpen={assignResultOpen}
                onClose={() => setAssignResultOpen(false)}
                showHeader
                className="max-w-lg"
                title="Roles Assigned"
                description=""
                icon={<Shield className="w-7 h-7" />}
                variant="success"
            >
                <div className="space-y-5 text-gray-800">
                    {/* Message */}
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 transition-all duration-300 ease-out animate-in fade-in-50 slide-in-from-top-2">
                        <p className="text-base font-semibold flex items-start gap-2">
                            <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <span>{assignMessage || 'Roles have been updated successfully.'}</span>
                        </p>
                    </div>

                    {/* Counts */}
                    {assignResult?.data ? (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in-50 slide-in-from-bottom-2">
                            <div className="rounded-md border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Roles Added</p>
                                <p className="text-2xl font-bold text-emerald-700">{assignResult?.data?.roles_added ?? 0}</p>
                            </div>
                            <div className="rounded-md border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Roles Removed</p>
                                <p className="text-2xl font-bold text-rose-600">{assignResult?.data?.roles_removed ?? 0}</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Changes */}
                    <div className="space-y-4">
                        {assignResult?.data?.role_changes?.added?.length ? (
                            <div className="transition-all duration-300 ease-out animate-in fade-in-50 slide-in-from-left-2">
                                <p className="text-sm font-medium text-emerald-700">Added Roles</p>
                                <ul className="mt-2 flex flex-wrap gap-2">
                                    {assignResult.data.role_changes.added.map((r: any) => (
                                        <li key={r.id} className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            {r.title || r.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        {assignResult?.data?.role_changes?.removed?.length ? (
                            <div className="transition-all duration-300 ease-out animate-in fade-in-50 slide-in-from-right-2">
                                <p className="text-sm font-medium text-rose-700">Removed Roles</p>
                                <ul className="mt-2 flex flex-wrap gap-2">
                                    {assignResult.data.role_changes.removed.map((r: any) => (
                                        <li key={r.id} className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                            {r.title || r.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>

                    {/* Strategy & Reasoning */}
                    {(assignResult?.data?.assignment_strategy || assignResult?.data?.intelligent_reasoning) ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 animate-in fade-in-50 slide-in-from-bottom-2">
                            {assignResult?.data?.assignment_strategy ? (
                                <p className="text-sm"><span className="font-semibold">Strategy:</span> {assignResult.data.assignment_strategy.replace(/_/g, ' ')}</p>
                            ) : null}
                            {assignResult?.data?.intelligent_reasoning ? (
                                <p className="text-sm mt-1 italic text-gray-600">{assignResult.data.intelligent_reasoning}</p>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="flex justify-end pt-1">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer" onClick={() => setAssignResultOpen(false)}>OK</Button>
                    </div>
                </div>
            </CustomReusableModal>
        </DropdownMenu>
    )
}
