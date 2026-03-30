export interface LoginPayload {
  /** 访问令牌 */
  access_token: string
  /** 刷新令牌 */
  refresh_token: string
  /** 令牌类型（通常为 Bearer） */
  token_type: string
  /** 访问令牌有效期（秒） */
  expires_in: number
  /** 刷新令牌有效期（秒） */
  refresh_expires_in: number
}

export interface AuthMePayload {
  id: string
  username: string
  nickname: string | null
  email: string | null
  phone: string | null
  gender?: 'UNKNOWN' | 'MALE' | 'FEMALE'
  avatar?: string | null
  status?: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'DELETED'
  deptId?: string | null
  deptName?: string | null
  loginIp?: string | null
  loginDate?: string | null
  remark?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  roles?: string[]
  permissions?: string[]
}
