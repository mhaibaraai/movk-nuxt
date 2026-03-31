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
