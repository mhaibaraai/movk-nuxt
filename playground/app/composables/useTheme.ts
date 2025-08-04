import type { ThemeConfig } from '#movk/types'
import { z } from 'zod/v4'

const coreConfigItems = [
  {
    name: 'ui',
    schema: z.object({
      colors: z.object({
        primary: z.string(),
        neutral: z.string(),
      }),
    }),
  },
  {
    name: 'theme',
    schema: z.object({
      radius: z.number().min(0).max(2),
      blackAsPrimary: z.boolean(),
    }),
  },
] as const satisfies ThemeConfig[]

export function useTheme() {
  const themeManager = createThemeManager({
    key: 'admin-theme',
    configItems: coreConfigItems,
  })

  return {
    managerTheme: themeManager.managerTheme,
    themeManager,
  }
}
