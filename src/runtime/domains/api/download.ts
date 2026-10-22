import { extractFilename } from '@movk/core'

/**
 * 解析下载文件名
 * @description 优先级：override > content-disposition > URL pathname 末段 > 'download'
 */
export function resolveFilename(
  headers: Headers,
  url: string,
  override?: string
): string {
  if (override) return override

  const fromHeader = extractFilename(headers, '')
  if (fromHeader) return fromHeader

  try {
    const base = typeof location !== 'undefined' ? location.origin : 'http://localhost'
    const pathname = new URL(url, base).pathname
    const last = pathname.split('/').filter(Boolean).pop()
    if (last) return last
  }
  catch { /* fallthrough */ }

  return 'download'
}

/**
 * 逐块读取响应流并汇报进度
 * @description total 为预期字节数；未知（0）时 onProgress 收到 null
 */
export async function readWithProgress(
  stream: ReadableStream<Uint8Array>,
  total: number,
  onProgress: (percent: number | null) => void,
  type?: string
): Promise<Blob> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  if (total <= 0) onProgress(null)

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    if (total > 0) onProgress(Math.min(100, Math.round((received / total) * 100)))
  }

  return new Blob(chunks as BlobPart[], type ? { type } : undefined)
}
