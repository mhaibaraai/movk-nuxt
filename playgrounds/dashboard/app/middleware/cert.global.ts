import { appendResponseHeader } from 'h3'
import { parse, parseSetCookie, serialize } from 'cookie-es'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isHydrating, payload, $api } = useNuxtApp()
  if (import.meta.client && isHydrating && payload.serverRendered) return

  const { cert } = useRuntimeConfig().public
  if (!cert.enabled) return

  const { session, clear: clearSession, loggedIn, fetch: fetchSession } = useUserSession()
  const path = to.path

  // 已登录用户访问登录页 → 重定向首页
  if (loggedIn.value && path === cert.loginPath) return navigateTo('/', { redirectCode: 301 })

  // 公开路由放行（loginPath 自动包含）
  const isPublic = [cert.loginPath, ...(cert.publicRoutes || [])].some((route: string) =>
    route.endsWith('/*')
      ? path.startsWith(route.slice(0, -2))
      : path === route
  )
  if (isPublic) return

  // 未登录用户 → 重定向登录页
  if (!session.value?.jwt) return navigateTo(cert.loginPath)

  const { expires_at, refresh_expires_at, refresh_token } = session.value.jwt

  if (isExpired(expires_at) && isExpired(refresh_expires_at)) {
    await clearSession()
    return navigateTo(cert.loginPath)
  } else if (isExpired(expires_at)) {
    const data = await $api<LoginPayload>('/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken: refresh_token }
    })

    if (!data) {
      throw createError({
        status: 500,
        statusText: 'Failed to refresh token'
      })
    }

    const serverEvent = useRequestEvent()
    const runtimeConfig = useRuntimeConfig()

    await useRequestFetch()('/api/jwt/refresh', {
      method: 'POST',
      body: {
        access_token: data.access_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        refresh_expires_at: new Date(Date.now() + data.refresh_expires_in * 1000).toISOString()
      },
      onResponse({ response: { headers } }) {
        if (import.meta.server && serverEvent) {
          forwardSessionCookies(serverEvent, headers, runtimeConfig.session.name)
        }
      }
    })

    await fetchSession()
  }

  // 用户已认证，确保 currentUser 已填充（页面刷新场景）
  const { currentUser, fetchCurrentUser } = useCurrentUser()
  if (!currentUser.value) {
    await fetchCurrentUser()
  }
})

function isExpired(exp: string) {
  return exp ? new Date(exp).getTime() < Date.now() : true
}

// SSR 场景：将子请求的 Set-Cookie 转发到主响应，否则浏览器永远收不到新 session cookie
function forwardSessionCookies(
  event: ReturnType<typeof useRequestEvent>,
  headers: Headers,
  sessionName: string
) {
  if (!event) return
  for (const setCookieStr of headers.getSetCookie()) {
    appendResponseHeader(event, 'Set-Cookie', setCookieStr)
    const { name, value } = parseSetCookie(setCookieStr)
    if (name !== sessionName) continue
    const cookies = parse(event.headers.get('cookie') || '')
    cookies[name] = value
    const cookieHeader = Object.entries(cookies).map(([n, v]) => serialize(n, v)).join('; ')
    event.headers.set('cookie', cookieHeader)
    if (event.node?.req?.headers) {
      event.node.req.headers['cookie'] = cookieHeader
    }
  }
}
