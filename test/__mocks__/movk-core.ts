import { vi } from 'vitest'

export const getPath = vi.fn((obj: any, path: string) => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
})

export const triggerDownload = vi.fn()

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
