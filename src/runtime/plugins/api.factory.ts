import type { AnyObject } from '@movk/core'
import type { ApiProfile } from '../types'
import { defineNuxtPlugin, useToast } from '#imports'
import { smartT } from '../utils/t'

const STATUS_ERRORS: Record<number, string> = {
  401: 'validation.unauthorized',
  403: 'validation.forbidden',
  404: 'validation.notFound',
  429: 'validation.tooManyRequests',
  500: 'validation.serverError',
}

function getErrorIcon(status?: number): string {
  switch (status) {
    case 401:
      return 'lucide:shield-ellipsis'
    case 403:
      return 'lucide:circle-alert'
    case 404:
      return 'lucide:circle-help'
    case 429:
      return 'lucide:shield-minus'
    case 500:
      return 'lucide:shield-ban'
    default:
      return 'lucide:circle-x'
  }
}

async function executeCallbacks(callbacks: any, context: any) {
  if (!callbacks)
    return

  const callbackArray = Array.isArray(callbacks) ? callbacks : [callbacks]

  for (const callback of callbackArray) {
    if (typeof callback === 'function') {
      try {
        await callback(context)
      }
      catch (error) {
        console.warn('[API Factory] Callback execution error:', error)
      }
    }
  }
}

export default defineNuxtPlugin(() => {
  const toast = useToast()

  const createApiFetcher = (apiProfile: ApiProfile, customInterceptors: AnyObject) => {
    const { showToast, response: respConfig, debug, toast: customToast, customHeaders } = apiProfile

    const showToastMessage = (message: string, type: 'success' | 'error' = 'error', status?: number) => {
      if (!showToast || !import.meta.client)
        return

      toast.add({
        description: message,
        color: type,
        icon: type === 'success' ? 'lucide:circle-check' : getErrorIcon(status),
        ...customToast,
      })
    }

    const handleResponseError = (request: RequestInfo, response: any, error?: Error) => {
      const serverMsg = response._data?.[respConfig.messageKey]
      const status = response.status
      const errorMsg = serverMsg?.trim() || (status && STATUS_ERRORS[status] ? smartT(STATUS_ERRORS[status]) : smartT('validation.responseError'))
      const responseError = new Error(errorMsg)

      console.error(`[API Factory Error] ${errorMsg}`, { request, response, originalError: error })
      showToastMessage(errorMsg, 'error', response.status)

      throw responseError
    }

    return $fetch.create({
      async onRequest(context) {
        await executeCallbacks(customInterceptors.onRequest, context)

        const { options } = context

        if (debug && customHeaders) {
          Object.entries(customHeaders).forEach(([key, value]) => {
            options.headers.set(key, value)
          })
        }
      },

      async onRequestError(context) {
        await executeCallbacks(customInterceptors.onRequestError, context)

        const { error, request } = context

        console.error(`[API Factory Error] ${smartT('validation.error')}`, { request, error })
        showToastMessage(smartT('validation.error'))
        throw error
      },

      async onResponse(context) {
        await executeCallbacks(customInterceptors.onResponse, context)

        const { response, request, error } = context
        const isJson = response.headers.get('content-type')?.toLowerCase().includes('application/json')

        if (!isJson) {
          return
        }

        const data = response._data
        const isSuccess = respConfig.successCodes.includes(data[respConfig.codeKey])
        const message = data[respConfig.messageKey]

        if (isSuccess) {
          showToastMessage(message || smartT('validation.success'), 'success')
        }
        else {
          handleResponseError(request, { ...response, _data: data }, error)
        }
      },

      async onResponseError(context) {
        await executeCallbacks(customInterceptors.onResponseError, context)

        const { response, request, error } = context

        handleResponseError(request, response, error)
      },
    })
  }

  return {
    provide: {
      createApiFetcher,
    },
  }
})
