import type { Direction } from '@nuxt/ui'
import type { ModuleOptions } from '../../module'

/**
 * movk 主题默认 app.config（Nuxt 模式 addTheme 与 Vue 模式 unplugin 共用）。
 * 放在 runtime 内，避免 runtime 反向依赖构建期 `src/utils`（dist 运行时无法解析）。
 */
export function getDefaultConfig(theme?: ModuleOptions['theme']) {
  // 结构化注解避免 dts 引用私有 ThemeFontConfig（保持类型导出最小必要）
  const pickerFonts: Array<{ name: string, href?: string }> = theme?.fonts ?? [
    { name: 'Alibaba PuHuiTi', href: 'https://cdn.mhaibaraai.cn/fonts/alibaba-puhuiti.css' },
    { name: 'Public Sans' },
    { name: 'DM Sans' },
    { name: 'Geist' },
    { name: 'Inter' },
    { name: 'Poppins' },
    { name: 'Outfit' },
    { name: 'Raleway' }
  ]
  const pickerRadiuses = theme?.radiuses ?? [0, 0.125, 0.25, 0.375, 0.5]
  const pickerNeutralColors = theme?.neutralColors ?? ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']

  return {
    dir: 'ltr' as Direction,
    radius: 0.25,
    blackAsPrimary: false,
    font: 'Alibaba PuHuiTi',
    icons: 'lucide',
    prefix: theme?.prefix,
    tv: {
      twMergeConfig: {
        prefix: theme?.prefix
      }
    },
    picker: { fonts: pickerFonts, radiuses: pickerRadiuses, neutralColors: pickerNeutralColors }
  }
}
