<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale'

const route = useRoute()
const appConfig = useAppConfig()
useHead({
  title: 'Movk Nuxt - Playground',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'Explore and test all Movk Nuxt in an interactive environment' }
  ]
})

const { components, groups, items } = useNavigation()

provide('components', components)
</script>

<template>
  <UApp :toaster="appConfig.toaster" :locale="zh_cn">
    <NuxtLoadingIndicator color="var(--ui-primary)" :height="2" />

    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        class="bg-elevated/25"
        resizable
        collapsible
        :toggle="{ size: 'sm', variant: 'outline', class: 'ring-default' }"
      >
        <template #header="{ collapsed }">
          <UAvatar src="/avatar.png" />

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
