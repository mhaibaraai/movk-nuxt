import type { useNuxtApp } from '#imports'
import { useUserSession } from '#build/movk-session'

/** movk 用到的 nuxt-auth-utils 会话能力子集 */
interface UserSessionLike {
  session?: { value?: unknown }
  clear?: () => Promise<void>
  fetch?: () => Promise<void>
}

/** 未安装 nuxt-auth-utils 或不在可用上下文中时返回 null */
export function getUserSession(nuxtApp: ReturnType<typeof useNuxtApp>): UserSessionLike | null {
  if (!useUserSession) return null

  try {
    return nuxtApp.vueApp.runWithContext(useUserSession) as UserSessionLike
  }
  catch {
    return null
  }
}
