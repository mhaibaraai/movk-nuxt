// ─── 用户管理 ───────────────────────────────────────

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'DELETED'
export type UserGender = 'UNKNOWN' | 'MALE' | 'FEMALE'

export interface UserResp {
  id: string
  username: string
  nickname: string | null
  email: string | null
  phone: string | null
  gender: UserGender
  avatar: string | null
  status: UserStatus
  deptId: string | null
  deptName: string | null
  loginIp: string | null
  loginDate: string | null
  remark: string | null
  createdAt: string
  updatedAt: string
}

export interface UserDetailResp extends UserResp {
  roleIds: string[]
  roleCodes: string[]
  roleNames: string[]
  postIds: string[]
  postCodes: string[]
  postNames: string[]
}

// ─── 角色管理 ───────────────────────────────────────

export type RoleStatus = 'ENABLED' | 'DISABLED'
export type RoleType = 'BUILT_IN' | 'CUSTOM'
export type DataScope = 'ALL' | 'DEPT' | 'DEPT_AND_CHILD' | 'SELF' | 'CUSTOM'

export interface RoleResp {
  id: string
  code: string
  name: string
  roleSort: number
  dataScope: DataScope
  dataScopeDeptIds: string[]
  dataScopeDeptNames: string[]
  status: RoleStatus
  roleType: RoleType
  menuIds: string[]
  remark: string | null
  createdAt: string
  updatedAt: string
}

// ─── 菜单管理 ───────────────────────────────────────

export type MenuType = 'DIRECTORY' | 'MENU' | 'BUTTON'
export type MenuStatus = 'ENABLED' | 'DISABLED'

export interface MenuResp {
  id: string
  parentId: string | null
  type: MenuType
  name: string
  orderNum: number
  path: string | null
  component: string | null
  queryParams: string | null
  isFrame: boolean
  isCache: boolean
  permissionCode: string | null
  visible: boolean
  status: MenuStatus
  icon: string | null
  remark: string | null
  createdAt: string
  updatedAt: string
  children?: MenuResp[]
}

// ─── 部门管理 ───────────────────────────────────────

export type DeptStatus = 'ENABLED' | 'DISABLED'

export interface DeptResp {
  id: string
  parentId: string | null
  deptName: string
  deptCode: string | null
  orderNum: number
  leaderUserId: string | null
  leaderUserName: string | null
  phone: string | null
  email: string | null
  status: DeptStatus
  createdAt: string
  updatedAt: string
  children?: DeptResp[]
}

// ─── 岗位管理 ───────────────────────────────────────

export type PostStatus = 'ENABLED' | 'DISABLED'

export interface PostResp {
  id: string
  postCode: string
  postName: string
  orderNum: number
  status: PostStatus
  remark: string | null
  createdAt: string
  updatedAt: string
}
