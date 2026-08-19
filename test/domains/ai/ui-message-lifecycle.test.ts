import { describe, expect, it } from 'vitest'
import type { UIMessageChunk } from 'ai'
import type { UIChunkSelector } from '../../../src/runtime/domains/ai/types'
import { iterateStream } from '../../../src/runtime/domains/api/stream'
import { createUIMessageLifecycle } from '../../../src/runtime/domains/ai/ui-message-lifecycle'

interface Raw {
  node?: string
  content?: string
  nodeEnd?: boolean
  done?: boolean
}

const select: UIChunkSelector<Raw> = raw => ({
  id: raw.node,
  delta: raw.content,
  end: raw.nodeEnd,
  finished: raw.done
})

async function run(raws: Raw[], selector: UIChunkSelector<Raw> = select): Promise<UIMessageChunk[]> {
  const source = new ReadableStream<Raw>({
    start(controller) {
      for (const raw of raws) {
        controller.enqueue(raw)
      }
      controller.close()
    }
  })

  const chunks: UIMessageChunk[] = []

  for await (const chunk of iterateStream(source.pipeThrough(createUIMessageLifecycle(selector)))) {
    chunks.push(chunk)
  }

  return chunks
}

describe('createUIMessageLifecycle', () => {
  it('单块文本走完整生命周期', async () => {
    const chunks = await run([
      { node: 'a', content: '你' },
      { node: 'a', content: '好' },
      { node: 'a', nodeEnd: true },
      { done: true }
    ])

    expect(chunks).toEqual([
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

  it('多个 id 交错时各自开合文本块', async () => {
    const chunks = await run([
      { node: 'a', content: '甲' },
      { node: 'b', content: '乙' },
      { node: 'a', content: '丙' },
      { node: 'b', nodeEnd: true },
      { node: 'a', nodeEnd: true }
    ])

    expect(chunks.filter(chunk => chunk.type === 'text-start')).toEqual([
      { type: 'text-start', id: 'a' },
      { type: 'text-start', id: 'b' }
    ])
    expect(chunks.filter(chunk => chunk.type === 'text-end')).toEqual([
      { type: 'text-end', id: 'b' },
      { type: 'text-end', id: 'a' }
    ])
  })

  it('后端不发结束信号时，flush 补齐未关闭的文本块与 finish', async () => {
    const chunks = await run([{ node: 'a', content: '甲' }])

    expect(chunks.slice(-3)).toEqual([
      { type: 'text-end', id: 'a' },
      { type: 'finish-step' },
      { type: 'finish' }
    ])
  })

  it('finished 之后的分片被忽略，finish 只出现一次', async () => {
    const chunks = await run([
      { node: 'a', content: '甲' },
      { done: true },
      { node: 'a', content: '乙' }
    ])

    expect(chunks.filter(chunk => chunk.type === 'finish')).toHaveLength(1)
    expect(chunks.filter(chunk => chunk.type === 'text-delta')).toEqual([
      { type: 'text-delta', id: 'a', delta: '甲' }
    ])
  })

  it('未指定 id 时并入默认文本块', async () => {
    const chunks = await run([{ content: '甲' }, { content: '乙' }])

    expect(chunks.filter(chunk => chunk.type === 'text-start')).toEqual([
      { type: 'text-start', id: 'text-1' }
    ])
  })

  it('data 片按 data-${type} 产出并透传 transient', async () => {
    const chunks = await run(
      [{ node: 'a' }],
      raw => ({ data: { type: 'node', value: { node: raw.node }, transient: true } })
    )

    expect(chunks[2]).toEqual({ type: 'data-node', data: { node: 'a' }, transient: true })
  })

  it('select 返回 undefined 的分片不产出片段，空流仍给出完整生命周期', async () => {
    await expect(run([{ content: '甲' }, { content: '乙' }], () => undefined)).resolves.toEqual([
      { type: 'start' },
      { type: 'start-step' },
      { type: 'finish-step' },
      { type: 'finish' }
    ])
  })
})
