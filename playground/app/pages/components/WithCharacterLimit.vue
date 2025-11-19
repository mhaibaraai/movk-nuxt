<script lang="ts" setup>
const comment = ref('')
</script>

<template>
  <Navbar />
  <Matrix>
    <UFormField label="comment" hint="长文本评论">
      <MWithCharacterLimit
        v-model="comment"
        class="w-full"
        :max-length="200"
        placeholder="请输入您的评论..."
        leading-icon="i-lucide-message-square"
      />
    </UFormField>
  </Matrix>
</template>
