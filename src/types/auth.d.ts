declare module '#auth-utils' {
  interface User {
    // Add your own fields
  }

  interface UserSession {
    /**
     * Session ID
     */
    id?: string
    /**
     * User session data, available on client and server
     */
    user?: User
    /**
     * Private session data, only available on server/ code
     */
    secure?: SecureSessionData
    /**
     * 认证 Token
     */
    token?: string
    /**
     * Extra session data, available on client and server
     */
    [key: string]: unknown
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export { }
