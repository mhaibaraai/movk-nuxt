import { defineEventHandler, readBody, createError } from 'h3'

/**
 * 用于登录成功后设置完整的 session 数据
 * POST /api/_movk/session
 *
 * @body UserSession
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body'
    })
  }

  if (!body.user || typeof body.user !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'User data is required'
    })
  }

  // 设置 session
  await setUserSession(event, body)

  return { success: true }
})
