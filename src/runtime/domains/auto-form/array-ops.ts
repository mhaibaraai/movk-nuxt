export function withoutAt<T>(list: readonly T[], index: number): T[] {
  return [...list.slice(0, index), ...list.slice(index + 1)]
}

export function swapAt<T>(list: readonly T[], a: number, b: number): T[] {
  return list.map((item, i) => i === a ? list[b]! : i === b ? list[a]! : item)
}

export function insertAfter<T>(list: readonly T[], index: number, value: T): T[] {
  return [...list.slice(0, index + 1), value, ...list.slice(index + 1)]
}
