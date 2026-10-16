import type { FetchContext } from 'ofetch'
import type { ApiResponse, MovkApiPublicConfig } from '../../../types/api'
import type { ResolvedEndpointConfig } from '../../../types/api/module'
import type { ApiFetchContext } from '../../../types/api/response'
import type { useNuxtApp } from '#imports'
import { showToast } from '../toast'
import { dispatchUnauthorized } from './unauthorized'

type NuxtApp = ReturnType<typeof useNuxtApp>

function readApiContext(options: FetchContext['options']): ApiFetchContext {
  return options.context || {}
}

/**
 * 构造 onResponseError 拦截器
 *
 * @description 401 优先派发 `movk:api:unauthorized` hook 让业务侧自定义处理；
 * `result.handled === true` 时**跳过** `movk:api:error` 派发，避免全局错误上报双计 401。
 */
export function createOnResponseError(
  resolvedConfig: ResolvedEndpointConfig,
  publicConfig: MovkApiPublicConfig,
  nuxtApp: NuxtApp
) {
  const { auth: authConfig, toast: toastConfig, response: responseConfig } = resolvedConfig

  return async function onResponseError(context: FetchContext): Promise<void> {
    const { response } = context
    if (!response) return

    const { toast } = readApiContext(context.options)

    let unauthorizedHandled = false
    if (response.status === 401) {
      unauthorizedHandled = await dispatchUnauthorized(context, authConfig, nuxtApp)
    }

    if (!unauthorizedHandled) {
      await nuxtApp.callHook('movk:api:error', context)
    }

    const data = response._data as ApiResponse | undefined
    const fallback = `请求失败 (${response.status})`
    showToast('error', data ?? fallback, toast, toastConfig, responseConfig, context.options.method)

    if (publicConfig.debug) {
      console.error('[@movk/nuxt] Error:', response.status, response._data)
    }
  }
}
