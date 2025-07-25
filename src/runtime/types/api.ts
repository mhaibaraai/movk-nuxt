import type { UseFetchOptions } from '#app'
import type { ToastProps } from '@nuxt/ui'
import { z } from 'zod/v4'

export const ApiAuthSchema = z.object({
  tokenKey: z.string().default('Authorization'),
  tokenPrefix: z.string().optional(),
})

export const ApiResponseProfileSchema = z.object({
  codeKey: z.string().default('code'),
  dataKey: z.string().default('data'),
  messageKey: z.string().default('msg'),
  successCodes: z.array(z.union([z.string(), z.number()])).default([200, 10001, '200', '10001']),
})

export interface ApiDownloadSchema {
  filename?: string
}

export const ApiProfileSchema = z.object({
  auth: ApiAuthSchema.default(ApiAuthSchema.parse({})),
  response: ApiResponseProfileSchema.default(ApiResponseProfileSchema.parse({})),
  debug: z.boolean().default(import.meta.dev),
  customHeaders: z.record(z.string(), z.string()).default({
    'X-Timestamp': new Date().toISOString(),
  }),
  showToast: z.boolean().default(true),
  toast: z.custom<ToastProps>().default({}),
  download: z.custom<ApiDownloadSchema>().optional(),
})

export type ApiProfile = z.infer<typeof ApiProfileSchema>
export type ApiProfileInput = z.input<typeof ApiProfileSchema>

export type ApiFetchOptions<DataT> = ApiProfileInput & Omit<UseFetchOptions<DataT>, '$fetch'>
