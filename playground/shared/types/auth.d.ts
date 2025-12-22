declare module '#auth-utils' {
  interface User {
    /** 用户 ID（UUID） */
    id: string
    /** 用户名（唯一） */
    username: string
    /** 昵称 */
    nickname?: string | null
    /** 邮箱 */
    email?: string | null
    /** 手机号 */
    phone?: string | null
    /** 性别 */
    gender?: 'UNKNOWN' | 'MALE' | 'FEMALE'
    /** 头像 URL */
    avatar?: string | null
    /** 账号状态 */
    status?: 'ACTIVE' | 'DISABLED' | 'LOCKED' | 'DELETED'
    /** 部门 ID（UUID） */
    deptId?: string | null
    /** 部门名称 */
    deptName?: string | null
    /** 最后登录 IP */
    loginIp?: string | null
    /** 最后登录时间（ISO 8601 字符串） */
    loginDate?: string | null
    /** 备注 */
    remark?: string | null
    /** 创建时间（ISO 8601 字符串） */
    createdAt?: string | null
    /** 更新时间（ISO 8601 字符串） */
    updatedAt?: string | null
    /** 角色列表（可选） */
    roles?: string[]
    /** 权限列表（可选） */
    permissions?: string[]
  }

  interface UserSession {
    token?: string
  }

  interface SecureSessionData {
  }
}

export { }
