/** 递归深度限制，防止无限递归 */
const MAX_RECURSION_DEPTH = 20

/** 数组长度限制，防止处理过大的数组 */
const MAX_ARRAY_LENGTH = 500

/** 对象属性数量限制，防止处理过大的对象 */
const MAX_OBJECT_PROPERTIES = 200

/** 事件属性检测正则，匹配 onClick、onChange 等 Vue/React 事件命名模式 */
const EVENT_PROP_REGEX = /^on[A-Z]/

export const AUTOFORM_META = {
  KEY: '__autoform_meta__',
  LAYOUT_KEY: '__autoform_layout__'
} as const

export const AUTOFORM_LIMITS = {
  MAX_RECURSION_DEPTH,
  MAX_ARRAY_LENGTH,
  MAX_OBJECT_PROPERTIES
} as const

export const AUTOFORM_PATTERNS = {
  EVENT_PROP: EVENT_PROP_REGEX
} as const
