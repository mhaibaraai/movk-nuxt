import type { ApiResponse, RequestToastOptions } from '../types/api'
import { ref, useNuxtApp } from '#imports'
import {
  showToast,
  isBusinessSuccess,
  extractMessage,
  extractToastMessage,
  getAuthHeaders
} from '../utils/api-utils'

/**
 * 上传选项(带进度监控)
 */
export interface UploadWithProgressOptions {
  /** 文件字段名 @defaultValue 'file' */
  fieldName?: string
  /** 额外的表单字段 */
  fields?: Record<string, string | Blob>
  /** 额外的请求头 */
  headers?: Record<string, string>
  /** Toast 配置 */
  toast?: RequestToastOptions | false
  /** 端点名称 */
  endpoint?: string
  /** 上传成功回调 */
  onSuccess?: (response: ApiResponse) => void
  /** 上传失败回调 */
  onError?: (error: Error) => void
}

/**
 * 带进度监控的文件上传 composable
 *
 * 基于原生 XMLHttpRequest 实现，支持实时进度和取消上传
 *
 * @example
 * ```ts
 * const { progress, uploading, upload, abort } = useUploadWithProgress()
 *
 * const { data, error } = await upload('/api/upload', files, {
 *   fieldName: 'files',
 *   onSuccess: (res) => console.log('上传成功', res)
 * })
 * ```
 */
export function useUploadWithProgress<T = unknown>() {
  const { $api } = useNuxtApp()

  const progress = ref(0)
  const uploading = ref(false)
  const data = ref<ApiResponse<T> | null>(null)
  const error = ref<Error | null>(null)

  let currentXhr: XMLHttpRequest | null = null

  const abort = () => {
    currentXhr?.abort()
    currentXhr = null
    uploading.value = false
    progress.value = 0
  }

  const upload = async (
    url: string,
    files: File | File[],
    options: UploadWithProgressOptions = {}
  ): Promise<{ data: ApiResponse<T> | null, error: Error | null }> => {
    const { fieldName = 'file', fields = {}, headers = {}, toast, endpoint, onSuccess, onError } = options

    const apiInstance = endpoint ? $api.use(endpoint) : $api
    const config = apiInstance.getConfig()
    const fullUrl = `${config.baseURL || ''}${url}`

    // 构建 FormData
    const formData = new FormData()
    const fileArray = Array.isArray(files) ? files : [files]
    fileArray.forEach(file => formData.append(fieldName, file))
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value))

    // 重置状态
    progress.value = 0
    uploading.value = true
    data.value = null
    error.value = null

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      currentXhr = xhr

      // 进度监听
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          progress.value = Math.round((e.loaded / e.total) * 100)
        }
      })

      // 完成监听
      xhr.addEventListener('load', () => {
        uploading.value = false
        currentXhr = null

        try {
          const response = JSON.parse(xhr.responseText) as ApiResponse<T>
          const isSuccess = isBusinessSuccess(response, config.success)
          const message = extractMessage(response, config.success)

          if (isSuccess) {
            data.value = response

            if (import.meta.client && toast !== false) {
              const msg = extractToastMessage(toast, 'success', message || '上传成功')
              showToast('success', msg, toast, config.toast)
            }

            onSuccess?.(response)
            resolve({ data: response, error: null })
          }
          else {
            const err = new Error(message || '上传失败')
            error.value = err

            if (import.meta.client && toast !== false) {
              const msg = extractToastMessage(toast, 'error', message || '上传失败')
              showToast('error', msg, toast, config.toast)
            }

            onError?.(err)
            resolve({ data: null, error: err })
          }
        }
        catch (err) {
          const parseError = err instanceof Error ? err : new Error('响应解析失败')
          error.value = parseError

          if (import.meta.client && toast !== false) {
            showToast('error', '上传失败', toast, config.toast)
          }

          onError?.(parseError)
          resolve({ data: null, error: parseError })
        }
      })

      // 错误监听
      xhr.addEventListener('error', () => {
        uploading.value = false
        currentXhr = null

        const err = new Error('网络错误')
        error.value = err

        if (import.meta.client && toast !== false) {
          showToast('error', '上传失败', toast, config.toast)
        }

        onError?.(err)
        resolve({ data: null, error: err })
      })

      // 中止监听
      xhr.addEventListener('abort', () => {
        uploading.value = false
        currentXhr = null
        error.value = new Error('上传已取消')
        resolve({ data: null, error: error.value })
      })

      // 发送请求
      xhr.open('POST', fullUrl)

      // 设置请求头（用户 headers + 认证 headers）
      const authHeaders = getAuthHeaders(config)
      Object.entries({ ...headers, ...authHeaders }).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.send(formData)
    })
  }

  return {
    /** 上传进度 (0-100) */
    progress,
    /** 是否正在上传 */
    uploading,
    /** 上传结果 */
    data,
    /** 错误信息 */
    error,
    /** 执行上传 */
    upload,
    /** 中止上传 */
    abort
  }
}
