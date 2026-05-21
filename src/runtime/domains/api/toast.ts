import type { ToastProps } from '@nuxt/ui'
import type { ApiResponse, ApiResponseConfig, ApiToastConfig, RequestToastOptions } from '../../types/api'
import { extractMessage } from './response'
import { useNuxtApp, useToast } from '#imports'

type ToastType = 'success' | 'error'

function getToast(): ReturnType<typeof useToast> | null {
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp.vueApp.runWithContext(() => useToast())
  }
  catch {
    return null
  }
}

function pickMessage(
  type: ToastType,
  source: ApiResponse | string | undefined,
  requestOptions: RequestToastOptions | false | undefined,
  responseConfig?: Partial<ApiResponseConfig>
): string {
  if (typeof requestOptions === 'object') {
    const custom = requestOptions[`${type}Message` as const]
    if (custom) return custom
  }
  if (typeof source === 'string') return source
  if (source && responseConfig) {
    const extracted = extractMessage(source, responseConfig)
    if (extracted) return extracted
  }
  return type === 'success' ? '操作成功' : '请求失败'
}

function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v
  }
  return out as Partial<T>
}

/**
 * 触发 Toast 提示
 *
 * @description 决策收敛在本函数内：是否启用 / 类型是否启用 / 提示文案选择 / payload 构造。
 *
 * @param type 提示类型
 * @param source 字符串作为 fallback 文案；ApiResponse 时按 responseConfig 抽取 message；undefined 走类型默认文案
 * @param requestOptions 单次请求覆盖配置；为 false 时整体禁用
 * @param globalConfig 全局 Toast 配置（已合并端点级覆盖）
 * @param responseConfig 用于从 ApiResponse 抽取 message 的字段映射；source 为字符串时可省略
 */
export function showToast(
  type: ToastType,
  source: ApiResponse | string | undefined,
  requestOptions: RequestToastOptions | false | undefined,
  globalConfig: Partial<ApiToastConfig>,
  responseConfig?: Partial<ApiResponseConfig>
): void {
  if (globalConfig.enabled === false || requestOptions === false) return

  const typeConfig = globalConfig[type]
  if (typeConfig?.show === false) return
  if (requestOptions?.[type] === false) return

  const message = pickMessage(type, source, requestOptions, responseConfig)
  if (!message) return

  const toast = getToast()
  if (!toast) return

  const { show: _show, ...typeConfigProps } = typeConfig ?? {}
  const requestTypeConfig = typeof requestOptions?.[type] === 'object'
    ? requestOptions[type] as Partial<ToastProps>
    : {}

  toast.add(compact({
    title: message,
    ...typeConfigProps,
    ...requestTypeConfig
  }) as ToastProps)
}
