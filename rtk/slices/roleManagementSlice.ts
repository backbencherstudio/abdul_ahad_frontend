import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface RoleItem { id: string; name: string; title?: string; description?: string }

interface RoleState {
  rolesByUserId: Record<string, RoleItem[]>
}

const initialState: RoleState = {
  rolesByUserId: {}
}

const roleManagementSlice = createSlice({
  name: 'roleManagement',
  initialState,
  reducers: {
    setRolesForUser: (state, action: PayloadAction<{ userId: string; roles: RoleItem[] }>) => {
      state.rolesByUserId[action.payload.userId] = action.payload.roles
    }
  }
})

export const { setRolesForUser } = roleManagementSlice.actions
export default roleManagementSlice.reducer

