import type { OmitByKey, StorageConfigInput } from '@movk/core'
import type { z } from 'zod/v4'

export interface ThemeConfig {
  name: string
  schema: z.ZodType
  extractor?: (appConfig: any) => any
  processor?: (value: any) => any
}

export type ThemeConfigFromItems<T extends readonly ThemeConfig[]> = {
  [Item in T[number]as Item['name']]: z.infer<Item['schema']>
}

export interface ThemeManagerOptions<T extends ThemeConfig[] = ThemeConfig[]>
  extends OmitByKey<StorageConfigInput<ThemeConfigFromItems<T>>, 'defaultValue' | 'schema'> {
  configItems: T
  /**
   * 同步到 AppConfig 的微防抖毫秒数。
   * - 未设置时默认 16ms；
   * - 设为 0 表示每次更新立即同步；
   * - 仅影响存储值写入 AppConfig 的时机，不改变管道逻辑。
   */
  syncDebounce?: number
}
