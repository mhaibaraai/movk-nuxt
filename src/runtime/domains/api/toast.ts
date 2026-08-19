import type { ToastProps } from '@nuxt/ui'
import type { ApiResponse, ApiResponseConfig, ApiToastConfig, RequestToastOptions } from '../../types/api'
import type { ApiToast, ApiToastTypeConfig } from '../../types/api/config'
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

/**
 * 判断当前请求方法是否命中方法白名单
 * @description methods 未声明表示不限制；空数组表示白名单为空，任何方法都不命中；比较大小写不敏感，method 缺省按 GET 处理
 */
function matchesMethod(methods: ApiToastTypeConfig['methods'], method?: string): boolean {
  if (!methods) return true
  const current = (method || 'GET').toUpperCase()
  return methods.some(item => item.toUpperCase() === current)
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
 * @param method 当前请求的 HTTP 方法，用于匹配 globalConfig 的方法白名单；缺省按 GET 处理
 * @description 开关优先级：请求级 show 显式声明 > 请求级 successMessage / errorMessage >
 * 全局 typeConfig.show / typeConfig.methods > 全局 enabled。
 * 请求级 `show: true` 或自定义文案均可在全局关闭时单次开启。
 */
export function showToast(
  type: ToastType,
  source: ApiResponse | string | undefined,
  requestOptions: RequestToastOptions | false | undefined,
  globalConfig: Partial<ApiToastConfig>,
  responseConfig?: Partial<ApiResponseConfig>,
  method?: string
): void {
  if (requestOptions === false) return

  const requestTypeOptions = requestOptions?.[type]
  if (requestTypeOptions === false) return

  const typeConfig = globalConfig[type]
  const requestShow = requestTypeOptions?.show
  const globalShow = globalConfig.enabled !== false
    && typeConfig?.show !== false
    && matchesMethod(typeConfig?.methods, method)
  // 请求级显式文案视为本次开启的意图，与 pickMessage 保持同一 truthy 判定
  const hasRequestMessage = typeof requestOptions === 'object'
    && !!requestOptions?.[`${type}Message` as const]
  if (requestShow === false || (requestShow === undefined && !globalShow && !hasRequestMessage)) return

  const message = pickMessage(type, source, requestOptions, responseConfig)
  if (!message) return

  const toast = getToast()
  if (!toast) return

  const { show: _show, methods: _methods, ...typeConfigProps } = typeConfig ?? {}
  const { show: _requestShow, ...requestTypeConfig } = (requestTypeOptions ?? {}) as ApiToast

  toast.add(compact({
    title: message,
    ...typeConfigProps,
    ...requestTypeConfig
  }) as ToastProps)
}
