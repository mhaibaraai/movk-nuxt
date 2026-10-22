import type { Ref } from 'vue'
import type { NitroFetchRequest } from 'nitropack/types'
import type { FetchOptions } from 'ofetch'
import type {
  ApiError,
  MovkApiPublicConfig,
  TransferRequestOptions,
  TransferResult,
  TransferStatus
} from '../types/api'
import { ref, shallowRef } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#imports'
import { createApiClient } from '../domains/api/client'
import { resolveEndpointConfig } from '../domains/api/endpoint-config'
import { isApiError } from '../domains/api/errors'
import type { XhrRequestInit } from '../domains/api/adapters/xhr'
import { xhrFetch } from '../domains/api/adapters/xhr'

/**
 * 上传选项（带进度监控）
 */
export interface UploadWithProgressOptions<T = unknown> extends TransferRequestOptions {
  /**
   * 文件字段名
   * @defaultValue 'file'
   */
  fieldName?: string
  /** 额外的表单字段 */
  fields?: Record<string, string | Blob>
  /** 超时毫秒数，0 或未设置不超时 */
  timeout?: number
  /** 是否跨域携带凭证 */
  withCredentials?: boolean
  /** 上传成功回调（解包后业务数据） */
  onSuccess?: (data: T) => void
  /** 上传失败回调；中止时不触发 */
  onError?: (error: ApiError) => void
}

/**
 * 带进度监控的文件上传 composable（仅客户端）
 *
 * @description 以 XHR 适配器作为底层 fetch 接入 `$api` 同一条管线：端点 / 认证 / 业务校验 / toast / hook / 错误归一全部复用。
 *  返回的 `data` 按端点策略处理，与 `useApiFetch<T>` 一致。
 *
 * @example
 * ```ts
 * const { progress, status, data, upload, abort } = useUploadWithProgress<{ files: Array<{ name: string }> }>()
 *
 * await upload('/api/upload', files, { fieldName: 'files' })
 * ```
 */
export function useUploadWithProgress<T = unknown>(): {
  /** 上传进度 0-100 */
  progress: Ref<number | null>
  /** 传输状态 */
  status: Ref<TransferStatus>
  /** 解包后的业务数据 */
  data: Ref<T | null>
  /** 错误信息 */
  error: Ref<ApiError | null>
  /** 执行上传 */
  upload: (url: NitroFetchRequest, files: File | File[], options?: UploadWithProgressOptions<T>) => Promise<TransferResult<T>>
  /** 中止上传 */
  abort: () => void
} {
  const publicConfig = useRuntimeConfig().public.movkApi as MovkApiPublicConfig
  const nuxtApp = useNuxtApp()

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

  const upload = async (
    url: NitroFetchRequest,
    files: File | File[],
    options: UploadWithProgressOptions<T> = {}
  ): Promise<TransferResult<T>> => {
    const {
      fieldName = 'file',
      fields = {},
      endpoint: endpointName,
      timeout,
      withCredentials,
      onSuccess,
      onError,
      ...requestOptions
    } = options

    const endpoint = endpointName || publicConfig.defaultEndpoint || 'default'
    const config = resolveEndpointConfig(publicConfig, endpoint)
    // 外部端点无需 nitro 路由推断，按 ofetch 签名调用
    const send = createApiClient({ endpoint, config, publicConfig, nuxtApp }, xhrFetch) as unknown as
      (request: NitroFetchRequest, options: FetchOptions & XhrRequestInit) => Promise<T>

    const formData = new FormData()
    const fileArray = Array.isArray(files) ? files : [files]
    fileArray.forEach(file => formData.append(fieldName, file))
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value))

    abort()
    const current = new AbortController()
    controller = current
    // 中止（含新一次上传替代上一次）后，旧请求不再回写状态
    const isCurrent = (): boolean => controller === current
    progress.value = 0
    status.value = 'pending'
    data.value = null
    error.value = null

    // ofetch 在调用方自带 signal 时不再处理 timeout，由这里以 TimeoutError 中止，出口归为 timeout
    const timer = timeout && timeout > 0
      ? setTimeout(() => current.abort(new DOMException(`上传超时（${timeout}ms）`, 'TimeoutError')), timeout)
      : undefined

    try {
      const result = await send(url, {
        ...requestOptions,
        method: 'POST',
        body: formData,
        retry: false,
        signal: current.signal,
        credentials: withCredentials ? 'include' : undefined,
        onUploadProgress: (event: ProgressEvent) => {
          if (event.lengthComputable && isCurrent()) {
            progress.value = Math.round((event.loaded / event.total) * 100)
          }
        }
      })

      if (!isCurrent()) return { data: null, error: null, aborted: true }
      status.value = 'success'
      data.value = result
      progress.value = 100
      onSuccess?.(result)
      return { data: result, error: null, aborted: false }
    }
    catch (cause: unknown) {
      if (!isApiError(cause)) throw cause
      if (!isCurrent()) return { data: null, error: null, aborted: true }

      status.value = 'error'
      error.value = cause
      onError?.(cause)
      return { data: null, error: cause, aborted: false }
    }
    finally {
      clearTimeout(timer)
      if (isCurrent()) controller = null
    }
  }

  return { progress, status, data, error, upload, abort }
}
