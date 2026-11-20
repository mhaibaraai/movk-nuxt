import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const root = mkdtempSync(join(tmpdir(), 'movk-pack-'))
const versionOf = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')).version

function run(program, args, cwd, stdio = 'inherit') {
  return execFileSync(program, args, { cwd, stdio, encoding: 'utf8' })
}

function fixture(name, dependencies, files) {
  const directory = join(root, name)
  mkdirSync(directory)
  for (const [file, content] of Object.entries({
    'package.json': JSON.stringify({ name, private: true, type: 'module', dependencies }),
    'pnpm-workspace.yaml': 'allowBuilds:\n  \'@parcel/watcher\': false\n  esbuild: false\n  sharp: true\n  vue-demi: false\n',
    ...files
  })) {
    const target = join(directory, file)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, content)
  }
  run('pnpm', ['install', '--no-frozen-lockfile', ...(process.env.MOVK_PACK_OFFLINE === '1' ? ['--offline'] : [])], directory)
  return directory
}

try {
  const tarball = process.argv[2]
    ? resolve(process.argv[2])
    : join(root, JSON.parse(run('npm', [
        'pack', '--ignore-scripts', '--pack-destination', root, '--json', '--cache', join(root, 'npm-cache')
      ], process.cwd(), 'pipe'))[0].filename)

  const shared = {
    '@movk/nuxt': 'file:' + tarball,
    '@internationalized/date': versionOf('../node_modules/@internationalized/date/package.json'),
    '@nuxt/ui': versionOf('../node_modules/@nuxt/ui/package.json'),
    'tailwindcss': versionOf('../node_modules/tailwindcss/package.json'),
    'zod': versionOf('../node_modules/zod/package.json'),
    'vue': versionOf('../node_modules/vue/package.json'),
    'typescript': versionOf('../node_modules/typescript/package.json'),
    'vue-tsc': versionOf('../node_modules/vue-tsc/package.json')
  }
  const files = {
    'app.vue': `<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import { ref } from 'vue'

const { afz } = useAutoForm()
const schema = afz.object({
  day: afz.calendarDate(),
  pinned: afz.boolean({ type: 'toggle', controlProps: { label: 'Pin article', activeColor: 'primary' } }).default(false),
  period: afz.enum(['day', 'week'], { type: 'toggleGroup', controlProps: { attached: true } }).default('week')
})
const state = ref({ day: new CalendarDate(2026, 11, 20) })
const searchSchema = afz.object({ keyword: afz.string().optional() })
</script>
<template>
  <UApp>
    <MAutoForm v-model="state" :schema="schema" />
    <MSearchForm :schema="searchSchema" sync-query />
  </UApp>
</template>
`,
    'main.css': '@import "tailwindcss";\n@import "@movk/nuxt";\n'
  }

  const nuxt = fixture('movk-pack-nuxt', {
    ...shared,
    nuxt: '4.6.4'
  }, {
    'nuxt.config.ts': 'export default defineNuxtConfig({ modules: [\'@movk/nuxt\'], css: [\'~/main.css\'], devtools: { enabled: false }, ui: { experimental: { componentDetection: true } } })\n',
    'tsconfig.json': '{ "extends": "./.nuxt/tsconfig.app.json" }\n',
    'app/app.vue': files['app.vue'],
    'app/main.css': files['main.css'],
    'app/check.ts': 'import type { DataTableServerCsvContext } from \'@movk/nuxt\'\nexport type Check = DataTableServerCsvContext\n'
  })
  run('pnpm', ['exec', 'nuxt', 'typecheck'], nuxt)
  run('pnpm', ['exec', 'nuxt', 'generate'], nuxt)
  const html = readFileSync(join(nuxt, '.output/public/index.html'), 'utf8')
  if (!html.includes('Nov 20, 2026')) throw new Error('The packaged calendar control did not render on the server.')
  if (!html.includes('>Pin article</span>') || !html.includes('>week</span>')) {
    throw new Error('The packaged toggle controls did not render on the server.')
  }

  const vite = fixture('movk-pack-vue', {
    ...shared,
    '@vitejs/plugin-vue': versionOf('../playgrounds/vue/node_modules/@vitejs/plugin-vue/package.json'),
    'vite': versionOf('../playgrounds/vue/node_modules/vite/package.json')
  }, {
    ...files,
    'vite.config.ts': 'import vue from \'@vitejs/plugin-vue\'\nimport movk from \'@movk/nuxt/vite\'\nimport { defineConfig } from \'vite\'\nexport default defineConfig({ plugins: [vue(), movk({ ui: { router: false, experimental: { componentDetection: [\'Separator\'] } } })] })\n',
    'index.html': '<div id="app"></div><script type="module" src="/main.ts"></script>\n',
    'tsconfig.json': '{ "compilerOptions": { "module": "esnext", "moduleResolution": "bundler", "target": "esnext", "strict": true, "skipLibCheck": true, "types": ["vite/client", "@movk/nuxt/vue-plugin"] }, "include": ["*.ts", "*.vue"] }\n',
    'main.ts': 'import \'./main.css\'\nimport { createApp } from \'vue\'\nimport plugin from \'@movk/nuxt/vue-plugin\'\nimport App from \'./app.vue\'\ncreateApp(App).use(plugin).mount(\'#app\')\n'
  })
  run('pnpm', ['exec', 'vite', 'build'], vite)
  run('pnpm', ['exec', 'vue-tsc', '--noEmit'], vite)
  const toggleGroupTheme = readFileSync(join(vite, 'node_modules/.nuxt-ui/ui/toggle-group.ts'), 'utf8')
  const separatorTheme = readFileSync(join(vite, 'node_modules/.nuxt-ui/ui/separator.ts'), 'utf8')
  if (!toggleGroupTheme.includes('inline-flex items-center') || !separatorTheme.includes('flex items-center text-center')) {
    throw new Error('Component detection did not retain the ToggleGroup and Separator themes.')
  }
}
finally {
  rmSync(root, { recursive: true, force: true })
}
