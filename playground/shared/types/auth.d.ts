declare module '#auth-utils' {
  interface User {
    /** 用户 ID */
    id: string
    /** 用户名 */
    username: string
    /** 昵称 */
    nickname: string
    /** 邮箱 */
    email: string
    /** 手机号 */
    phone: string
    /** 角色列表 */
    roles?: string[]
    /** 权限标识列表 */
    permissions?: string[]
  }

  interface UserSession {
    token?: string
  }

  interface SecureSessionData {
  }
}

export {}
