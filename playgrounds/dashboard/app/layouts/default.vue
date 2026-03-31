<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const open = ref(false)

const links = [[{
  label: '首页',
  icon: 'i-lucide-house',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: '系统管理',
  to: '/system',
  icon: 'i-lucide-cog',
  defaultOpen: true,
  type: 'trigger',
  children: [
    {
      label: '用户管理',
      to: '/system/user',
      onSelect: () => {
        open.value = false
      }
    }
    // {
    //   label: '角色管理',
    //   to: '/system/role',
    //   onSelect: () => {
    //     open.value = false
    //   }
    // },
    // {
    //   label: '部门管理',
    //   to: '/system/dept',
    //   onSelect: () => {
    //     open.value = false
    //   }
    // },
    // {
    //   label: '菜单管理',
    //   to: '/system/menu',
    //   onSelect: () => {
    //     open.value = false
    //   }
    // }
  ]
}], [{
  label: '反馈',
  icon: 'i-lucide-message-circle',
  to: 'https://github.com/mhaibaraai/movk-nuxt-dashboard',
  target: '_blank'
}, {
  label: '帮助与支持',
  icon: 'i-lucide-info',
  to: 'https://github.com/mhaibaraai/movk-nuxt-dashboard',
  target: '_blank'
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: '前往',
  items: links.flat()
}, {
  id: 'code',
  label: '代码',
  items: [{
    id: 'source',
    label: '查看页面源码',
    icon: 'i-simple-icons-github',
    to: `https://github.com/mhaibaraai/movk-nuxt-dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
    target: '_blank'
  }]
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical" tooltip popover />

        <UNavigationMenu :collapsed="collapsed" :items="links[1]" orientation="vertical" tooltip class="mt-auto" />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>
