export const USER_STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  ACTIVE: 'success',
  DISABLED: 'neutral',
  LOCKED: 'warning',
  DELETED: 'error'
}

export const USER_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '正常',
  DISABLED: '禁用',
  LOCKED: '锁定',
  DELETED: '已删除'
}

export const ENABLED_DISABLED_COLOR: Record<string, 'success' | 'neutral'> = {
  ENABLED: 'success',
  DISABLED: 'neutral'
}

export const ENABLED_DISABLED_LABEL: Record<string, string> = {
  ENABLED: '启用',
  DISABLED: '禁用'
}
