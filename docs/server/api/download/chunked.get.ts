export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/octet-stream')
  setHeader(event, 'content-disposition', 'attachment; filename="movk-chunked.bin"')

  const chunkSize = 32 * 1024
  const totalChunks = 30
  const chunk = new Uint8Array(chunkSize).fill(67)
  let sent = 0

  return new ReadableStream({
    async pull(controller) {
      if (sent >= totalChunks) {
        controller.close()
        return
      }
      controller.enqueue(chunk)
      sent++
      await new Promise(r => setTimeout(r, 80))
    }
  })
})
