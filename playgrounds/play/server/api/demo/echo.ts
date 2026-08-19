export default defineEventHandler(async (event) => {
  await new Promise(r => setTimeout(r, 200))

  return {
    code: 200,
    message: `${event.method} 请求完成`,
    data: {
      method: event.method,
      at: new Date().toISOString()
    }
  }
})
