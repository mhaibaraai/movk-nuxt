import { applyPaletteVars } from './theme-palette'

const PALETTE_VAR = /^--ui-color-(primary|neutral)-\d{2,3}$/

/** 存放运行时色板变量表（`resolvePaletteVars` 的结果）的 localStorage 键 */
export function colorsStorageKey(name: string): string {
  return `${name}-ui-colors`
}

/**
 * 首屏前把 localStorage 中的色板变量写到 `<html>` 内联样式，避免切换过的主色/中性色闪烁。
 * 只接受 `--ui-color-{primary,neutral}-<shade>`，存储缺失或损坏时静默跳过
 */
export function createColorRestoreScript(name: string): string {
  return `(function () {
    try {
      var vars = JSON.parse(localStorage.getItem(${JSON.stringify(colorsStorageKey(name))}) || 'null');
      if (!vars || typeof vars !== 'object') return;
      for (var key in vars) {
        if (${PALETTE_VAR}.test(key) && typeof vars[key] === 'string') {
          document.documentElement.style.setProperty(key, vars[key]);
        }
      }
    } catch (e) {}
  })();`.replace(/\s+/g, ' ')
}

/** 客户端兜底（SPA、Vue 模式或首屏脚本未执行时）：按同一规则回放 localStorage 中的色板变量 */
export function restorePaletteVars(name: string): void {
  const key = colorsStorageKey(name)
  try {
    const vars: unknown = JSON.parse(localStorage.getItem(key) || 'null')
    if (!vars || typeof vars !== 'object') return
    const valid = Object.fromEntries(Object.entries(vars).filter(([k, v]) => PALETTE_VAR.test(k) && typeof v === 'string'))
    applyPaletteVars(document.documentElement, valid)
  } catch {
    localStorage.removeItem(key)
  }
}
