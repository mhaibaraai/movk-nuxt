<template>
  <UContainer class="min-h-screen flex items-center justify-center" as="main">
    <div class="absolute inset-0 -z-10 cert-background" />
    <UUser
      :avatar="{
        src: 'https://github.com/mhaibaraai.png',
        icon: 'i-lucide-image'
      }"
      name="Movk Nuxt Dashboard"
      class="absolute left-4 sm:left-6 lg:left-8 top-6 z-10"
    />
    <div
      class="absolute right-4 sm:right-6 lg:right-8 bg-accent rounded-3xl px-3 py-1 flex-center z-10 top-6 bg-default"
    >
      <MThemePicker />
      <UTooltip text="Color Mode">
        <UColorModeButton aria-label="Color Mode" />
      </UTooltip>
    </div>
    <div class="w-full max-w-md">
      <UTheme
        :ui="{
          form: {
            base: 'space-y-4'
          }
        }"
      >
        <slot />
      </UTheme>
    </div>
  </UContainer>
</template>

<style scoped>
.cert-background {
  background: linear-gradient(154deg, rgba(7, 7, 9, 0.08) 30%, var(--ui-color-primary-100) 48%, rgba(7, 7, 9, 0.08) 64%);
  filter: blur(100px);
}
</style>
