import type { NitroFetchRequest } from 'nitropack/types'
import type {
  ApiError,
  MovkApiPublicConfig,
  TransferRequestOptions,
  TransferResult,
  TransferStatus
} from '../types/api'
import { ref, useNuxtApp, useRuntimeConfig } from '#imports'
import { triggerDownload } from '@movk/core'
import {
  buildFetchContext,
  finalizeTransfer,
  prepareTransfer,
  resolveFilename,
  tryParseJsonResponse
} from '../domains/api/transfer'

/**
 * 下载选项（带进度监控）
 */
export interface DownloadWithProgressOptions extends TransferRequestOptions {
  /** HTTP 方法 @defaultValue 'GET' */
  method?: RequestInit['method']
  /** 请求体，非 GET 时若非 string 自动序列化为 JSON */
  body?: RequestInit['body'] | Record<string, unknown>
  /** 自定义文件名，不提供时从响应头或 URL 提取 */
  filename?: string
  /** 下载成功回调（文件名） */
  onSuccess?: (filename: string) => void
  /** 下载失败回调；中止时不触发 */
  onError?: (error: ApiError | Error) => void
}

/**
 * 带进度监控的文件下载 composable（仅客户端）
 *
 * @description 基于原生 fetch + ReadableStream 实现，复用 `@movk/nuxt` 的端点/认证/业务校验/toast/hook 体系。
 *  - 后端返回 JSON 时按业务码校验，错误不会触发文件下载
 *  - 后端无 content-length 时 progress 为 null，UI 据此切 indeterminate
 *
 * @example
 * ```ts
 * const { progress, status, error, download, abort } = useDownloadWithProgress()
 *
 * const { data, error: err, aborted } = await download('/api/export', {
 *   filename: 'report.pdf'
 * })
 * ```
 */
export function useDownloadWithProgress<T = Blob>() {
  const publicConfig = useRuntimeConfig().public.movkApi as MovkApiPublicConfig
  const nuxtApp = useNuxtApp()

  const progress = ref<number | null>(0)
  const status = ref<TransferStatus>('idle')
  const data = ref<T | null>(null)
  const error = ref<ApiError | Error | null>(null)

  let controller: AbortController | null = null

  const abort = (): void => {
    controller?.abort()
    controller = null
    status.value = 'aborted'
    progress.value = 0
  }

  const download = async (
    url: NitroFetchRequest,
    options: DownloadWithProgressOptions = {}
  ): Promise<TransferResult<T>> => {
    const {
      method = 'GET',
      body,
      filename,
      headers: userHeaders,
      toast,
      endpoint,
      skipBusinessCheck,
      onSuccess,
      onError
    } = options

    const urlStr = typeof url === 'string' ? url : url.url
    const { fullUrl, headers, config } = prepareTransfer(publicConfig, urlStr, {
      endpoint,
      headers: userHeaders,
      toast,
      skipBusinessCheck
    })

    progress.value = 0
    status.value = 'pending'
    data.value = null
    error.value = null
    controller = new AbortController()

    const fetchInit: RequestInit = {
      method,
      headers,
      signal: controller.signal
    }
    if (method && method !== 'GET' && body !== undefined && body !== null) {
      const isBodyInit
        = typeof body === 'string'
          || body instanceof Blob
          || body instanceof FormData
          || body instanceof URLSearchParams
          || body instanceof ArrayBuffer
          || body instanceof ReadableStream
          || ArrayBuffer.isView(body)
      if (isBodyInit) {
        fetchInit.body = body as BodyInit
      }
      else {
        fetchInit.body = JSON.stringify(body)
        if (!('content-type' in headers) && !('Content-Type' in headers)) {
          (fetchInit.headers as Record<string, string>)['Content-Type'] = 'application/json'
        }
      }
    }

    try {
      const response = await fetch(fullUrl, fetchInit)
      const fetchContext = buildFetchContext(fullUrl, { context: { toast, skipBusinessCheck } }, {
        status: response.status,
        headers: response.headers
      })

      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.toLowerCase().includes('application/json')

      // HTTP 错误：尝试读 JSON 体走业务通道，否则带 status 失败
      if (!response.ok) {
        if (isJson) {
          const text = await response.text()
          const raw = tryParseJsonResponse(response.headers, text)
          const result = await finalizeTransfer<T>(nuxtApp, {
            raw,
            fallback: { isSuccess: false, data: null, message: `HTTP ${response.status}` },
            config,
            publicConfig,
            requestToast: toast,
            skipBusinessCheck,
            fetchContext
          })
          status.value = 'error'
          error.value = result.error
          onError?.(result.error!)
          return result
        }

        const result = await finalizeTransfer<T>(nuxtApp, {
          raw: null,
          fallback: { isSuccess: false, data: null, message: `HTTP ${response.status} ${response.statusText}` },
          config,
          publicConfig,
          requestToast: toast,
          fetchContext
        })
        status.value = 'error'
        error.value = result.error
        onError?.(result.error!)
        return result
      }

      // JSON 响应：走业务校验，不当文件下载
      if (isJson) {
        const text = await response.text()
        const raw = tryParseJsonResponse(response.headers, text)
        const result = await finalizeTransfer<T>(nuxtApp, {
          raw,
          fallback: { isSuccess: false, data: null, message: '响应解析失败' },
          config,
          publicConfig,
          requestToast: toast,
          skipBusinessCheck,
          fetchContext
        })
        if (result.error) {
          status.value = 'error'
          error.value = result.error
          onError?.(result.error)
        }
        else {
          status.value = 'success'
          data.value = result.data
          progress.value = 100
        }
        controller = null
        return result
      }

      // 二进制路径
      const contentLength = response.headers.get('content-length')
      const total = contentLength ? Number.parseInt(contentLength, 10) : 0
      const finalFilename = resolveFilename(response.headers, urlStr, filename)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('无法读取响应流')

      if (total <= 0) progress.value = null

      const chunks: Uint8Array[] = []
      let received = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        if (total > 0) progress.value = Math.round((received / total) * 100)
      }

      const blob = new Blob(chunks as BlobPart[])
      triggerDownload(blob, finalFilename)

      const result = await finalizeTransfer<T>(nuxtApp, {
        raw: null,
        fallback: { isSuccess: true, data: blob as unknown as T, message: `下载成功: ${finalFilename}` },
        config,
        publicConfig,
        requestToast: toast,
        fetchContext
      })

      status.value = 'success'
      data.value = result.data
      progress.value = 100
      controller = null
      onSuccess?.(finalFilename)
      return result
    }
    catch (err) {
      controller = null

      const isAborted = err instanceof DOMException && err.name === 'AbortError'
      if (isAborted) {
        status.value = 'aborted'
        return { data: null, error: null, aborted: true }
      }

      const downloadError = err instanceof Error ? err : new Error('下载失败')
      status.value = 'error'
      error.value = downloadError
      onError?.(downloadError)
      return { data: null, error: downloadError, aborted: false }
    }
  }

  return {
    /** 下载进度 0-100；后端未返回 content-length 时为 null（不确定） */
    progress,
    /** 传输状态 */
    status,
    /** 业务数据（默认 Blob；JSON 响应时为解包后的业务数据） */
    data,
    /** 错误信息 */
    error,
    /** 执行下载 */
    download,
    /** 中止下载 */
    abort
  }
}
