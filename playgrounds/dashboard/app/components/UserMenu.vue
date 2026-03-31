<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { $api } = useNuxtApp()
const appConfig = useAppConfig()
const colorMode = useColorMode()
const { currentUser, clearCurrentUser } = useCurrentUser()
const { clear: clearSession, session } = useUserSession()
const {
  primaryColors,
  primary,
  blackAsPrimary,
  neutralColors,
  neutral,
  radiuses,
  radius,
  fonts,
  font,
  icons,
  icon,
  modes,
  mode
} = useTheme()

const user = computed(() => ({
  name: currentUser.value?.nickname || currentUser.value?.username || '',
  description: currentUser.value?.email || '',
  avatar: {
    src: currentUser.value?.avatar || undefined,
    alt: currentUser.value?.nickname || currentUser.value?.username || ''
  }
}))

async function handleLogout() {
  await $api('/v1/auth/logout', {
    method: 'POST',
    body: {
      refreshToken: session.value?.jwt?.refresh_token
    }
  }).catch(() => { })
  await clearSession()
  clearCurrentUser()
  navigateTo('/login')
}

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value.name,
  avatar: user.value.avatar,
  description: user.value.description
}], [{
  label: '主题色',
  icon: 'i-lucide-palette',
  children: [{
    label: 'Primary',
    slot: 'chip',
    chip: appConfig.ui.colors.primary,
    content: {
      align: 'center',
      collisionPadding: 16
    },
    children: primaryColors.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      checked: !blackAsPrimary.value && primary.value === color,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()

        primary.value = color
      }
    }))
  }, {
    label: 'Neutral',
    slot: 'chip',
    chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
    content: {
      align: 'end',
      collisionPadding: 16
    },
    children: neutralColors.map(color => ({
      label: color,
      chip: color === 'neutral' ? 'old-neutral' : color,
      slot: 'chip',
      type: 'checkbox',
      checked: neutral.value === color,
      onSelect: (e) => {
        e.preventDefault()

        neutral.value = color
      }
    }))
  }]
}, {
  label: '圆角',
  icon: 'i-lucide-radius',
  children: radiuses.map((r, idx) => ({
    label: `${['None', 'XS', 'SM', 'MD', 'LG'][idx]} · ${r}`,
    type: 'checkbox',
    checked: radius.value === r,
    onSelect: (e) => {
      e.preventDefault()

      radius.value = r
    }
  }))
}, {
  label: '字体',
  icon: 'i-lucide-type',
  children: fonts.map(f => ({
    label: f,
    type: 'checkbox',
    checked: font.value === f,
    onSelect: (e) => {
      e.preventDefault()

      font.value = f
    }
  }))
}, {
  label: '图标',
  icon: 'i-lucide-shapes',
  children: icons.map(i => ({
    label: i.label,
    icon: i.icon,
    type: 'checkbox',
    checked: icon.value === i.value,
    onSelect: (e) => {
      e.preventDefault()

      icon.value = i.value
    }
  }))
}, {
  label: '外观',
  icon: 'i-lucide-sun-moon',
  children: modes.value.map(m => ({
    label: m.label,
    icon: m.icon,
    type: 'checkbox',
    checked: colorMode.preference === m.label,
    onSelect: (e) => {
      e.preventDefault()

      mode.value = m.label
    }
  }))
}], [{
  label: '文档',
  icon: 'i-lucide-book-open',
  to: 'https://dashboard.mhaibaraai.cn',
  target: '_blank'
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  to: 'https://github.com/mhaibaraai/movk-nuxt-dashboard',
  target: '_blank'
}, {
  label: '退出登录',
  icon: 'i-lucide-log-out',
  onSelect: handleLogout
}]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
