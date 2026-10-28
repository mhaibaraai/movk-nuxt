import type { Ref } from 'vue'
import type { NitroFetchRequest } from 'nitropack/types'
import type {
  ApiError,
  MovkApiEndpointName,
  MovkApiPublicConfig,
  TransferRequestOptions,
  TransferResult,
  TransferStatus
} from '../types/api'
import { ref, shallowRef } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#imports'
import { triggerDownload } from '@movk/core'
import { resolveEndpointConfig } from '../domains/api/endpoint-config'
import { createApiError, isApiError } from '../domains/api/errors'
import { isAbortError, isReadableStream } from '../domains/api/stream'
import { readWithProgress, resolveFilename } from '../domains/api/download'
import { showToast } from '../domains/api/toast'

/**
 * 下载选项（带进度监控）
 */
export interface DownloadWithProgressOptions extends TransferRequestOptions {
  /**
   * HTTP 方法
   * @defaultValue 'GET'
   */
  method?: string
  /** 请求体，对象按 JSON 序列化 */
  body?: RequestInit['body'] | Record<string, unknown>
  /** 自定义文件名，不提供时从响应头或 URL 提取 */
  filename?: string
  /** 下载成功回调（文件名） */
  onSuccess?: (filename: string) => void
  /** 下载失败回调；中止时不触发 */
  onError?: (error: ApiError) => void
}

/**
 * 带进度监控的文件下载 composable（仅客户端）
 *
 * @description 以 `$api.raw` + 流式响应实现，端点 / 认证 / 业务校验 / toast / hook / 错误归一全部复用：
 *  - 后端返回 JSON 时按端点策略判定，错误不会触发文件下载
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
export function useDownloadWithProgress<T = Blob>(): {
  /** 下载进度 0-100；后端未返回 content-length 时为 null（不确定） */
  progress: Ref<number | null>
  /** 传输状态 */
  status: Ref<TransferStatus>
  /** 业务数据（默认 Blob；JSON 响应时为按策略处理后的业务数据） */
  data: Ref<T | null>
  /** 错误信息 */
  error: Ref<ApiError | null>
  /** 执行下载 */
  download: (url: NitroFetchRequest, options?: DownloadWithProgressOptions) => Promise<TransferResult<T>>
  /** 中止下载 */
  abort: () => void
} {
  const publicConfig = useRuntimeConfig().public.movkApi as MovkApiPublicConfig
  const nuxtApp = useNuxtApp()
  const { $api } = nuxtApp

  const progress = ref<number | null>(0)
  const status = ref<TransferStatus>('idle')
  const data = shallowRef<T | null>(null)
  const error = ref<ApiError | null>(null)

  let controller: AbortController | null = null

  const abort = (): void => {
    if (!controller) return
    controller.abort()
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
      filename,
      endpoint: endpointName,
      onSuccess,
      onError,
      ...requestOptions
    } = options

    const endpoint = endpointName || publicConfig.defaultEndpoint || 'default'
    const client = $api.use(endpoint as MovkApiEndpointName)
    const urlStr = typeof url === 'string' ? url : url.url

    abort()
    const current = new AbortController()
    controller = current
    // 中止（含新一次下载替代上一次）后，旧请求不再回写状态
    const isCurrent = (): boolean => controller === current

    progress.value = 0
    status.value = 'pending'
    data.value = null
    error.value = null

    const fail = (cause: ApiError): TransferResult<T> => {
      status.value = 'error'
      error.value = cause
      onError?.(cause)
      return { data: null, error: cause, aborted: false }
    }

    try {
      const response = await client.raw(url, {
        ...requestOptions,
        method,
        responseType: 'stream',
        retry: false,
        signal: current.signal
      } as Parameters<typeof client.raw>[1])

      if (!isCurrent()) return { data: null, error: null, aborted: true }

      // JSON 响应已由拦截器按策略判定并处理，不当文件下载
      if (!isReadableStream(response._data)) {
        status.value = 'success'
        data.value = response._data as T
        progress.value = 100
        return { data: data.value, error: null, aborted: false }
      }

      const total = Number.parseInt(response.headers.get('content-length') || '', 10) || 0
      const blob = await readWithProgress(response._data, total, (percent) => {
        if (isCurrent()) progress.value = percent
      }, response.headers.get('content-type') || undefined)

      if (!isCurrent()) return { data: null, error: null, aborted: true }

      const finalFilename = resolveFilename(response.headers, urlStr, filename)
      triggerDownload(blob, finalFilename)

      const config = resolveEndpointConfig(publicConfig, endpoint)
      showToast('success', `下载成功: ${finalFilename}`, requestOptions.toast, config.toast, config.response, method, nuxtApp)

      status.value = 'success'
      data.value = blob as T
      progress.value = 100
      onSuccess?.(finalFilename)
      return { data: data.value, error: null, aborted: false }
    }
    catch (cause: unknown) {
      if (!isCurrent() || isAbortError(cause) || (isApiError(cause) && cause.data?.kind === 'aborted')) {
        return { data: null, error: null, aborted: true }
      }
      if (isApiError(cause)) return fail(cause)
      // 读取响应流途中断开：请求已成功，不再经客户端出口
      return fail(createApiError({ kind: 'network', endpoint, message: '下载中断' }))
    }
    finally {
      if (isCurrent()) controller = null
    }
  }

  return { progress, status, data, error, download, abort }
}
