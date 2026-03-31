<script setup lang="ts">
const show = ref(false)
const password = defineModel<string>({ default: '' })

function checkStrength(str: string) {
  const requirements = [
    { regex: /.{8,}/, text: '至少 8 个字符' },
    { regex: /\d/, text: '至少 1 个数字' },
    { regex: /[a-z]/, text: '至少 1 个小写字母' },
    { regex: /[A-Z]/, text: '至少 1 个大写字母' }
  ]

  return requirements.map(req => ({ met: req.regex.test(str), text: req.text }))
}

const strength = computed(() => checkStrength(password.value))
const score = computed(() => strength.value.filter(req => req.met).length)

const color = computed(() => {
  if (score.value === 0) return 'neutral'
  if (score.value <= 1) return 'error'
  if (score.value <= 2) return 'warning'
  if (score.value === 3) return 'warning'
  return 'success'
})

const text = computed(() => {
  if (score.value === 0) return '请输入密码'
  if (score.value <= 2) return '密码强度弱'
  if (score.value === 3) return '密码强度中等'
  return '密码强度强'
})
</script>

<template>
  <div class="space-y-2">
    <UInput
      v-model="password"
      placeholder="密码"
      :color="color"
      :type="show ? 'text' : 'password'"
      :aria-invalid="score < 4"
      aria-describedby="password-strength"
      :ui="{ trailing: 'pe-1' }"
      class="w-full"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="show ? '隐藏密码' : '显示密码'"
          :aria-pressed="show"
          aria-controls="password"
          @click="show = !show"
        />
      </template>
    </UInput>

    <UProgress
      :color="color"
      :indicator="text"
      :model-value="score"
      :max="4"
      size="sm"
    />

    <p id="password-strength" class="text-sm font-medium">
      {{ text }}。必须包含：
    </p>

    <ul class="space-y-1" aria-label="密码要求">
      <li
        v-for="(req, index) in strength"
        :key="index"
        class="flex items-center gap-1"
        :class="req.met ? 'text-success' : 'text-muted'"
      >
        <UIcon :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'" class="size-4 shrink-0" />

        <span class="text-xs font-light">
          {{ req.text }}
          <span class="sr-only">
            {{ req.met ? ' - 要求已满足' : ' - 要求未满足' }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
