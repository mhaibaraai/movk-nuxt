export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const authHeader = getHeader(event, 'authorization') || ''
  await new Promise(r => setTimeout(r, 200))

  return {
    code: 200,
    message: 'ok',
    data: {
      user: session.user,
      authHeader,
      checkedAt: new Date().toISOString()
    }
  }
})
