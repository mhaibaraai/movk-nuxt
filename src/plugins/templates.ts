import fs from 'node:fs'
import path from 'node:path'
import type { UnpluginOptions } from 'unplugin'
import type { MovkUIOptions } from '../unplugin'
import { getTemplates } from '../templates'

/**
 * 生成 movk 主题虚拟模板并供给 Vue 构建。
 * 关键：把模板写到真实磁盘（node_modules/.movk-ui），再把 `#build/movk-ui/*`、
 * `#build/movk-ui.css` alias 到真实文件——否则 Tailwind v4 扫不到主题类，组件无样式。
 */
export default function MovkTemplatePlugin(options: MovkUIOptions): UnpluginOptions {
  const templates = getTemplates(options as any).filter(t => t.write && t.filename)
  const templateKeys = new Set(templates.map(t => `#build/${t.filename}`))

  async function writeTemplates(root: string) {
    const map: Record<string, string> = {}
    const dir = path.join(root, 'node_modules', '.movk-ui')
    for (const template of templates) {
      const filePath = path.join(dir, template.filename!)
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
      }
      fs.writeFileSync(filePath, await template.getContents!({} as any))
      map[`#build/${template.filename}`] = filePath
    }
    return map
  }

  return {
    name: 'movk:templates',
    enforce: 'pre',
    vite: {
      async config(config) {
        const alias = await writeTemplates(config.root || process.cwd())
        return { resolve: { alias } }
      }
    },
    resolveId(id) {
      // 仅处理 .ts 主题模块（运行时具名导入）；.css 走 vite alias → 磁盘文件，保留 @source 相对路径
      if (templateKeys.has(id + '.ts')) {
        return id.replace('#build/', 'virtual:movk-templates/') + '.ts'
      }
    },
    loadInclude: id => templateKeys.has(id.replace('virtual:movk-templates/', '#build/')),
    load(id) {
      const key = id.replace('virtual:movk-templates/', '#build/')
      return templates.find(t => `#build/${t.filename}` === key)!.getContents!({} as any)
    }
  } satisfies UnpluginOptions
}
