/** 合并用户选择与配置的默认圆角。0 是合法档位，仅 null/undefined 视为未选择 */
export function resolveActiveRadius(
  stored: number | null | undefined,
  configured: number | undefined
): number | undefined {
  return stored ?? configured
}

/**
 * 缺省时输出空规则。该 style 无层级（unlayered），会压过项目 CSS 写在
 * `@theme` 中的 `--ui-radius`，因此只在圆角被显式配置或用户主动切换时才声明。
 */
export function resolveRadiusStyle(radius: number | undefined): string {
  if (radius === undefined) return ':root {}'

  return `:root { --ui-radius: ${radius}rem; }`
}
