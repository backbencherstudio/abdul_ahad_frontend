import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Lock, Pencil, Trash2 } from 'lucide-react';

interface RoleTableActionsProps {
    role: {
        id: string;
        name: string;
        title: string;
    };
    onViewDetails: (id: string) => void;
    onManagePermissions: (role: { id: string; name: string; title: string }) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string, name: string, title: string) => void;
}

export default function RoleTableActions({
    role,
    onViewDetails,
    onManagePermissions,
    onEdit,
    onDelete,
}: RoleTableActionsProps) {
    const isSuperAdmin = role.name === 'super_admin';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="bg-gray-100 cursor-pointer text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={() => onViewDetails(role.id)}
                    className="cursor-pointer"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                </DropdownMenuItem>
                {!isSuperAdmin && (
                    <>
                        <DropdownMenuItem
                            onClick={() => onManagePermissions(role)}
                            className="cursor-pointer"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onEdit(role.id)}
                            className="cursor-pointer"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(role.id, role.name, role.title)}
                            className="cursor-pointer text-red-600"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Role
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

