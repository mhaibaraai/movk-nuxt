import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai'

const rawMock = vi.fn()
const $api = { raw: rawMock, use: (_endpoint: string) => $api }

vi.mock('#app', () => ({
  useNuxtApp: () => ({ $api })
}))

const { createChatTransport } = await import('../../../src/runtime/domains/ai/chat-transport')

interface Raw {
  content?: string
  node?: string
  done?: boolean
}

function sseResponse(...chunks: Raw[]): { ok: boolean, body: ReadableStream<Uint8Array> } {
  const encoder = new TextEncoder()

  return {
    ok: true,
    body: new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
        }
        controller.close()
      }
    })
  }
}

async function send(transport: ChatTransport<UIMessage>): Promise<UIMessageChunk[]> {
  const stream = await transport.sendMessages({
    chatId: 'chat-1',
    messages: [{ id: 'm1', role: 'user', parts: [{ type: 'text', text: '开始' }] }],
    trigger: 'submit-message'
  } as Parameters<ChatTransport<UIMessage>['sendMessages']>[0])

  const chunks: UIMessageChunk[] = []
  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return chunks
}

describe('createChatTransport', () => {
  beforeEach(() => {
    rawMock.mockReset()
  })

  it('响应流按 select 映射成 UIMessageChunk', async () => {
    rawMock.mockResolvedValue(sseResponse({ node: 'a', content: '你' }, { node: 'a', content: '好', done: true }))

    const transport = createChatTransport<Raw>({
      api: '/chat',
      select: raw => ({ id: raw.node, delta: raw.content, finished: raw.done })
    })

    await expect(send(transport)).resolves.toEqual([
      { type: 'start' },
      { type: 'start-step' },
      { type: 'text-start', id: 'a' },
      { type: 'text-delta', id: 'a', delta: '你' },
      { type: 'text-delta', id: 'a', delta: '好' },
      { type: 'text-end', id: 'a' },
      { type: 'finish-step' },
      { type: 'finish' }
    ])
  })

  it('默认经 $api 发请求，不预设 Accept 与 responseType', async () => {
    rawMock.mockResolvedValue(sseResponse())

    const transport = createChatTransport<Raw>({ api: '/chat', select: () => undefined })
    await send(transport)

    const [url, init] = rawMock.mock.calls[0]!

    expect(url).toBe('/chat')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(init.responseType).toBeUndefined()
  })

  it('prepareSendMessagesRequest 可异步改写 api 与 body', async () => {
    rawMock.mockResolvedValue(sseResponse())

    const transport = createChatTransport<Raw>({
      api: '/chat',
      prepareSendMessagesRequest: async ({ messages }) => ({
        api: `/chat/${messages.length}`,
        body: { message: '开始检测' }
      }),
      select: () => undefined
    })

    await send(transport)

    const [url, init] = rawMock.mock.calls[0]!

    expect(url).toBe('/chat/1')
    expect(JSON.parse(init.body as string)).toEqual({ message: '开始检测' })
  })

  it('调用方自带 fetch 时不再注入 $api', async () => {
    const customFetch = vi.fn(async () => sseResponse() as unknown as Response)

    const transport = createChatTransport<Raw>({ api: '/chat', fetch: customFetch, select: () => undefined })
    await send(transport)

    expect(customFetch).toHaveBeenCalled()
    expect(rawMock).not.toHaveBeenCalled()
  })
})
