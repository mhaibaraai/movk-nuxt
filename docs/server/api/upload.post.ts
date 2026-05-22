export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const form = await readMultipartFormData(event)

  const slowMs = Number(query.slow || 0)
  await new Promise(r => setTimeout(r, slowMs > 0 ? slowMs : 300))

  const files = (form || [])
    .filter(f => f.filename)
    .map(f => ({
      name: f.filename,
      type: f.type,
      size: f.data.length
    }))

  if (query.fail === '1') {
    return {
      code: 40001,
      message: '文件类型不被允许',
      data: null
    }
  }

  if (query.http === '500') {
    setResponseStatus(event, 500)
    return { code: 500, message: '服务器错误', data: null }
  }

  return {
    code: 200,
    message: 'uploaded',
    data: { files }
  }
})
