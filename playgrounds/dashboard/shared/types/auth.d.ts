declare module '#auth-utils' {
  interface User {
    email: string
  }

  interface SecureSessionData {
  }

  interface UserSession {
    jwt: {
      /** 访问令牌过期时间（ISO 8601 字符串） */
      expires_at: string
      /** 刷新令牌过期时间（ISO 8601 字符串） */
      refresh_expires_at: string
      /** 是否勾选「记住我」 */
      remember_me: boolean
    } & LoginPayload
    logged_in_at: number
  }
}

export {}
