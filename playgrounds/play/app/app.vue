<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'
import colors from 'tailwindcss/colors'

const { style, link } = useTheme()
const route = useRoute()
const appConfig = useAppConfig()
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? (colors as any)[appConfig.ui.colors.neutral][900] : 'white')

useHead({
  title: 'Movk Nuxt - Playground',
  meta: [
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    ...link.value
  ],
  style
})

const { components, groups, items } = useNavigation()

provide('components', components)
</script>

<template>
  <UApp :toaster="appConfig.toaster as any" :locale="zh_cn">
    <NuxtLoadingIndicator color="var(--ui-primary)" :height="2" />

    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        class="bg-elevated/25"
        resizable
        collapsible
        :toggle="{ size: 'sm', variant: 'outline', class: 'ring-default' }"
      >
        <template #header="{ collapsed }">
          <UAvatar src="/avatar.png" loading="lazy" />

          <div v-if="!collapsed" class="flex items-center ms-auto">
            <ThemeDropdown />

            <UColorModeButton />
          </div>
        </template>

        <template #default="{ collapsed }">
          <UDashboardSearchButton :collapsed="collapsed" />

          <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />

          <USeparator type="dashed" />

          <UNavigationMenu
            :collapsed="collapsed"
            variant="link"
            :items="components"
            orientation="vertical"
          />
        </template>
      </UDashboardSidebar>

      <UDashboardPanel :ui="{ body: ['justify-center items-center', route.path.startsWith('/components') && 'mt-16'] }">
        <template #body>
          <NuxtPage />
        </template>
      </UDashboardPanel>

      <UDashboardSearch :groups="groups" :fuse="{ resultLimit: 100 }" />
    </UDashboardGroup>
  </UApp>
</template>
