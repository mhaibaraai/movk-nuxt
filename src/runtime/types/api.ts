import type { ToastProps } from '@nuxt/ui'
import type { UseFetchOptions } from 'nuxt/app'
import { getRandomUUID } from '@movk/core'
import { z } from 'zod/v4'

const ApiAuthSchema = z.object({
  enable: z.boolean().default(true),
  key: z.string().default('token'),
  name: z.string().default('Authorization'),
  prefix: z.string().default('Bearer '),
})

const ApiResponseProfileSchema = z.object({
  codeKey: z.string().default('code'),
  dataKey: z.string().default('data'),
  messageKey: z.string().default('message'),
  successCodes: z.array(z.union([z.string(), z.number()])).default([0, 200, 10001, '0', '200', '10001']),
})

interface ApiDownloadSchema {
  filename?: string
}

export const ApiProfileSchema = z.object({
  response: ApiResponseProfileSchema.default(ApiResponseProfileSchema.parse({})),
  customHeaders: z.record(z.string(), z.string()).default({
    'X-Trace-Id': getRandomUUID(),
  }),
  showToast: z.boolean().default(true),
  toast: z.custom<ToastProps>().default({}),
  download: z.custom<ApiDownloadSchema>().optional(),
  auth: ApiAuthSchema.default(ApiAuthSchema.parse({})),
})

export type ApiProfile = z.infer<typeof ApiProfileSchema>
export type ApiProfileInput = z.input<typeof ApiProfileSchema>

export type ApiFetchOptions<DataT> = ApiProfileInput & Omit<UseFetchOptions<DataT>, '$fetch'>
