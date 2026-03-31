import type { UserSession } from '#auth-utils'

export default defineEventHandler(async (event) => {
  const jwt = await readBody<UserSession['jwt']>(event)

  await setUserSession(event, {
    jwt,
    logged_in_at: Date.now()
  })

  return jwt
})
