import { defineEventHandler, readBody, createError } from 'h3'
// @ts-ignore setUserSession is auto-imported server function from nuxt-auth-utils
import { setUserSession } from '#imports'

/**
 * 用于登录成功后设置完整的 session 数据
 * POST /api/_movk/session
 *
 * @body { session: UserSession, config?: Partial<SessionConfig> }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body'
    })
  }

  const { session, config } = body

  if (!session || typeof session !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'Session data is required'
    })
  }

  if (!session.user || typeof session.user !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'User data is required'
    })
  }

  await setUserSession(event, session, config)

  return { success: true }
})
