export interface UserListQuery {
  username?: string
  nickname?: string
  phone?: string
  email?: string
  status?: UserStatus
  deptId?: string
  createdAtStart?: string
  createdAtEnd?: string
  page?: number
  size?: number
}
