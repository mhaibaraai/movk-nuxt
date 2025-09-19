import type { AnyObject, DeepPartial } from '@movk/core'
import type { ThemeConfig, ThemeConfigFromItems, ThemeManagerOptions } from '../types/theme'
import { updateAppConfig, useAppConfig } from '#imports'
import { debounce, useAppStorage } from '@movk/core'
import defu from 'defu'
import { computed, readonly } from 'vue'
import { z } from 'zod/v4'

/**
 * 创建主题管理器，提供主题配置的持久化存储和响应式管理
 *
 * @category Theme
 * @param options 主题管理器配置选项
 * @returns 主题管理器对象，包含主题状态和操作方法
 * @example
 * ```ts
 * import { createThemeManager } from '@movk/nuxt'
 *
 * // 定义主题配置项
 * const themeConfig = [
 *   {
 *     name: 'colorMode',
 *     schema: z.enum(['light', 'dark']),
 *     extractor: (appConfig) => appConfig.colorMode,
 *     processor: (value) => value === 'auto' ? 'light' : value
 *   },
 *   {
 *     name: 'primaryColor',
 *     schema: z.string(),
 *     extractor: (appConfig) => appConfig.theme?.primaryColor
 *   }
 * ]
 *
 * // 创建主题管理器
 * const themeManager = createThemeManager({
 *   key: 'app-theme',
 *   configItems: themeConfig,
 *   storage: 'localStorage',
 *   prefix: 'movk',
 *   syncDebounce: 100
 * })
 *
 * // 获取当前主题
 * const currentTheme = themeManager.getCurrentTheme()
 *
 * // 更新主题
 * themeManager.updateTheme({
 *   colorMode: 'dark',
 *   primaryColor: '#007bff'
 * })
 *
 * // 重置主题
 * themeManager.resetTheme()
 *
 * // 微防抖同步
 * themeManager.syncToAppConfig()
 *
 * // 手动立即同步
 * themeManager.flush()
 * ```
 */
export function createThemeManager<T extends ThemeConfig[]>(options: ThemeManagerOptions<T>) {
  const { key, configItems, storage, prefix, syncDebounce } = options

  const syncDelayMs = Math.max(0, syncDebounce ?? 16)

  const appConfig = useAppConfig()
  const flatSchema = buildFlatSchema(configItems as unknown as ThemeConfig[])

  const extractFromAppConfig = (): AnyObject => {
    const config: AnyObject = {}

    try {
      for (const item of configItems) {
        try {
          const extracted = item.extractor?.(appConfig) ?? appConfig[item.name]
          if (extracted !== undefined && extracted !== null) {
            config[item.name] = extracted
          }
        }
        catch (error) {
          handleConfigError(`config item "${item.name}" extraction`, error)
        }
      }
    }
    catch (error) {
      handleConfigError('flat config extraction', error, {})
    }

    return config
  }
  const initialConfig = extractFromAppConfig()

  const storedTheme = useAppStorage<ThemeConfigFromItems<T>>({
    key,
    schema: flatSchema,
    defaultValue: initialConfig as ThemeConfigFromItems<T>,
    storage,
    prefix,
  })

  const syncNow = (config?: AnyObject) => {
    const themeConfig = config || (storedTheme.state.value as AnyObject)
    if (!themeConfig)
      return
    try {
      updateAppConfig(themeConfig as any)
    }
    catch (error) {
      handleConfigError('sync to app config', error)
    }
  }

  let syncToAppConfig: (config?: AnyObject) => void = syncNow
  if (syncDelayMs > 0) {
    syncToAppConfig = debounce((config?: AnyObject) => {
      syncNow(config)
    }, syncDelayMs)
  }

  if (import.meta.client && storedTheme.state.value) {
    syncNow(storedTheme.state.value)
  }

  const processConfig = (config: ThemeConfigFromItems<T>): ThemeConfigFromItems<T> => {
    const processedConfig = { ...config }

    for (const item of configItems) {
      const configKey = item.name as string
      const currentValue = (processedConfig as AnyObject)[configKey]
      if (
        currentValue !== undefined
        && currentValue !== null
        && item.processor
      ) {
        try {
          ;(processedConfig as AnyObject)[configKey] = item.processor(currentValue)
        }
        catch (error) {
          handleConfigError(`config item "${item.name}" processing`, error)
        }
      }
    }

    return processedConfig
  }

  const normalizeAndValidate = (config: DeepPartial<ThemeConfigFromItems<T>>): ThemeConfigFromItems<T> => {
    const validatedTheme = flatSchema.parse(config) as ThemeConfigFromItems<T>
    return processConfig(validatedTheme)
  }

  const theme = computed<ThemeConfigFromItems<T>>(() => {
    const storedValue = storedTheme.state.value as unknown as DeepPartial<ThemeConfigFromItems<T>>
    return normalizeAndValidate(storedValue)
  })

  const getCurrentTheme = (): ThemeConfigFromItems<T> => theme.value

  const updateTheme = (partialConfig: DeepPartial<ThemeConfigFromItems<T>>): ThemeConfigFromItems<T> => {
    try {
      const currentTheme = getCurrentTheme()
      const updatedTheme = defu(partialConfig, currentTheme) as unknown as DeepPartial<ThemeConfigFromItems<T>>
      const normalized = normalizeAndValidate(updatedTheme)

      storedTheme.setItem(normalized)
      syncToAppConfig(normalized)

      return normalized
    }
    catch (error) {
      handleConfigError('theme update', error)
      throw error
    }
  }

  const resetTheme = (): ThemeConfigFromItems<T> => {
    const extractedConfig = extractFromAppConfig() as DeepPartial<ThemeConfigFromItems<T>>
    const normalized = normalizeAndValidate(extractedConfig)
    storedTheme.setItem(normalized)
    syncToAppConfig(normalized)
    return normalized
  }

  const flush = (): void => {
    syncNow(storedTheme.state.value as AnyObject)
  }

  return {
    managerTheme: readonly(theme),
    getCurrentTheme,
    updateTheme,
    resetTheme,
    syncToAppConfig,
    flush,
  }
}

/**
 * 构建扁平化的Zod schema，用于验证主题配置
 *
 * @category Theme
 * @param configItems 主题配置项数组
 * @returns 合并后的Zod schema对象
 * @example
 * ```ts
 * const configItems = [
 *   { name: 'colorMode', schema: z.enum(['light', 'dark']) },
 *   { name: 'fontSize', schema: z.number().min(12).max(24) }
 * ]
 *
 * const schema = buildFlatSchema(configItems)
 * // 生成的schema等同于：
 * // z.object({
 * //   colorMode: z.enum(['light', 'dark']),
 * //   fontSize: z.number().min(12).max(24)
 * // }).partial()
 * ```
 */
function buildFlatSchema(configItems: ThemeConfig[]) {
  const schemaFields = configItems.reduce(
    (acc, item) => {
      acc[item.name] = item.schema
      return acc
    },
    {} as Record<string, z.ZodType>,
  )

  return z.object(schemaFields).partial().strict()
}

function handleConfigError(operation: string, error: unknown, fallback?: any): any {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.warn(`Theme ${operation} failed:`, errorMessage)

  if (fallback !== undefined) {
    return fallback
  }

  throw new Error(`Theme ${operation} failed: ${errorMessage}`)
}
