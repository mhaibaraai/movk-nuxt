import type { Direction } from '@nuxt/ui'
import type { ModuleOptions } from '../../module'

/**
 * movk 主题默认 app.config（Nuxt 模式 addTheme 与 Vue 模式 unplugin 共用）。
 * 放在 runtime 内，避免 runtime 反向依赖构建期 `src/utils`（dist 运行时无法解析）。
 */
export function getDefaultConfig(theme?: ModuleOptions['theme']) {
  const pickerRadiuses = theme?.radiuses ?? [0, 0.125, 0.25, 0.375, 0.5]
  const pickerNeutralColors = theme?.neutralColors ?? ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']

  return {
    dir: 'ltr' as Direction,
    // 缺省不指定圆角：运行时不注入 --ui-radius，沿用 @nuxt/ui 默认值或项目 CSS
    radius: theme?.radius,
    blackAsPrimary: false,
    icons: 'lucide',
    prefix: theme?.prefix,
    tv: {
      twMergeConfig: {
        prefix: theme?.prefix
      }
    },
    picker: { radiuses: pickerRadiuses, neutralColors: pickerNeutralColors }
  }
}
