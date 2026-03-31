import type { LoginPayload } from '#shared/types/auth'
import type { SessionConfig } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email: string
    loginPayload: LoginPayload
    rememberMe: boolean
    config?: Partial<SessionConfig>
  }>(event)

  if (!process.env.NUXT_SESSION_PASSWORD) {
    throw createError({
      status: 500,
      statusText: 'Session secret not configured'
    })
  }

  await setUserSession(event, {
    user: {
      email: body.email
    },
    jwt: {
      ...body.loginPayload,
      expires_at: new Date(Date.now() + body.loginPayload.expires_in * 1000).toISOString(),
      refresh_expires_at: new Date(Date.now() + body.loginPayload.refresh_expires_in * 1000).toISOString(),
      remember_me: body.rememberMe
    },
    logged_in_at: Date.now()
  }, body.config || {})

  return {
    accessToken: body.loginPayload.access_token,
    refreshToken: body.loginPayload.refresh_token
  }
})
