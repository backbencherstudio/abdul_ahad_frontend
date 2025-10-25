import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface RoleItem { id: string; name: string; title?: string; description?: string }

interface Pagination {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
}

interface RoleState {
  rolesByUserId: Record<string, RoleItem[]>
  pagination: Pagination
}

const initialState: RoleState = {
  rolesByUserId: {},
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  }
}

const roleManagementSlice = createSlice({
  name: 'roleManagement',
  initialState,
  reducers: {
    setRolesForUser: (state, action: PayloadAction<{ userId: string; roles: RoleItem[] }>) => {
      state.rolesByUserId[action.payload.userId] = action.payload.roles
    },
    setPagination: (state, action: PayloadAction<{ totalItems: number; totalPages: number }>) => {
      state.pagination.totalItems = action.payload.totalItems
      state.pagination.totalPages = action.payload.totalPages
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload
      state.pagination.currentPage = 1
    },
  }
})

export const { setRolesForUser, setPagination, setCurrentPage, setItemsPerPage } = roleManagementSlice.actions
export default roleManagementSlice.reducer

