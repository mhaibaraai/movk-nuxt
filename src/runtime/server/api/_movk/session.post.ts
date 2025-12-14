import { defineEventHandler, readBody, createError } from 'h3'

/**
 * 设置用户 Session
 *
 * POST /api/_movk/session
 *
 * 用于登录成功后设置完整的 session 数据，
 * 包括用户信息和 token（存储在 secure 中）。
 *
 * @body { user: Record<string, unknown>, secure?: Record<string, unknown>, loggedInAt?: string }
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
