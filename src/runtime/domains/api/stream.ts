import type { $Fetch, NitroFetchOptions } from 'nitropack/types'
import type { EventSourceMessage } from 'eventsource-parser'
import type { ApiStreamOptions, EventStreamOptions } from '../../types/api/stream'
import { EventSourceParserStream } from 'eventsource-parser/stream'

/** OpenAI 系网关的结束哨兵；MaxKB 一类不发，靠读取结束收尾 */
const DONE_SENTINEL = '[DONE]'

function parseJson<T>(data: string): T | undefined {
  try {
    return JSON.parse(data) as T
  }
  catch {
    return undefined
  }
}

function describe(value: unknown): string {
  if (value === null || value === undefined) return String(value)
  if (typeof value === 'object') return (value as object).constructor?.name || 'Object'
  return typeof value
}

/**
 * 是否可读流
 *
 * @description 鸭子判定而非 `instanceof`：SSR 运行时不保证有 `ReadableStream` 全局
 */
export function isReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return typeof (value as ReadableStream | null | undefined)?.getReader === 'function'
}

/**
 * 中止判定
 *
 * @description 请求头到达前中止由 ofetch 包成 FetchError、原始错误落在 `cause` 上；
 *  流读取途中中止则由 reader 直接抛出。按 `name` 认而非 `instanceof DOMException`，
 *  Node 与浏览器抛出的类型不一致。
 */
export function isAbortError(error: unknown): boolean {
  const cause = error instanceof Error ? error.cause : undefined

  return hasAbortName(error) || hasAbortName(cause)
}

function hasAbortName(value: unknown): boolean {
  return typeof value === 'object' && value !== null && (value as { name?: string }).name === 'AbortError'
}

/**
 * 字节流 → SSE 事件 → 分片流
 *
 * @description 行缓冲、`data:` 多行拼接、注释行、`\r\n` 全部交给 `eventsource-parser`；
 *  本层只负责哨兵终止与 payload 解析，解析不了的事件静默丢弃（心跳、握手不该中断整条流）。
 */
export function toEventStream<T>(
  body: ReadableStream<Uint8Array>,
  options: EventStreamOptions<T> = {}
): ReadableStream<T> {
  const parse = options.parse ?? parseJson<T>

  // TextDecoderStream 的 DOM 类型把 writable 声明成 BufferSource，与 ReadableStream<Uint8Array> 对不上
  const decoder = new TextDecoderStream() as unknown as TransformStream<Uint8Array, string>

  return body
    .pipeThrough(decoder)
    .pipeThrough(new EventSourceParserStream())
    .pipeThrough(new TransformStream<EventSourceMessage, T>({
      transform(event, controller) {
        if (event.data === DONE_SENTINEL) {
          controller.terminate()
          return
        }

        const chunk = parse(event.data)

        if (chunk !== undefined) {
          controller.enqueue(chunk)
        }
      }
    }))
}

/**
 * 流 → 异步迭代器
 *
 * @description 不依赖 `ReadableStream` 自身的异步迭代（浏览器支持参差）；
 *  消费方提前跳出时取消上游，连带断开底层请求。
 */
export async function* iterateStream<T>(stream: ReadableStream<T>): AsyncGenerator<T> {
  const reader = stream.getReader()

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      yield value
    }
  }
  finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

/**
 * 补上 SSE 请求的 Accept
 *
 * @description ofetch 见到可 JSON 序列化的 body 就自动塞 `Accept: application/json`——
 *  对一条要当流读的请求，这个声明本身就是错的，按 Accept 做内容协商的后端可能据此改走 JSON 渲染器。
 *  但也不能反过来主动发 text/event-stream：实测 DRF 一类的内容协商会直接拒掉整个请求，
 *  返回「无法满足 Accept HTTP 头的请求」。通配 Accept 两头都不踩，调用方传了就以调用方为准。
 */
export function withStreamAccept(headers?: HeadersInit): Headers {
  const merged = new Headers(headers)

  if (!merged.has('accept')) {
    merged.set('accept', '*/*')
  }

  return merged
}

/**
 * 发起请求并取出 SSE 分片流
 *
 * @description 走 `$fetch.raw` 而非原生 fetch：端点 baseURL、鉴权头、业务码校验、toast 与
 *  `movk:api:*` hook 全部复用。响应是流时拦截器已短路，不会拿流去做 `{ code, data }` 解包。
 */
export async function openEventStream<T>(
  $fetch: $Fetch,
  url: string,
  options: ApiStreamOptions<T> = {}
): Promise<AsyncGenerator<T>> {
  const { parse, headers, ...fetchOptions } = options
  // ofetch 的 FetchOptions 把 method 放宽成 string，nitro 侧要求字面量联合，此处只做类型收窄
  const response = await $fetch.raw(url, {
    ...fetchOptions,
    headers: withStreamAccept(headers)
  } as NitroFetchOptions<string>)
  const body = response._data

  if (!isReadableStream(body)) {
    throw new Error(
      `[@movk/nuxt] 期望 SSE 流，实际收到 ${describe(body)}。`
      + '请确认接口返回 text/event-stream，或显式传 responseType: \'stream\''
    )
  }

  return iterateStream(toEventStream<T>(body, { parse }))
}
