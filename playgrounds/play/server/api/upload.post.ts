export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  await new Promise(r => setTimeout(r, 300))

  const files = (form || [])
    .filter(f => f.filename)
    .map(f => ({
      name: f.filename,
      type: f.type,
      size: f.data.length
    }))

  return {
    code: 200,
    message: 'uploaded',
    data: { files }
  }
})
