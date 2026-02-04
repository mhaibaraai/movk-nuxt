import type { ApiHooksConfig, ApiHooksDefinition, ApiHooksRegistry } from '../types/api'
import { useNuxtApp } from '#imports'

const HOOK_KEYS: ReadonlyArray<keyof ApiHooksConfig> = [
  'onRequest',
  'onRequestError',
  'onResponse',
  'onResponseError'
]

/**
 * 判断参数是否为 ApiHooksConfig（简写形式）
 * @internal
 */
function isApiHooksConfig(
  input: ApiHooksConfig | ApiHooksDefinition
): input is ApiHooksConfig {
  return HOOK_KEYS.some(key => key in input)
}

/**
 * 注册 API 自定义钩子
 *
 * @description
 * 在 Nuxt 插件中调用此函数，注册自定义的 ofetch 生命周期钩子。
 * 用户钩子接收 `(context, builtin)` 两个参数：
 * - 调用 `builtin(context)` 执行内置逻辑（认证注入、Toast、401 处理等）
 * - 不调用 `builtin` 则完全覆盖内置行为
 *
 * 钩子解析优先级：端点级钩子 > 全局钩子 > 内置钩子
 *
 * @param definition - 钩子配置（简写或完整形式）
 *
 * @example
 * ```ts
 * // plugins/api-hooks.ts
 * export default defineNuxtPlugin(() => {
 *   // 简写：仅全局钩子（应用于所有端点）
 *   useApiHooks({
 *     async onResponseError(context, builtin) {
 *       if (context.response.status === 401) {
 *         const refreshed = await tryRefreshToken()
 *         if (refreshed) return // 跳过内置 401 处理
 *       }
 *       await builtin(context) // 其他错误走内置处理
 *     }
 *   })
 * })
 *
 * // 完整形式：全局 + 按端点
 * export default defineNuxtPlugin(() => {
 *   useApiHooks({
 *     hooks: {
 *       onRequest(context, builtin) {
 *         builtin(context)
 *         console.log('所有请求的自定义日志')
 *       }
 *     },
 *     endpoints: {
 *       payment: {
 *         onResponseError(context, builtin) {
 *           // payment 端点的专属错误处理
 *           builtin(context)
 *         }
 *       }
 *     }
 *   })
 * })
 * ```
 */
export function useApiHooks(definition: ApiHooksConfig | ApiHooksDefinition): void {
  const { globalHooks, endpointHooks } = isApiHooksConfig(definition)
    ? { globalHooks: definition, endpointHooks: undefined }
    : { globalHooks: definition.hooks, endpointHooks: definition.endpoints }

  const nuxtApp = useNuxtApp()
  const registry = (nuxtApp as any).$_apiHooksRegistry as ApiHooksRegistry | undefined

  if (!registry) {
    console.warn('[Movk API] Hooks registry not found. Ensure the API module is enabled.')
    return
  }

  if (globalHooks) {
    registry.global = globalHooks
  }

  if (endpointHooks) {
    for (const [name, hooks] of Object.entries(endpointHooks)) {
      registry.endpoints.set(name, hooks)
    }
  }
}
