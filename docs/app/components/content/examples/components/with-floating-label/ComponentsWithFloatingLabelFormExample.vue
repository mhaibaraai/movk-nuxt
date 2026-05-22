<script setup lang="ts">
const { afz } = useAutoForm()
const schema = afz.object({
  user: afz.string({
    type: 'withFloatingLabel',
    controlProps: {
      label: '用户名',
      leadingIcon: 'i-lucide-user'
    }
  }),
  email: afz.string({
    type: 'withFloatingLabel',
    controlProps: {
      label: '邮箱地址',
      leadingIcon: 'i-lucide-mail',
      type: 'email'
    }
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <MAutoForm :schema="schema" :global-meta="{ label: '', required: false }" />
  </div>
</template>
