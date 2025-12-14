// Augment nuxt-auth-utils session types to include token field used by movk module
declare module '#auth-utils' {
  interface User {
    // Keep open for consumers to extend
    [key: string]: unknown
  }

  interface UserSession {
    /**
     * 认证 Token
     */
    token?: string
  }

  interface SecureSessionData {
    // 保留用于将来需要存放服务端私密数据的扩展
    [key: string]: unknown
  }
}

export {}
