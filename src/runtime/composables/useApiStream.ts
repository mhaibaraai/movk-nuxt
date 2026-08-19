import type { Ref } from 'vue'
import type { ApiError, ApiStreamStatus, UseApiStreamOptions } from '../types/api'
import { onScopeDispose, ref } from 'vue'
import { useNuxtApp } from '#app'
import { isAbortError } from '../domains/api/stream'

/**
 * SSE 流式请求 composable（仅客户端）
 *
 * @description `$api.stream()` 的响应式外壳，复用端点、鉴权、业务码校验与 toast：
 *  - 重新发起会自动中止上一条流，作用域销毁时同样中止
 *  - 主动中止不计入错误态（`status` 置 `'aborted'`，`error` 保持 null），其余错误在置态后继续抛出
 *  - 返回的是惰性生成器，开始迭代才真正发起请求
 *
 * @example
 * ```ts
 * const { status, error, stream, abort } = useApiStream<{ content: string }>()
 *
 * for await (const chunk of stream('/api/chat', { method: 'POST', body: { message: '你好' } })) {
 *   text.value += chunk.content
 * }
 * ```
 */
export function useApiStream<T = unknown>(): {
  /** 流式请求状态 */
  status: Ref<ApiStreamStatus>
  /** 错误信息；主动中止不写入 */
  error: Ref<ApiError | Error | null>
  /** 发起流式请求，逐条产出分片 */
  stream: (url: string, options?: UseApiStreamOptions<T>) => AsyncGenerator<T>
  /** 中止当前流 */
  abort: () => void
} {
  const { $api } = useNuxtApp()

  const status = ref<ApiStreamStatus>('idle')
  const error = ref<ApiError | Error | null>(null)

  let controller: AbortController | null = null

  const abort = (): void => {
    controller?.abort()
    controller = null
  }

  async function* stream(
    url: string,
    options: UseApiStreamOptions<T> = {}
  ): AsyncGenerator<T> {
    const { endpoint, onError, signal, ...streamOptions } = options

    abort()
    controller = new AbortController()
    signal?.addEventListener('abort', abort, { once: true })

    status.value = 'streaming'
    error.value = null

    const api = endpoint ? $api.use(endpoint) : $api

    try {
      const chunks = await api.stream<T>(url, { ...streamOptions, signal: controller.signal })

      for await (const chunk of chunks) {
        yield chunk
      }

      status.value = 'success'
    }
    catch (cause: unknown) {
      if (isAbortError(cause)) {
        status.value = 'aborted'
        return
      }

      const streamError = cause instanceof Error ? cause : new Error('流式请求失败')

      error.value = streamError
      status.value = 'error'
      onError?.(streamError)

      throw streamError
    }
    finally {
      controller = null
    }
  }

  onScopeDispose(abort, true)

  return { status, error, stream, abort }
}
