import { vi } from 'vitest'

export const getPath = vi.fn((obj: any, path: string) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
})

export const triggerDownload = vi.fn()

export const extractFilename = vi.fn((headers: Headers, fallback: string) => {
  const disposition = headers.get('content-disposition')
  if (disposition) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (match && match[1]) {
      return match[1].replace(/['"]/g, '')
    }
  }
  return fallback
})

export const isObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const separate = vi.fn((obj: Record<string, any>, keys: string[]) => {
  const picked: Record<string, any> = {}
  const omitted: Record<string, any> = {}

  for (const key in obj) {
    if (keys.includes(key)) {
      picked[key] = obj[key]
    }
    else {
      omitted[key] = obj[key]
    }
  }

  return { picked, omitted }
})
