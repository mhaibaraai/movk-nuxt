import type { RequestToastOptions } from '../types/api'
import { ref, useNuxtApp } from '#imports'
import { extractFilename, triggerDownload } from '@movk/core'
import { showToast, extractToastMessage, getAuthHeaders } from '../utils/api-utils'

/**
 * 下载选项(带进度监控)
 */
export interface DownloadWithProgressOptions {
  /** 自定义文件名，不提供时从响应头提取 */
  filename?: string
  /** 额外的请求头 */
  headers?: Record<string, string>
  /** Toast 配置 */
  toast?: RequestToastOptions | false
  /** 端点名称 */
  endpoint?: string
  /** 下载成功回调 */
  onSuccess?: (filename: string) => void
  /** 下载失败回调 */
  onError?: (error: Error) => void
}

/**
 * 带进度监控的文件下载 composable
 *
 * 基于原生 fetch + ReadableStream 实现，支持实时进度和取消下载
 *
 * @example
 * ```ts
 * const { progress, downloading, download, abort } = useDownloadWithProgress()
 *
 * await download('/api/export', {
 *   filename: 'report.pdf',
 *   onSuccess: (name) => console.log('下载成功:', name)
 * })
 * ```
 */
export function useDownloadWithProgress() {
  const { $api } = useNuxtApp()

  const progress = ref(0)
  const downloading = ref(false)
  const error = ref<Error | null>(null)

  let abortController: AbortController | null = null

  const abort = () => {
    abortController?.abort()
    abortController = null
    downloading.value = false
    progress.value = 0
  }

  const download = async (
    url: string,
    options: DownloadWithProgressOptions = {}
  ): Promise<{ success: boolean, error: Error | null }> => {
    const { filename, headers = {}, toast, endpoint, onSuccess, onError } = options

    const apiInstance = endpoint ? $api.use(endpoint) : $api
    const config = apiInstance.getConfig()
    const fullUrl = `${config.baseURL || ''}${url}`

    // 重置状态
    progress.value = 0
    downloading.value = true
    error.value = null
    abortController = new AbortController()

    try {
      // 合并认证 headers
      const authHeaders = getAuthHeaders(config)

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: { ...headers, ...authHeaders },
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`)
      }

      // 读取流并跟踪进度
      const contentLength = response.headers.get('content-length')
      const total = contentLength ? Number.parseInt(contentLength, 10) : 0
      const finalFilename = filename || extractFilename(response.headers, url.split('/').pop() || 'download')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('无法读取响应流')

      const chunks: Uint8Array[] = []
      let received = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        chunks.push(value)
        received += value.length
        if (total > 0) progress.value = Math.round((received / total) * 100)
      }

      // 触发下载
      triggerDownload(new Blob(chunks as BlobPart[]), finalFilename)

      // 完成
      downloading.value = false
      abortController = null
      progress.value = 100

      if (import.meta.client && toast !== false) {
        const message = extractToastMessage(toast, 'success', `下载成功: ${finalFilename}`)
        showToast('success', message, toast, config.toast)
      }

      onSuccess?.(finalFilename)
      return { success: true, error: null }
    }
    catch (err) {
      downloading.value = false
      abortController = null

      const downloadError = err instanceof Error ? err : new Error('下载失败')
      error.value = downloadError

      const isAborted = downloadError.name === 'AbortError'

      if (import.meta.client && !isAborted && toast !== false) {
        const message = extractToastMessage(toast, 'error', downloadError.message || '下载失败')
        showToast('error', message, toast, config.toast)
      }

      if (!isAborted) onError?.(downloadError)

      return { success: false, error: downloadError }
    }
  }

  return {
    /** 下载进度 (0-100) */
    progress,
    /** 是否正在下载 */
    downloading,
    /** 错误信息 */
    error,
    /** 执行下载 */
    download,
    /** 中止下载 */
    abort
  }
}
