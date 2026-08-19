import { describe, expect, it, vi } from 'vitest'
import type { $Fetch } from 'nitropack/types'
import {
  isAbortError,
  isReadableStream,
  iterateStream,
  openEventStream,
  toEventStream
} from '../../../src/runtime/domains/api/stream'

interface Chunk {
  content: string
}

function byteStream(...pieces: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    start(controller) {
      for (const piece of pieces) {
        controller.enqueue(encoder.encode(piece))
      }
      controller.close()
    }
  })
}

async function collect<T>(source: AsyncGenerator<T>): Promise<T[]> {
  const chunks: T[] = []

  for await (const chunk of source) {
    chunks.push(chunk)
  }

  return chunks
}

function read<T>(...pieces: string[]): Promise<T[]> {
  return collect(iterateStream(toEventStream<T>(byteStream(...pieces))))
}

function sse(chunk: Chunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`
}

describe('toEventStream', () => {
  it('剥掉 data: 前缀，逐条产出分片', async () => {
    await expect(read<Chunk>(sse({ content: '甲' }), sse({ content: '乙' })))
      .resolves.toEqual([{ content: '甲' }, { content: '乙' }])
  })

  it('跨读取边界的半行留在缓冲里，收齐后才吐出', async () => {
    const line = sse({ content: '丙' })
    const cut = Math.floor(line.length / 2)

    await expect(read<Chunk>(line.slice(0, cut), line.slice(cut)))
      .resolves.toEqual([{ content: '丙' }])
  })

  it('注释行、空行与解析不了的行静默跳过，不中断整条流', async () => {
    const input = [
      ': keep-alive\n\n',
      'data: not-json\n\n',
      '\n',
      sse({ content: '丁' })
    ]

    await expect(read<Chunk>(...input)).resolves.toEqual([{ content: '丁' }])
  })

  it('多行 data 按 SSE 规范拼成一条', async () => {
    await expect(read<Chunk>('data: {"content":\ndata: "戊"}\n\n'))
      .resolves.toEqual([{ content: '戊' }])
  })

  it('[DONE] 哨兵终止，其后的分片不再产出', async () => {
    await expect(read<Chunk>(sse({ content: '己' }), 'data: [DONE]\n\n', sse({ content: '庚' })))
      .resolves.toEqual([{ content: '己' }])
  })

  it('自定义 parse 覆盖默认 JSON 解析', async () => {
    const stream = toEventStream<string>(byteStream('data: 辛\n\n'), { parse: data => data })

    await expect(collect(iterateStream(stream))).resolves.toEqual(['辛'])
  })
})

describe('openEventStream', () => {
  function fakeFetch(data: unknown): $Fetch {
    return { raw: vi.fn(async () => ({ _data: data })) } as unknown as $Fetch
  }

  it('响应体是流时产出分片', async () => {
    const $fetch = fakeFetch(byteStream(sse({ content: '壬' })))

    await expect(collect(await openEventStream<Chunk>($fetch, '/chat')))
      .resolves.toEqual([{ content: '壬' }])
  })

  it('响应体不是流时抛出可读错误', async () => {
    const $fetch = fakeFetch({ code: 200, data: null })

    await expect(openEventStream($fetch, '/chat')).rejects.toThrow(/期望 SSE 流/)
  })

  it('parse 之外的选项原样交给 $fetch.raw', async () => {
    const $fetch = fakeFetch(byteStream())

    await openEventStream<Chunk>($fetch, '/chat', { method: 'POST', body: { a: 1 }, parse: () => undefined })

    const [url, options] = vi.mocked($fetch.raw).mock.calls[0]!

    expect(url).toBe('/chat')
    expect(options).toMatchObject({ method: 'POST', body: { a: 1 } })
  })

  it('默认发通配 Accept，挡掉 ofetch 自动塞的 application/json', async () => {
    const $fetch = fakeFetch(byteStream())

    await openEventStream<Chunk>($fetch, '/chat', { method: 'POST', body: { a: 1 } })

    const [, options] = vi.mocked($fetch.raw).mock.calls[0]!

    expect((options!.headers as Headers).get('accept')).toBe('*/*')
  })

  it('调用方传了 Accept 就以调用方为准', async () => {
    const $fetch = fakeFetch(byteStream())

    await openEventStream<Chunk>($fetch, '/chat', { headers: { Accept: 'text/event-stream' } })

    const [, options] = vi.mocked($fetch.raw).mock.calls[0]!

    expect((options!.headers as Headers).get('accept')).toBe('text/event-stream')
  })
})

describe('isReadableStream / isAbortError', () => {
  it('按 getReader 鸭子判定可读流', () => {
    expect(isReadableStream(byteStream())).toBe(true)
    expect(isReadableStream({ code: 200 })).toBe(false)
    expect(isReadableStream(null)).toBe(false)
  })

  it('直接抛出的 AbortError 与挂在 cause 上的都认', () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' })

    expect(isAbortError(abort)).toBe(true)
    expect(isAbortError(new Error('failed', { cause: abort }))).toBe(true)
    expect(isAbortError(new Error('failed'))).toBe(false)
  })
})
