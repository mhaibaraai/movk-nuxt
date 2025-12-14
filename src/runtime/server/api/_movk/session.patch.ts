import { defineEventHandler, readBody, createError } from 'h3'

/**
 * 更新用户 Session
 *
 * PATCH /api/_movk/session
 *
 * @body { user?: Record<string, unknown>, secure?: Record<string, unknown> }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body'
    })
  }

  // 获取现有 session
  const existingSession = await getUserSession(event)

  if (!existingSession) {
    throw createError({
      statusCode: 401,
      message: 'No active session'
    })
  }

  await replaceUserSession(event, body)

  return { success: true }
})
