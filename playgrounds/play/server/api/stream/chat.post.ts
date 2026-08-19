interface ChatBody {
  message?: string
}

/** 模拟 LLM 网关：按节点分块吐字，最后一条带 done */
export default defineEventHandler(async (event) => {
  const { message = '你好' } = await readBody<ChatBody>(event) || {}

  setHeader(event, 'content-type', 'text/event-stream')
  setHeader(event, 'cache-control', 'no-cache')

  const nodes = [
    { node: 'greeting', text: `收到：${message}` },
    { node: 'answer', text: '这是一段流式回复，逐字到达。' }
  ]

  const encoder = new TextEncoder()
  const send = (chunk: object) => encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)

  return new ReadableStream({
    async start(controller) {
      for (const { node, text } of nodes) {
        for (const char of text) {
          controller.enqueue(send({ node, content: char, nodeEnd: false, done: false }))
          await new Promise(resolve => setTimeout(resolve, 40))
        }
        controller.enqueue(send({ node, content: '', nodeEnd: true, done: false }))
      }

      controller.enqueue(send({ node: 'answer', content: '', nodeEnd: true, done: true }))
      controller.close()
    }
  })
})
