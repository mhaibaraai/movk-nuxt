import type { NavigationMenuItem } from '@nuxt/ui'

export function flattenNav(items: NavigationMenuItem[] | undefined): NavigationMenuItem[] {
  if (!items) return []
  const result: NavigationMenuItem[] = []
  const visit = (item: NavigationMenuItem) => {
    if (item.to) result.push(item)
    if (item.children) item.children.forEach(visit)
  }
  items.forEach(visit)
  return result
}
