export const AUTOFORM_META = {
  KEY: '__autoform_meta__',
  LAYOUT_KEY: '__autoform_layout__'
} as const

export const AUTOFORM_LIMITS = {
  /** 递归深度限制，防止无限递归 */
  MAX_RECURSION_DEPTH: 20,
  /** 数组长度限制，防止处理过大的数组 */
  MAX_ARRAY_LENGTH: 500,
  /** 对象属性数量限制，防止处理过大的对象 */
  MAX_OBJECT_PROPERTIES: 200
} as const

export const AUTOFORM_PATTERNS = {
  /** 事件属性检测正则，匹配 onClick、onChange 等 Vue/React 事件命名模式 */
  EVENT_PROP: /^on[A-Z]/
} as const

/** zod 克隆方法 */
export const CLONE_METHODS = [
  'meta', 'optional', 'nullable', 'nullish', 'array', 'promise', 'or', 'and',
  'transform', 'default', 'catch', 'pipe', 'readonly', 'refine', 'describe',
  'brand', 'min', 'max', 'length', 'nonempty', 'email', 'url', 'uuid', 'regex',
  'trim', 'toLowerCase', 'toUpperCase', 'startsWith', 'endsWith', 'includes',
  'datetime', 'ip'
] as const
