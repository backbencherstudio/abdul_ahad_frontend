import React from 'react'
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useCreateUserMutation, useGetRolesQuery } from '@/rtk'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import RoleList from './RoleList'
import { Eye, EyeOff } from 'lucide-react'

interface CreateNewUserProps {
    open: boolean
    onClose: () => void
}

export default function CreateNewUser({ open, onClose }: CreateNewUserProps) {
    const [form, setForm] = React.useState({ name: '', email: '', password: '', type: 'ADMIN' })
    const [roleIds, setRoleIds] = React.useState<string[]>([])
    const { data: rolesResp } = useGetRolesQuery()
    const [createUser, { isLoading: creating }] = useCreateUserMutation()
    const [rolesOpen, setRolesOpen] = React.useState(false)
    const [showPwd, setShowPwd] = React.useState(false)

    const reset = () => { setForm({ name: '', email: '', password: '', type: 'ADMIN' }); setRoleIds([]) }

    return (
        <CustomReusableModal
            isOpen={open}
            onClose={() => { if (!creating) onClose() }}
            showHeader
            className="!max-w-lg"
            title="Create New User"
            description="Fill in the details to create a user."
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute inset-y-0 right-2 my-auto h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer">
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                        <SelectTrigger className='cursor-pointer'>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem className='cursor-pointer' value="ADMIN">Admin</SelectItem>
                            <SelectItem className='cursor-pointer' value="GARAGE">Garage</SelectItem>
                            <SelectItem className='cursor-pointer' value="DRIVER">Driver</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                    <Popover open={rolesOpen} onOpenChange={setRolesOpen}>
                        <PopoverTrigger asChild>
                            <button type="button" className="w-full h-10 rounded-md border border-gray-300 px-3 cursor-pointer text-left text-sm flex items-center justify-between">
                                <span className="truncate">
                                    {roleIds.length === 0 ? 'Select roles' : `${roleIds.length} role(s) selected`}
                                </span>
                                <svg className="w-4 h-4 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className=" p-2 overflow-auto">
                            <RoleList
                                roles={(rolesResp?.data?.roles || [])}
                                selectedIds={roleIds}
                                onToggle={(id) => setRoleIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                                isDisabled={(r) => r.name === 'super_admin'}
                            />
                            <div className="pt-3 flex justify-between gap-2">
                                <Button variant="outline" className="!h-7 px-2 !text-sm cursor-pointer" onClick={() => setRoleIds([])}>Clear</Button>

                                <Button className="!h-7 px-3 bg-emerald-600 hover:bg-emerald-700 !text-sm cursor-pointer" onClick={() => setRolesOpen(false)}>Done</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" className="cursor-pointer" onClick={() => onClose()} disabled={creating}>Cancel</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer" disabled={creating} onClick={async () => {
                        try {
                            const res = await createUser({ ...form, role_ids: roleIds }).unwrap()
                            if ((res as any)?.success === false) {
                                alert((res as any)?.message || 'Failed')
                            } else {
                                reset(); onClose()
                            }
                        } catch (err: any) {
                            alert(err?.data?.message || 'Failed')
                        }
                    }}>{creating ? 'Creating...' : 'Create'}</Button>
                </div>
            </div>
        </CustomReusableModal>
    )
}
