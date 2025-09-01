<template>
  <Motion
    :initial="{ scale: 1, opacity: 0.75 }"
    :enter="{ scale: 1.02, opacity: 1, transition: { duration: 4000, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' } }"
    class="login-background inset-0 fixed"
  />
</template>

<style scoped>
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
