/** XHR 适配器额外接受的请求选项 */
export interface XhrRequestInit extends RequestInit {
  /** 上传进度回调 */
  onUploadProgress?: (event: ProgressEvent) => void
}

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304])

/**
 * 把 XHR 的 getAllResponseHeaders() 字符串解析为标准 Headers
 */
export function parseXhrHeaders(raw: string): Headers {
  const headers = new Headers()
  if (!raw) return headers
  for (const line of raw.trim().split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const name = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (name) headers.append(name, value)
  }
  return headers
}

function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('The operation was aborted.', 'AbortError')
}

/**
 * 与 fetch 签名兼容的 XMLHttpRequest 实现
 *
 * @description 作为 ofetch 的底层 fetch 使用，让上传进度也走 $api 的完整管线。
 *  fetch 规范至今无法在主流浏览器上报告上传进度，故保留 XHR。
 *  中止 / 超时沿用 signal 的 reason（ofetch 超时会以 TimeoutError 中止），网络失败按 fetch 语义抛 TypeError。
 */
export function xhrFetch(input: RequestInfo | URL, init: XhrRequestInit = {}): Promise<Response> {
  const { signal, onUploadProgress } = init

  return new Promise<Response>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortReason(signal))
      return
    }

    const xhr = new XMLHttpRequest()
    const url = input instanceof Request ? input.url : String(input)

    xhr.open(init.method || 'GET', url)
    xhr.responseType = 'blob'
    xhr.withCredentials = init.credentials === 'include'
    new Headers(init.headers).forEach((value, key) => xhr.setRequestHeader(key, value))

    if (onUploadProgress) {
      xhr.upload.addEventListener('progress', onUploadProgress)
    }

    const onAbort = (): void => xhr.abort()
    signal?.addEventListener('abort', onAbort, { once: true })
    const cleanup = (): void => signal?.removeEventListener('abort', onAbort)

    xhr.addEventListener('load', () => {
      cleanup()
      const body = NULL_BODY_STATUSES.has(xhr.status) ? null : xhr.response as Blob
      resolve(new Response(body, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseXhrHeaders(xhr.getAllResponseHeaders())
      }))
    })
    xhr.addEventListener('error', () => {
      cleanup()
      reject(new TypeError('Network request failed'))
    })
    xhr.addEventListener('abort', () => {
      cleanup()
      reject(signal ? abortReason(signal) : new DOMException('The operation was aborted.', 'AbortError'))
    })

    xhr.send(init.body as XMLHttpRequestBodyInit | null | undefined)
  })
}
