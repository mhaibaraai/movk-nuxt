import type { ApiFetchOptions } from '../types'
import { defineNuxtPlugin, useToast, useUserSession } from '#imports'
import { isEmpty, separate } from '@movk/core'
import { ApiProfileSchema } from '../types'
import { validateApiProfile } from '../utils/api'
import { smartT } from '../utils/t'

export default defineNuxtPlugin(() => {
  const API_PROFILE_KEYS = ApiProfileSchema.keyof().options
  const toast = useToast()

  const createApiFetcher = <DataT>(options: ApiFetchOptions<DataT>) => {
    const { picked, omitted: fetchOptions } = separate(options, API_PROFILE_KEYS)

    const apiProfile = validateApiProfile(picked)
    const { showToast, response: respConfig, toast: customToast, customHeaders, auth: authOptions } = apiProfile

    const showToastMessage = (message: string, type: 'success' | 'error' = 'error') => {
      if (!showToast || !import.meta.client)
        return

      toast.add({
        description: message,
        color: type,
        icon: type === 'success' ? 'lucide-circle-check' : 'lucide-circle-x',
        ...customToast,
      })
    }

    const handleResponseError = (request: RequestInfo, response: any, error?: Error) => {
      const serverMsg = response._data?.[respConfig.messageKey]
      const errorMsg = serverMsg?.trim() || smartT('validation.responseError')
      const responseError = new Error(errorMsg)

      console.error(`[API Factory Error] ${errorMsg}`, { request, response, originalError: error })
      showToastMessage(errorMsg, 'error')

      throw responseError
    }

    const $api = $fetch.create({
      async onRequest(context) {
        const { options } = context

        if (authOptions?.enable) {
          const { session } = useUserSession()
          const token = session.value?.[authOptions.key]
          if (token) {
            options.headers.set(authOptions.name, authOptions.prefix + token)
          }
        }

        if (!isEmpty(customHeaders)) {
          Object.entries(customHeaders).forEach(([key, value]) => {
            options.headers.set(key, value)
          })
        }
      },

      async onRequestError(context) {
        const { error, request } = context

        console.error(`[API Factory Error] ${smartT('validation.error')}`, { request, error })
        showToastMessage(smartT('validation.error'))
        throw error
      },

      async onResponse(context) {
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
        const { response, request, error } = context

        handleResponseError(request, response, error)
      },
    })

    return {
      $api,
      apiProfile,
      fetchOptions,
    }
  }

  return {
    provide: {
      createApiFetcher,
    },
  }
})
