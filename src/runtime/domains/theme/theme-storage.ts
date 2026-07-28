/**
 * font 与 radius 的存储语义已变更：旧版本存的是「含默认值的生效值」，
 * 新版本只存「用户的显式选择」。沿用同一个键会让历史默认值伪装成用户选择，
 * 压过项目的 theme.font / theme.radius 配置，故为这两个字段加版本后缀。
 */
const VERSIONED_FIELDS = ['font', 'radius'] as const

type VersionedField = typeof VERSIONED_FIELDS[number]
type ThemeStorageField = VersionedField | 'primary' | 'neutral' | 'icons' | 'black-as-primary'

const STORAGE_VERSION = 'v2'

export function storageKey(name: string, field: ThemeStorageField): string {
  const base = `${name}-ui-${field}`

  return (VERSIONED_FIELDS as readonly string[]).includes(field)
    ? `${base}-${STORAGE_VERSION}`
    : base
}

/** 升级前写入、语义已不适用的键，需在客户端清理 */
export function legacyStorageKeys(name: string): string[] {
  return VERSIONED_FIELDS.map(field => `${name}-ui-${field}`)
}
