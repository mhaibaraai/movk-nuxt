export interface UserCreateReq {
  username: string
  password: string
  nickname?: string
  email?: string
  phone?: string
  gender?: 'UNKNOWN' | 'MALE' | 'FEMALE'
  avatar?: string
  status?: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'DELETED'
  deptId?: string
  roleIds?: string[]
  postIds?: string[]
  remark?: string
}

export interface UserUpdateReq {
  nickname?: string
  email?: string
  phone?: string
  gender?: 'UNKNOWN' | 'MALE' | 'FEMALE'
  avatar?: string
  status?: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'DELETED'
  deptId?: string
  roleIds?: string[]
  postIds?: string[]
  remark?: string
}

export interface ResetPasswordReq {
  userId: string
  newPassword: string
}

export interface UserListQuery {
  username?: string
  nickname?: string
  phone?: string
  email?: string
  status?: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'DELETED'
  deptId?: string
  createdAtStart?: string
  createdAtEnd?: string
  page?: number
  size?: number
}
