export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { code: 200, message: 'logout ok', data: null }
})
