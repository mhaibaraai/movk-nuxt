export default defineEventHandler(async () => {
  await new Promise(r => setTimeout(r, 200))

  // 故意省略 code 字段，模拟 legacy 接口
  return {
    message: 'legacy ok',
    data: {
      id: 'legacy-001',
      label: '旧版接口数据',
      issuedAt: new Date().toISOString()
    }
  }
})
