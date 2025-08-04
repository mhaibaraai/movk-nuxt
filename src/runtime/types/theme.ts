import type { OmitByKey, StorageConfigInput } from '@movk/core'
import type { z } from 'zod/v4'

export interface ThemeConfig {
  name: string
  schema: z.ZodType
  extractor?: (appConfig: any) => any
  processor?: (value: any) => any
}

export type ThemeConfigFromItems<T extends readonly ThemeConfig[]> = {
  [Item in T[number]as Item['name']]: z.infer<Item['schema']>;
}

export interface ThemeManagerOptions<T extends ThemeConfig[] = ThemeConfig[]>
  extends OmitByKey<StorageConfigInput<ThemeConfigFromItems<T>>, 'defaultValue' | 'schema'> {
  configItems: T
}
