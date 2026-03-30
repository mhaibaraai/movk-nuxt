export interface RoleCreateReq {
  code: string
  name: string
  roleSort?: number
  dataScope?: 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF' | 'CUSTOM'
  dataScopeDeptIds?: string[]
  status?: 'ENABLED' | 'DISABLED'
  roleType?: 'BUILT_IN' | 'CUSTOM'
  menuIds?: string[]
  remark?: string
}

export interface RoleUpdateReq {
  name?: string
  roleSort?: number
  dataScope?: 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF' | 'CUSTOM'
  dataScopeDeptIds?: string[]
  status?: 'ENABLED' | 'DISABLED'
  roleType?: 'BUILT_IN' | 'CUSTOM'
  menuIds?: string[]
  remark?: string
}

export interface RoleListQuery {
  code?: string
  name?: string
  status?: 'ENABLED' | 'DISABLED'
  roleType?: 'BUILT_IN' | 'CUSTOM'
  createdAtStart?: string
  createdAtEnd?: string
  page?: number
  size?: number
}
