import { beforeEach, describe, expect, it, vi } from 'vitest'

const streamMock = vi.fn()
const v2StreamMock = vi.fn()

const v2Instance = { stream: v2StreamMock }
const defaultInstance = {
  stream: streamMock,
  use: (endpoint: string) => (endpoint === 'v2' ? v2Instance : defaultInstance)
}

vi.mock('#app', () => ({
  useNuxtApp: () => ({ $api: defaultInstance })
}))

const { useApiStream } = await import('../../src/runtime/composables/useApiStream')

async function* emit<T>(...chunks: T[]): AsyncGenerator<T> {
  for (const chunk of chunks) {
    yield chunk
  }
}

async function collect<T>(source: AsyncGenerator<T>): Promise<T[]> {
  const chunks: T[] = []

  for await (const chunk of source) {
    chunks.push(chunk)
  }

  return chunks
}

describe('useApiStream', () => {
  beforeEach(() => {
    streamMock.mockReset()
    v2StreamMock.mockReset()
  })

  it('逐条产出分片，结束后状态置为 success', async () => {
    streamMock.mockResolvedValue(emit({ content: '甲' }, { content: '乙' }))

    const { status, error, stream } = useApiStream<{ content: string }>()

    expect(status.value).toBe('idle')

    await expect(collect(stream('/chat'))).resolves.toEqual([{ content: '甲' }, { content: '乙' }])
    expect(status.value).toBe('success')
    expect(error.value).toBeNull()
  })

  it('把 signal 之外的选项透传给 $api.stream', async () => {
    streamMock.mockResolvedValue(emit())

    const { stream } = useApiStream()
    await collect(stream('/chat', { method: 'POST', body: { message: '你好' } }))

    const [url, options] = streamMock.mock.calls[0]!

    expect(url).toBe('/chat')
    expect(options).toMatchObject({ method: 'POST', body: { message: '你好' } })
    expect(options.signal).toBeInstanceOf(AbortSignal)
  })

  it('endpoint 选项切到对应端点实例', async () => {
    v2StreamMock.mockResolvedValue(emit({ content: '丙' }))

    const { stream } = useApiStream<{ content: string }>()

    await expect(collect(stream('/chat', { endpoint: 'v2' as never }))).resolves.toEqual([{ content: '丙' }])
    expect(streamMock).not.toHaveBeenCalled()
  })

  it('主动中止不计入错误态', async () => {
    streamMock.mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }))

    const { status, error, stream } = useApiStream()

    await expect(collect(stream('/chat'))).resolves.toEqual([])
    expect(status.value).toBe('aborted')
    expect(error.value).toBeNull()
  })

  it('其余错误置态、回调后继续抛出', async () => {
    const failure = new Error('网关炸了')
    streamMock.mockRejectedValue(failure)

    const onError = vi.fn()
    const { status, error, stream } = useApiStream()

    await expect(collect(stream('/chat', { onError }))).rejects.toThrow('网关炸了')
    expect(status.value).toBe('error')
    expect(error.value).toBe(failure)
    expect(onError).toHaveBeenCalledWith(failure)
  })

  it('abort() 中止进行中的流', async () => {
    let signal: AbortSignal | undefined

    streamMock.mockImplementation(async (_url: string, options: { signal: AbortSignal }) => {
      signal = options.signal
      return emit({ content: '甲' }, { content: '乙' })
    })

    const { stream, abort } = useApiStream<{ content: string }>()
    const chunks = stream('/chat')

    await chunks.next()
    abort()

    expect(signal?.aborted).toBe(true)
  })
})
