<script lang="ts" setup>
import type { DropdownMenuItem } from '@nuxt/ui'
import { title } from '~/constants'

const { locale, setLocale, locales } = useI18n()

const localeItems = computed(() => {
  return locales.value.map((l) => {
    return {
      label: l.name,
      type: 'checkbox',
      checked: locale.value === l.code,
      onSelect: (e: Event) => {
        e.preventDefault()
        setLocale(l.code)
      },
    } satisfies DropdownMenuItem
  })
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 inset-0 fixed ">
    <GradientBackground />

    <div class="absolute left-0 top-0 z-10 ml-6 mt-6">
      <UUser
        :name="title"
        :avatar="{
          src: '/logo.svg',
        }"
        size="xl"
      />
    </div>

    <UFieldGroup class="absolute right-6 top-6 z-10 bg-elevated px-3 py-1 rounded-xl">
      <ThemePicker />
      <UDropdownMenu :ui="{ content: 'w-24' }" :items="localeItems">
        <UButton icon="i-lucide-languages" color="neutral" variant="ghost" />
      </UDropdownMenu>
      <UColorModeButton />
    </UFieldGroup>

    <UPageCard class="md:w-2/3 lg:w-1/2 xl:w-[36%]">
      <slot />
    </UPageCard>
  </div>
</template>
