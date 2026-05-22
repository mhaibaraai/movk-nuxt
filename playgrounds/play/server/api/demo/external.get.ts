export default defineEventHandler(async () => {
  await new Promise(r => setTimeout(r, 200))

  // 非标准 envelope：result + ts，不符合 code/message/data 三件套
  return {
    result: {
      id: 'ext-001',
      provider: 'third-party',
      payload: { value: 42 }
    },
    ts: Date.now()
  }
})
