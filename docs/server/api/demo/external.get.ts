export default defineEventHandler(async () => {
  await new Promise(r => setTimeout(r, 200))

  return {
    result: {
      id: 'ext-001',
      provider: 'third-party',
      payload: { value: 42 }
    },
    ts: Date.now()
  }
})
