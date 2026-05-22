import type { NitroFetchRequest } from 'nitropack/types'
import type {
  ApiError,
  MovkApiPublicConfig,
  TransferRequestOptions,
  TransferResult,
  TransferStatus
} from '../types/api'
import { ref, useNuxtApp, useRuntimeConfig } from '#imports'
import {
  buildFetchContext,
  finalizeTransfer,
  parseXhrHeaders,
  prepareTransfer,
  tryParseJsonResponse
} from '../domains/api/transfer'

/**
 * 上传选项（带进度监控）
 */
export interface UploadWithProgressOptions<T = unknown> extends TransferRequestOptions {
  /** 文件字段名 @defaultValue 'file' */
  fieldName?: string
  /** 额外的表单字段 */
  fields?: Record<string, string | Blob>
  /** 超时毫秒数，0 或未设置不超时 */
  timeoutMs?: number
  /** 是否跨域携带凭证 */
  withCredentials?: boolean
  /** 上传成功回调（解包后业务数据） */
  onSuccess?: (data: T) => void
  /** 上传失败回调；中止时不触发 */
  onError?: (error: ApiError | Error) => void
}

/**
 * 带进度监控的文件上传 composable（仅客户端）
 *
 * @description 基于原生 XMLHttpRequest 实现，复用 `@movk/nuxt` 的端点/认证/业务校验/toast/hook 体系。
 *  返回的 `data` 是按 `dataKey` 解包后的业务数据，与 `useApiFetch<T>` 一致。
 *
 * @example
 * ```ts
 * const { progress, status, data, upload, abort } = useUploadWithProgress<{ files: Array<{ name: string }> }>()
 *
 * await upload('/api/upload', files, { fieldName: 'files' })
 * ```
 */
export function useUploadWithProgress<T = unknown>() {
  const publicConfig = useRuntimeConfig().public.movkApi as MovkApiPublicConfig
  const nuxtApp = useNuxtApp()

  const progress = ref<number | null>(0)
  const status = ref<TransferStatus>('idle')
  const data = ref<T | null>(null)
  const error = ref<ApiError | Error | null>(null)

  let currentXhr: XMLHttpRequest | null = null

  const abort = (): void => {
    currentXhr?.abort()
    currentXhr = null
    status.value = 'aborted'
    progress.value = 0
  }

  const upload = (
    url: NitroFetchRequest,
    files: File | File[],
    options: UploadWithProgressOptions<T> = {}
  ): Promise<TransferResult<T>> => {
    const {
      fieldName = 'file',
      fields = {},
      headers: userHeaders,
      toast,
      endpoint,
      skipBusinessCheck,
      timeoutMs,
      withCredentials,
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

    const formData = new FormData()
    const fileArray = Array.isArray(files) ? files : [files]
    fileArray.forEach(file => formData.append(fieldName, file))
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value))

    progress.value = 0
    status.value = 'pending'
    data.value = null
    error.value = null

    return new Promise<TransferResult<T>>((resolve) => {
      const xhr = new XMLHttpRequest()
      currentXhr = xhr

      if (withCredentials) xhr.withCredentials = true
      if (timeoutMs && timeoutMs > 0) xhr.timeout = timeoutMs

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          progress.value = Math.round((e.loaded / e.total) * 100)
        }
      })

      const finishWith = async (raw: ReturnType<typeof tryParseJsonResponse>, fallback?: { isSuccess: boolean, message?: string }) => {
        const responseHeaders = parseXhrHeaders(xhr.getAllResponseHeaders())
        const fetchContext = buildFetchContext(fullUrl, { context: { toast, skipBusinessCheck } }, {
          status: xhr.status,
          headers: responseHeaders
        })

        const result = await finalizeTransfer<T>(nuxtApp, {
          raw,
          fallback: fallback ? { isSuccess: fallback.isSuccess, data: null, message: fallback.message } : undefined,
          config,
          publicConfig,
          requestToast: toast,
          skipBusinessCheck,
          fetchContext
        })

        currentXhr = null
        if (result.error) {
          status.value = 'error'
          error.value = result.error
          onError?.(result.error)
        }
        else {
          status.value = 'success'
          data.value = result.data
          progress.value = 100
          if (result.data !== null) onSuccess?.(result.data)
        }
        resolve(result)
      }

      xhr.addEventListener('load', () => {
        const responseHeaders = parseXhrHeaders(xhr.getAllResponseHeaders())
        const raw = tryParseJsonResponse(responseHeaders, xhr.responseText)

        if (xhr.status < 200 || xhr.status >= 300) {
          void finishWith(raw, { isSuccess: false, message: `HTTP ${xhr.status} ${xhr.statusText}` })
          return
        }
        void finishWith(raw, raw ? undefined : { isSuccess: true, message: '上传成功' })
      })

      xhr.addEventListener('error', () => {
        void finishWith(null, { isSuccess: false, message: '网络错误' })
      })

      xhr.addEventListener('timeout', () => {
        void finishWith(null, { isSuccess: false, message: `上传超时（${timeoutMs}ms）` })
      })

      xhr.addEventListener('abort', () => {
        currentXhr = null
        status.value = 'aborted'
        resolve({ data: null, error: null, aborted: true })
      })

      xhr.open('POST', fullUrl)

      // auth 先、用户后；用户 headers 已在 prepareTransfer 中合并优先级，但这里再保险一次
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v))

      xhr.send(formData)
    })
  }

  return {
    /** 上传进度 0-100 */
    progress,
    /** 传输状态 */
    status,
    /** 解包后的业务数据 */
    data,
    /** 错误信息 */
    error,
    /** 执行上传 */
    upload,
    /** 中止上传 */
    abort
  }
}
