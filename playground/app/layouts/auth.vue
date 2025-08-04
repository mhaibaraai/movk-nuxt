<script setup lang="ts">
const { locales, locale, setLocale } = useI18n()

const currentLocale = computed({
  get() {
    return locale.value
  },
  set(value) {
    setLocale(value)
  },
})
</script>

<template>
  <div class="flex select-none inset-0 fixed overflow-hidden">
    <div class="login-background w-full inset-0 absolute" />
    <div class="w-full relative z-10 flex-center">
      <LogoApplication />
      <div class="bg-elevated rounded-2xl right-4 top-4 absolute z-10 px-3 py-1 flex-center">
        <ThemePicker />
        <MLocaleDropMenu
          v-model="currentLocale"
          :locales="locales"
        />
        <MColorModeButton />
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-background {
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--ui-primary), transparent 70%) 0%,
    color-mix(in srgb, var(--ui-primary), transparent 80%) 25%,
    color-mix(in srgb, var(--ui-primary), transparent 85%) 50%,
    color-mix(in srgb, var(--ui-primary), transparent 90%) 75%,
    transparent 100%
  );

  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  animation: breathing 4s ease-in-out infinite;
  transform-origin: center center;
}

@keyframes breathing {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}

html.dark .login-background {
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--ui-primary), transparent 75%) 0%,
    color-mix(in srgb, var(--ui-primary), transparent 82%) 25%,
    color-mix(in srgb, var(--ui-primary), transparent 88%) 50%,
    color-mix(in srgb, var(--ui-primary), transparent 92%) 75%,
    transparent 100%
  );
}
</style>
