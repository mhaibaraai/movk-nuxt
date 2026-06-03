export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  await new Promise(r => setTimeout(r, 300))

  if (query.fail === '1') {
    throw createError({ statusCode: 400, message: '主动注入的错误' })
  }

  return {
    code: 200,
    message: 'ok',
    data: {
      id: 'me',
      name: 'Movk Demo',
      email: 'demo@movk.dev',
      avatar: '/avatar.png',
      role: 'developer',
      issuedAt: new Date().toISOString()
    }
  }
})
