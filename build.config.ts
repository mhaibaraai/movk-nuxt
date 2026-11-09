import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    // Vue（非 Nuxt）支持
    './src/unplugin',
    './src/vite'
  ],
  hooks: {
    'mkdist:entry:options'(ctx, entry, options) {
      options.addRelativeDeclarationExtensions = false
    }
  },
  externals: ['#build/ui', 'vite', '@nuxt/ui']
})
