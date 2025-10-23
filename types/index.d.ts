declare global {
    interface Window {
      katex: typeof import("katex");
    }
  }

// User Management Types
export interface User {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    address: string | null;
    type: string;
    approved_at: string;
    created_at: string;
    updated_at: string;
    avatar_url?: string | null;
    roles?: any[];
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Statistics {
    total_users: number;
    total_banned_users: number;
    total_admin_users: number;
    total_garage_users: number;
    total_driver_users: number;
    total_approved_users: number;
}

export interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: Pagination;
    statistics: Statistics;
}

// User Role Interface
export interface UserRole {
    id: string;
    title: string;
    name: string;
    assigned_at: string;
}

// User Permission Interface
export interface UserPermission {
    id: string;
    title: string;
    action: string;
    subject: string;
    conditions: any;
    fields: any;
}

// Permission Summary Interface
export interface PermissionSummary {
    can_manage_dashboard: boolean;
    can_manage_garages: boolean;
    can_manage_drivers: boolean;
    can_manage_bookings: boolean;
    can_manage_subscriptions: boolean;
    can_manage_payments: boolean;
    can_manage_roles: boolean;
    can_manage_users: boolean;
    can_view_analytics: boolean;
    can_generate_reports: boolean;
    can_manage_system_tenant: boolean;
}

// User Details Interface
export interface UserDetails {
    id: string;
    name: string;
    email: string;
    type: string;
    phone_number: string | null;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    avatar: string | null;
    avatar_url?: string | null;
    billing_id: string | null;
    roles?: UserRole[];
    permissions?: UserPermission[];
    permission_summary?: PermissionSummary;
    role_count?: number;
    permission_count?: number;
}

// User Details Response
export interface UserDetailsResponse {
    success: boolean;
    data: UserDetails;
}

// Create User Response
export interface CreateUserResponse {
    success: boolean;
    message?: string;
    data: {
        id: string;
        email: string;
        name: string;
        type: string;
        email_verified_at?: string | null;
        approved_at?: string | null;
        billing_id?: string | null;
        roles: Array<{ id: string; title?: string; name: string; created_at?: string }>;
        created_at?: string;
        roles_added?: number;
        roles_removed?: number;
        assignment_strategy?: string;
        intelligent_reasoning?: string;
        actions_performed?: string[];
    };
}

// Role Change Details
export interface RoleChange {
    added?: Array<{ id: string; name: string; title?: string }>;
    removed?: Array<{ id: string; name: string; title?: string }>;
}

// Assign Role Response
export interface AssignRoleResponse {
    success: boolean;
    message?: string;
    data: {
        id: string;
        name: string;
        email: string;
        type: string;
        roles: Array<{
            id: string;
            title?: string;
            name: string;
            created_at?: string;
        }>;
        roles_added?: number;
        roles_removed?: number;
        role_changes?: RoleChange;
        assignment_strategy?: string;
        intelligent_reasoning?: string;
    };
}