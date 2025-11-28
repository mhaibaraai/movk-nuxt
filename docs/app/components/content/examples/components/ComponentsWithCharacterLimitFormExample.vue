<script setup lang="ts">
const form = reactive({
  username: '',
  bio: ''
})
</script>

<template>
  <div class="space-y-4">
    <UFormField label="用户名" hint="2-20 个字符">
      <MWithCharacterLimit
        v-model="form.username"
        :max-length="20"
        placeholder="请输入用户名"
      />
    </UFormField>

    <UFormField label="个人简介" hint="不超过 140 字">
      <MWithCharacterLimit
        v-model="form.bio"
        :max-length="140"
        placeholder="介绍一下自己..."
      />
    </UFormField>
  </div>
</template>
