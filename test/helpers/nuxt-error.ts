/** 与 nuxt/app 的 createError / isNuxtError 同签名的替身：nuxt/app 依赖 #build，无法在单测中直接导入 */
export function isNuxtError(error: unknown): boolean {
  return !!error && typeof error === 'object' && '__nuxt_error' in error
}

export function createError(input: { statusCode?: number, message?: string, data?: unknown }) {
  const error = new Error(input.message) as Error & { statusCode: number, data?: unknown }
  error.statusCode = input.statusCode ?? 500
  error.data = input.data
  Object.defineProperty(error, '__nuxt_error', { value: true })
  return error
}
