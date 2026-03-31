<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links = [
  {
    label: '用户管理',
    icon: 'i-lucide-users',
    to: '/system/user'
  }
  // {
  //   label: '角色管理',
  //   icon: 'i-lucide-shield-check',
  //   to: '/system/role'
  // },
  // {
  //   label: '部门管理',
  //   icon: 'i-lucide-building-2',
  //   to: '/system/dept'
  // },
  // {
  //   label: '菜单管理',
  //   icon: 'i-lucide-layout-list',
  //   to: '/system/menu'
  // }
] satisfies NavigationMenuItem[]
</script>

<template>
  <UDashboardPanel id="system">
    <template #header>
      <UDashboardNavbar title="系统管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>
