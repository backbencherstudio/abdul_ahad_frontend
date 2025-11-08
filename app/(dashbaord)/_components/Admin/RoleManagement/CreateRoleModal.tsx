import React from 'react';
import CustomReusableModal from '@/components/reusable/Dashboard/Modal/CustomReusableModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateRoleMutation, useUpdateRoleMutation, useGetRoleByIdQuery } from '@/rtk';
import { toast } from 'react-toastify';

interface CreateRoleModalProps {
    open: boolean;
    onClose: () => void;
    editRoleId?: string | null;
}

export default function CreateRoleModal({ open, onClose, editRoleId }: CreateRoleModalProps) {
    const isEditMode = Boolean(editRoleId);
    const [form, setForm] = React.useState({ name: '', title: '' });

    const { data: roleResponse, isLoading: loadingRole } = useGetRoleByIdQuery(editRoleId || '', { skip: !editRoleId });
    const [createRole, { isLoading: creating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

    React.useEffect(() => {
        if (isEditMode && roleResponse?.data && open) {
            const roleData = roleResponse.data;
            setForm({
                name: roleData.name || '',
                title: roleData.title || ''
            });
        } else if (!open) {
            reset();
        }
    }, [isEditMode, roleResponse, open]);

    const reset = () => {
        setForm({ name: '', title: '' });
    };

    const handleSubmit = async () => {
        if (!form.name || !form.title) {
            toast.error('Name and Title are required');
            return;
        }

        try {
            const result = isEditMode && editRoleId
                ? await updateRole({ id: editRoleId, ...form }).unwrap() as any
                : await createRole(form).unwrap() as any;

            if (result?.success === false) {
                const errorMsg = result.message || 'Operation failed';
                toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
                return;
            }

            toast.success(isEditMode ? 'Role updated successfully' : 'Role created successfully');
            onClose();
        } catch (err: any) {
            const errorMessage = err?.data?.message?.message
                ? (Array.isArray(err.data.message.message) ? err.data.message.message.join(', ') : err.data.message.message)
                : err?.data?.message || err?.message || 'Operation failed';

            toast.error(errorMessage);
        }
    };

    return (
        <CustomReusableModal
            isOpen={open}
            onClose={() => { if (!creating && !updating) onClose(); }}
            showHeader
            className="!max-w-lg"
            title={isEditMode ? "Edit Role" : "Create New Role"}
            description={isEditMode ? "Update role information." : "Fill in the details to create a role."}
        >
            {loadingRole && isEditMode ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">Loading role...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g., vehicle_inspector"
                        />
                        <p className="text-xs text-gray-500 mt-1">Lowercase with underscores only</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g., Vehicle Inspector"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => onClose()}
                            disabled={creating || updating}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                            disabled={creating || updating || loadingRole}
                            onClick={handleSubmit}
                        >
                            {creating || updating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </div>
            )}
        </CustomReusableModal>
    );
}

