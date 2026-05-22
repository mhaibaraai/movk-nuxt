import type { FetchContext } from 'ofetch'
import type { ApiResponse, MovkApiPublicConfig } from '../../../types/api'
import type { ResolvedEndpointConfig } from '../../../types/api/module'
import type { ApiFetchContext } from '../../../types/api/response'
import type { useNuxtApp } from '#imports'
import { extractData, extractMessage, isBusinessSuccess } from '../response'
import { createApiError } from '../errors'
import { showToast } from '../toast'

type NuxtApp = ReturnType<typeof useNuxtApp>

function readApiContext(options: FetchContext['options']): ApiFetchContext {
  return options.context || {}
}

/**
 * 构造 onResponse 拦截器
 *
 * @description 业务校验链路：
 * - 校验通过（或 skipBusinessCheck）→ 按 skipUnwrap 决定是否解包 _data → 派发 movk:api:response hook → 触发成功 toast
 * - 校验失败 → 派发 movk:api:error hook → 触发错误 toast → 抛 createApiError
 *
 * **契约**：拦截器输出 = 业务数据。`movk:api:response` hook 收到的 `context.response._data` 已解包；
 * 调用方设置 `skipUnwrap: true` 时不重写 `_data`，保留原始响应。
 */
export function createOnResponse(
  resolvedConfig: ResolvedEndpointConfig,
  publicConfig: MovkApiPublicConfig,
  nuxtApp: NuxtApp
) {
  const { toast: toastConfig, response: responseConfig } = resolvedConfig

  return async function onResponse(context: FetchContext): Promise<void> {
    const raw = context.response?._data as ApiResponse
    const { toast, skipBusinessCheck, skipUnwrap } = readApiContext(context.options)

    if (publicConfig.debug) {
      console.info('[@movk/nuxt] Response:', raw)
    }

    if (skipBusinessCheck || isBusinessSuccess(raw, responseConfig)) {
      if (!skipUnwrap && context.response) {
        context.response._data = extractData(raw, responseConfig)
      }

      await nuxtApp.callHook('movk:api:response', context)
      showToast('success', raw, toast, toastConfig, responseConfig)
      return
    }

    await nuxtApp.callHook('movk:api:error', context)
    showToast('error', raw, toast, toastConfig, responseConfig)

    throw createApiError(raw, extractMessage(raw, responseConfig))
  }
}
