export default defineEventHandler(async () => {
  await new Promise(r => setTimeout(r, 200))

  return {
    code: 200,
    message: 'ok',
    data: {
      id: 'v2-me',
      displayName: 'Movk Demo (v2)',
      email: 'demo@movk.dev',
      version: 'v2',
      capabilities: ['streaming', 'graphql'],
      issuedAt: new Date().toISOString()
    }
  }
})
