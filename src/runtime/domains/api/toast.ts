import type { ToastProps } from '@nuxt/ui'
import type { ApiToastConfig, RequestToastOptions } from '../../types/api'
import { useNuxtApp, useToast } from '#imports'

function getToast(): ReturnType<typeof useToast> | null {
  try {
    const nuxtApp = useNuxtApp()
    return nuxtApp.vueApp.runWithContext(() => useToast())
  }
  catch {
    return null
  }
}

export function extractToastMessage(
  toast: RequestToastOptions | false | undefined,
  type: 'success' | 'error',
  fallback: string
): string {
  if (toast === false) return fallback
  return (typeof toast === 'object' ? toast?.[`${type}Message`] : undefined) || fallback
}

export function showToast(
  type: 'success' | 'error',
  message: string | undefined,
  requestOptions: RequestToastOptions | false | undefined,
  globalConfig: Partial<ApiToastConfig>
): void {
  if (globalConfig.enabled === false || requestOptions === false) return
  if (!message) return

  const typeConfig = globalConfig[type]
  if (typeConfig?.show === false) return
  if (requestOptions?.[type] === false) return

  const toast = getToast()
  if (!toast) return

  const requestTypeConfig = typeof requestOptions?.[type] === 'object'
    ? requestOptions[type] as Partial<ToastProps>
    : {}

  toast.add({
    icon: type === 'success' ? 'i-lucide-circle-check' : 'i-lucide-circle-x',
    title: message,
    color: type === 'success' ? 'success' : 'error',
    duration: 3000,
    ...(typeConfig && { ...typeConfig, show: undefined }),
    ...requestTypeConfig
  } as ToastProps)
}
