import { describe, expect, it, vi } from 'vitest'
import { readWithProgress, resolveFilename } from '../../../src/runtime/domains/api/download'

function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(chunk))
      controller.close()
    }
  })
}

describe('domains/api/download', () => {
  describe('resolveFilename', () => {
    it('override 优先级最高', () => {
      const headers = new Headers({ 'content-disposition': 'attachment; filename="a.bin"' })
      expect(resolveFilename(headers, '/x/b.bin', 'c.bin')).toBe('c.bin')
    })

    it('无 override 时取 content-disposition', () => {
      const headers = new Headers({ 'content-disposition': 'attachment; filename="a.bin"' })
      expect(resolveFilename(headers, '/x/b.bin')).toBe('a.bin')
    })

    it('无 header 时回退到 URL pathname 末段（去除 query）', () => {
      expect(resolveFilename(new Headers(), '/x/report.pdf?t=1')).toBe('report.pdf')
    })

    it('全部缺失时回退到 download', () => {
      expect(resolveFilename(new Headers(), '/')).toBe('download')
    })
  })

  describe('readWithProgress', () => {
    it('按已知总量汇报进度并拼接为 Blob', async () => {
      const onProgress = vi.fn()

      const blob = await readWithProgress(streamOf([new Uint8Array([1, 2]), new Uint8Array([3, 4])]), 4, onProgress, 'application/pdf')

      expect(onProgress.mock.calls.map(([p]) => p)).toEqual([50, 100])
      expect(blob.size).toBe(4)
      expect(blob.type).toBe('application/pdf')
    })

    it('总量未知时进度为 null', async () => {
      const onProgress = vi.fn()

      await readWithProgress(streamOf([new Uint8Array([1])]), 0, onProgress)

      expect(onProgress.mock.calls).toEqual([[null]])
    })
  })
})
