export default defineEventHandler(async (event) => {
  await new Promise(r => setTimeout(r, 200))

  const token = `demo-jwt-${Math.random().toString(36).slice(2, 10)}`

  await setUserSession(event, {
    user: { id: 'me', name: 'Movk Demo' },
    token,
    loggedInAt: new Date().toISOString()
  })

  return {
    code: 200,
    message: 'login ok',
    data: { token }
  }
})
