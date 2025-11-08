import React from 'react';
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal';
import { Button } from '@/components/ui/button';
import { useAssignPermissionsToRoleMutation, useGetPermissionsQuery, useGetRoleByIdQuery } from '@/rtk';
import { Shield, Plus, Minus, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Permission } from '@/rtk/api/admin/roleManagementApis';

interface AssignPermissionsModalProps {
    open: boolean;
    onClose: () => void;
    roleId: string;
    roleName: string;
}

export default function AssignPermissionsModal({ open, onClose, roleId, roleName }: AssignPermissionsModalProps) {
    const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
    const [mode, setMode] = React.useState<'assign' | 'remove' | 'replace'>('assign');
    const [expandedSubjects, setExpandedSubjects] = React.useState<Set<string>>(new Set());
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    const [assignPermissions, { isLoading }] = useAssignPermissionsToRoleMutation();
    const { data: permissionsData, isLoading: loadingPermissions } = useGetPermissionsQuery();
    const { data: roleData, isLoading: loadingRole } = useGetRoleByIdQuery(roleId);

    const groupedPermissions = React.useMemo(() => {
        if (!permissionsData?.data?.permissions) return {};
        const grouped: Record<string, Permission[]> = {};

        permissionsData.data.permissions.forEach((permission) => {
            if (!grouped[permission.subject]) grouped[permission.subject] = [];
            grouped[permission.subject].push(permission);
        });

        Object.values(grouped).forEach(perms => perms.sort((a, b) => a.action.localeCompare(b.action)));
        return grouped;
    }, [permissionsData]);

    const currentRolePermissionIds = React.useMemo(() =>
        new Set(roleData?.data?.permissions?.map((p: any) => p.id) || []),
        [roleData]
    );

    React.useEffect(() => {
        if (roleData?.data?.permissions && open) {
            setSelectedPermissions(roleData.data.permissions.map((p: any) => p.id));
        }
    }, [roleData, open]);

    React.useEffect(() => {
        if (open && Object.keys(groupedPermissions).length) {
            setExpandedSubjects(new Set(Object.keys(groupedPermissions)));
        }
    }, [open, groupedPermissions]);

    React.useEffect(() => {
        if (!open) {
            setMode('assign');
            setSelectedPermissions([]);
            setExpandedSubjects(new Set());
            setConfirmOpen(false);
        }
    }, [open]);

    const toggleSubject = (subject: string) => {
        setExpandedSubjects(prev => {
            const next = new Set(prev);
            next.has(subject) ? next.delete(subject) : next.add(subject);
            return next;
        });
    };

    const togglePermission = (id: string) => {
        setSelectedPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const toggleAllInSubject = (permissions: Permission[]) => {
        const ids = permissions.map(p => p.id);
        const allSelected = ids.every(id => selectedPermissions.includes(id));
        setSelectedPermissions(prev => allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
    };

    const handleShowConfirmation = () => {
        if (!selectedPermissions.length) {
            toast.error('Please select at least one permission');
            return;
        }
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        try {
            const result = await assignPermissions({ id: roleId, mode, permission_ids: selectedPermissions }).unwrap() as any;

            if (result?.success === false) {
                const errorMsg = result.message || 'Failed to update permissions';
                toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
                setConfirmOpen(false);
                return;
            }

            const successMsg = result?.message || `Permissions ${mode}d successfully`;
            toast.success(successMsg);
            setConfirmOpen(false);
            onClose();
        } catch (err: any) {
            const errorMessage = err?.data?.message?.message 
                ? (Array.isArray(err.data.message.message) ? err.data.message.message.join(', ') : err.data.message.message)
                : err?.data?.message || err?.message || 'Failed to update permissions';

            toast.error(errorMessage);
            setConfirmOpen(false);
        }
    };

    return (
        <CustomReusableModal
            isOpen={open}
            onClose={() => !isLoading && !confirmOpen && onClose()}
            showHeader
            className="!max-w-2xl border-none"
            title={`Manage Permissions for ${roleName}`}
            description="Select permissions and choose how to apply them"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operation Mode</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button type="button" onClick={() => setMode('assign')} className={`flex cursor-pointer items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${mode === 'assign' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                            <Plus className="w-4 h-4" />
                            <span className="font-medium text-sm">Assign</span>
                        </button>
                        <button type="button" onClick={() => setMode('remove')} className={`flex cursor-pointer items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${mode === 'remove' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'}`}>
                            <Minus className="w-4 h-4" />
                            <span className="font-medium text-sm">Remove</span>
                        </button>
                        <button type="button" onClick={() => setMode('replace')} className={`flex cursor-pointer items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${mode === 'replace' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                            <RefreshCw className="w-4 h-4" />
                            <span className="font-medium text-sm">Replace</span>
                        </button>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {loadingPermissions || loadingRole ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <span className="ml-3 text-gray-600">Loading permissions...</span>
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">
                                    {selectedPermissions.length} of {permissionsData?.data?.permissions?.length || 0} selected
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPermissions(permissionsData?.data?.permissions?.map(p => p.id) || [])}
                                        className="text-xs cursor-pointer text-green-600 hover:text-green-700 font-medium"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPermissions([])}
                                        className="text-xs cursor-pointer text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                            {Object.entries(groupedPermissions).map(([subject, permissions]) => {
                                const isExpanded = expandedSubjects.has(subject);
                                const ids = permissions.map(p => p.id);
                                const selectedCount = ids.filter(id => selectedPermissions.includes(id)).length;
                                const allSelected = selectedCount === permissions.length;
                                const someSelected = selectedCount > 0 && !allSelected;

                                return (
                                    <div key={subject} className="border-b border-gray-100 last:border-b-0">
                                        <div className="bg-white hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center p-3 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSubject(subject)}
                                                    className="flex-1 flex items-center gap-2 text-left"
                                                >
                                                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                                    <Shield className="w-4 h-4 text-green-600" />
                                                    <span className="font-semibold text-gray-800">{subject}</span>
                                                    <span className="text-xs text-gray-500 ml-1">({selectedCount}/{permissions.length})</span>
                                                </button>
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                                                        onChange={() => toggleAllInSubject(permissions)}
                                                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="bg-gray-50 px-3 py-2 space-y-1">
                                                {permissions.map(permission => (
                                                    <label key={permission.id} className="flex items-center gap-3 p-2 rounded hover:bg-white cursor-pointer transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(permission.id)}
                                                            onChange={() => togglePermission(permission.id)}
                                                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-800">{permission.action}</span>
                                                                {currentRolePermissionIds.has(permission.id) && (
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-700 border border-blue-200">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 truncate">{permission.title}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" className="cursor-pointer" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                        disabled={isLoading || !selectedPermissions.length}
                        onClick={handleShowConfirmation}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)} Permissions
                    </Button>
                </div>

                {/* Confirmation Dialog */}
                {confirmOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40" onClick={() => !isLoading && setConfirmOpen(false)}></div>
                        <div className="relative z-10 bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${mode === 'remove' ? 'bg-red-100' : mode === 'replace' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                                    {mode === 'remove' ? <Minus className="w-6 h-6 text-red-600" /> : mode === 'replace' ? <RefreshCw className="w-6 h-6 text-yellow-600" /> : <Plus className="w-6 h-6 text-green-600" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{mode.charAt(0).toUpperCase() + mode.slice(1)} Permissions</h3>
                                    <p className="text-sm text-gray-600">
                                        Are you sure you want to {mode} <span className="font-semibold">{selectedPermissions.length}</span> permission{selectedPermissions.length > 1 ? 's' : ''} {mode === 'remove' ? 'from' : mode === 'replace' ? 'for' : 'to'} the role "<span className="font-semibold">{roleName}</span>"?
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isLoading} className="cursor-pointer">Cancel</Button>
                                <Button onClick={handleConfirm} disabled={isLoading} className={`cursor-pointer ${mode === 'remove' ? 'bg-red-600 hover:bg-red-700' : mode === 'replace' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                    {isLoading ? 'Processing...' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomReusableModal>
    );
}