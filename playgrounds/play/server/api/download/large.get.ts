export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/octet-stream')
  setHeader(event, 'content-disposition', 'attachment; filename="movk-demo.bin"')

  const chunkSize = 64 * 1024
  const totalChunks = 80
  setHeader(event, 'content-length', chunkSize * totalChunks)

  const chunk = new Uint8Array(chunkSize).fill(77)
  let sent = 0

  return new ReadableStream({
    async pull(controller) {
      if (sent >= totalChunks) {
        controller.close()
        return
      }
      controller.enqueue(chunk)
      sent++
      await new Promise(r => setTimeout(r, 50))
    }
  })
})
