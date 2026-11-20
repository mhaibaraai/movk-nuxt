/** 以 `vars` 替换文案中的 `{name}` 占位符，缺失的变量保留原样 */
export function interpolate(message: string, vars?: Record<string, string | number>): string {
  if (!vars) return message
  return message.replace(/\{(\w+)\}/g, (_, name: string) => `${vars[name] ?? `{${name}}`}`)
}
