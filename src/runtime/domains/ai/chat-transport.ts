import type { ChatTransport, HttpChatTransportInitOptions, UIMessage, UIMessageChunk } from 'ai'
import type { FetchOptions } from 'ofetch'
import type { ApiInstance, EventStreamOptions, MovkApiEndpointName } from '../../types/api'
import type { UIChunkSelector } from './types'
import { HttpChatTransport } from 'ai'
import { useNuxtApp } from '#app'
import { toEventStream } from '../api/stream'
import { createUIMessageLifecycle } from './ui-message-lifecycle'

/**
 * 传输层选项：在 AI SDK 的 `HttpChatTransportInitOptions` 之上补两件事——走哪个端点、分片怎么映射
 */
export type MovkChatTransportOptions<Raw, UI_MESSAGE extends UIMessage>
  = HttpChatTransportInitOptions<UI_MESSAGE>
    & EventStreamOptions<Raw>
    & {
      /** 使用的端点名称，默认走 defaultEndpoint */
      endpoint?: MovkApiEndpointName
      /** 后端分片 → UI 片段的纯映射 */
      select: UIChunkSelector<Raw>
    }

class MovkChatTransport<Raw, UI_MESSAGE extends UIMessage> extends HttpChatTransport<UI_MESSAGE> {
  private readonly select: UIChunkSelector<Raw>
  private readonly parse: EventStreamOptions<Raw>['parse']

  constructor(options: MovkChatTransportOptions<Raw, UI_MESSAGE>) {
    const { select, parse, endpoint: _endpoint, ...init } = options

    super(init)
    this.select = select
    this.parse = parse
  }

  protected processResponseStream(stream: ReadableStream<Uint8Array>): ReadableStream<UIMessageChunk> {
    return toEventStream<Raw>(stream, { parse: this.parse })
      .pipeThrough(createUIMessageLifecycle(this.select))
  }
}

/**
 * 以 `$api` 为底的 fetch
 *
 * @description 端点 baseURL、鉴权头、业务码校验、错误 toast 与 `movk:api:*` hook 全部复用。
 *  不强制 `responseType`：真流走流（拦截器识流后短路），JSON 错误信封仍按业务码校验抛出——
 *  某些网关的错误响应是 HTTP 200 + `{ code: 500 }`，只看 `response.ok` 会放行后拿 JSON 当流读。
 */
function createApiFetch(api: ApiInstance): HttpChatTransportInitOptions<UIMessage>['fetch'] {
  return async (input, init) =>
    await api.raw(String(input), init as FetchOptions) as unknown as Response
}

/**
 * 创建接 movk `$api` 的 AI SDK 传输层
 *
 * @description 请求编排（api/headers/body/credentials/prepareSendMessagesRequest/重连）全部继承
 *  AI SDK 的 `HttpChatTransport`，本工厂只补两处：默认 fetch 换成 `$api`，响应流按 `select` 映射成
 *  `UIMessageChunk`。需在 setup 作用域内调用（内部取 `$api`）。
 *
 * @example
 * ```ts
 * const transport = createChatTransport<BackendChunk>({
 *   api: '/chat/completions',
 *   select: raw => ({ id: raw.node, delta: raw.content, finished: raw.done })
 * })
 *
 * const { messages, sendMessage } = useChat({ transport })
 * ```
 */
export function createChatTransport<Raw = unknown, UI_MESSAGE extends UIMessage = UIMessage>(
  options: MovkChatTransportOptions<Raw, UI_MESSAGE>
): ChatTransport<UI_MESSAGE> {
  const { $api } = useNuxtApp()
  const api = options.endpoint ? $api.use(options.endpoint) : $api

  return new MovkChatTransport<Raw, UI_MESSAGE>({
    ...options,
    fetch: options.fetch ?? createApiFetch(api)
  })
}
