<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'

// useNavigation / provide 由 movk unplugin 自动导入（共享自 playgrounds/play）
const appConfig = useAppConfig()
const { components, items } = useNavigation()

// Vue + Vite 模式不含 API 域：过滤 API 分组与上传/下载进度条目（对应 main.ts 排除的路由）
const PROGRESS = ['Upload Progress', 'Download Progress']
const navComponents = components
  .filter(group => group.label !== 'API')
  .map(group => group.label === 'Composables'
    ? { ...group, children: group.children?.filter(child => !PROGRESS.includes(child.label as string)) }
    : group)

provide('components', navComponents)
</script>

<template>
  <UApp :locale="zh_cn" :toaster="appConfig.toaster" :dir="appConfig.movk?.dir">
    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        class="bg-elevated/25"
        resizable
        collapsible
        :toggle="{ size: 'sm', variant: 'outline', class: 'ring-default' }"
      >
        <template #header="{ collapsed }">
          <RouterLink to="/" class="text-highlighted inline-flex items-center gap-2" aria-label="Home">
            <UIcon name="i-lucide-zap" class="size-5" />
            <span v-if="!collapsed" class="font-semibold">Movk · Vue</span>
          </RouterLink>

          <div v-if="!collapsed" class="flex items-center ms-auto">
            <ThemeDropdown />
            <UColorModeButton />
          </div>
        </template>

        <template #default="{ collapsed }">
          <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
          <USeparator type="dashed" />
          <UNavigationMenu
            :collapsed="collapsed"
            variant="link"
            :items="navComponents"
            orientation="vertical"
          />
        </template>
      </UDashboardSidebar>

      <UDashboardPanel :ui="{ body: 'mt-16' }">
        <template #body>
          <RouterView />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
