import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    // Vue（非 Nuxt）支持
    './src/unplugin',
    './src/vite'
  ],
  rollup: {
    replace: {
      delimiters: ['', ''],
      values: {
        // vue 模式构建强制走主题模板的生产分支
        'process.argv.includes(\'--uiDev\')': 'false'
      }
    }
  },
  hooks: {
    'mkdist:entry:options'(ctx, entry, options) {
      options.addRelativeDeclarationExtensions = false
    }
  },
  externals: ['#build/ui', '#build/movk-ui', 'vite', '@nuxt/ui']
})
