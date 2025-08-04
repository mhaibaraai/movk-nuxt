<script setup lang="ts">
import { omit } from '@movk/core'
import colors from 'tailwindcss/colors'

const colorMode = useColorMode()
const { managerTheme, themeManager } = useTheme()

const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone']
const neutral = computed({
  get() {
    return managerTheme.value.ui.colors.neutral
  },
  set(option) {
    try {
      themeManager.updateTheme({
        ui: { colors: { neutral: option } },
      })
    }
    catch (error) {
      console.warn('Failed to update neutral color:', error)
    }
  },
})

const colorsToOmit = ['inherit', 'current', 'transparent', 'black', 'white', ...neutralColors]
const primaryColors = Object.keys(omit(colors, colorsToOmit as any))
const primary = computed({
  get() {
    return managerTheme.value.ui.colors.primary
  },
  set(option) {
    try {
      themeManager.updateTheme({
        ui: { colors: { primary: option } },
        theme: { blackAsPrimary: false },
      })
    }
    catch (error) {
      console.warn('Failed to update primary color:', error)
    }
  },
})

const radiuses = [0, 0.125, 0.25, 0.375, 0.5]
const radius = computed({
  get() {
    return managerTheme.value.theme.radius
  },
  set(option) {
    try {
      themeManager.updateTheme({
        theme: { radius: option },
      })
    }
    catch (error) {
      console.warn('Failed to update radius:', error)
    }
  },
})

const modes = [
  { label: 'light', icon: 'i-lucide-sun' },
  { label: 'dark', icon: 'i-lucide-moon' },
  { label: 'system', icon: 'i-lucide-monitor' },
]
const mode = computed({
  get() {
    return colorMode.value
  },
  set(option) {
    colorMode.preference = option
  },
})

function setBlackAsPrimary(value: boolean) {
  try {
    themeManager.updateTheme({
      theme: { blackAsPrimary: value },
    })
  }
  catch (error) {
    console.warn('Failed to update blackAsPrimary:', error)
  }
}
</script>

<template>
  <UPopover :ui="{ content: 'w-72 px-6 py-4 flex flex-col gap-4' }">
    <template #default="{ open }">
      <UButton
        icon="i-lucide-swatch-book"
        color="neutral"
        :variant="open ? 'outline' : 'ghost'"
        square
        aria-label="Color picker"
        :ui="{ leadingIcon: 'text-primary' }"
      />
    </template>

    <template #content>
      <fieldset>
        <legend class="text-[11px] leading-none font-semibold mb-2">
          Primary
        </legend>

        <div class="gap-1 grid grid-cols-3 -mx-2">
          <ThemePickerButton
            label="Black"
            :selected="managerTheme.theme.blackAsPrimary"
            @click="setBlackAsPrimary(true)"
          >
            <template #leading>
              <span class="rounded-full bg-black h-2 w-2 inline-block dark:bg-white" />
            </template>
          </ThemePickerButton>

          <ThemePickerButton
            v-for="color in primaryColors"
            :key="color"
            :label="color"
            :chip="color"
            :selected="!(managerTheme.theme.blackAsPrimary) && primary === color"
            @click="primary = color"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-[11px] leading-none font-semibold mb-2">
          Neutral
        </legend>

        <div class="gap-1 grid grid-cols-3 -mx-2">
          <ThemePickerButton
            v-for="color in neutralColors"
            :key="color"
            :label="color"
            :chip="color === 'neutral' ? 'old-neutral' : color"
            :selected="neutral === color"
            @click="neutral = color"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-[11px] leading-none font-semibold mb-2">
          Radius
        </legend>

        <div class="gap-1 grid grid-cols-5 -mx-2">
          <ThemePickerButton
            v-for="r in radiuses"
            :key="r"
            :label="String(r)"
            class="px-0 justify-center"
            :selected="radius === r"
            @click="radius = r"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-[11px] leading-none font-semibold mb-2">
          Theme
        </legend>

        <div class="gap-1 grid grid-cols-3 -mx-2">
          <ThemePickerButton
            v-for="m in modes"
            :key="m.label"
            v-bind="m"
            :selected="colorMode.preference === m.label"
            @click="mode = m.label"
          />
        </div>
      </fieldset>
    </template>
  </UPopover>
</template>
