<script setup lang="ts">
defineProps<{
  section: 'body' | 'title' | 'description' | 'header' | 'footer' | 'close' | 'content'
}>()
</script>

<template>
  <MMessageBox mode="confirm" title="操作确认" description="通过插槽替换对话框的各个区域。">
    <UButton label="查看插槽" variant="outline" />
    <template v-if="section === 'body'" #body="{ close }">
      <p>请阅读<strong>操作说明</strong>后继续。</p>
      <UButton label="取消" color="neutral" @click="close()" />
    </template>
    <template v-if="section === 'title'" #title>
      <span class="flex items-center gap-2"><UIcon name="i-lucide-info" />自定义标题</span>
    </template>
    <template v-if="section === 'description'" #description>
      请先阅读 <a href="https://nuxt.com" target="_blank" rel="noreferrer" class="underline">说明文档</a>。
    </template>
    <template v-if="section === 'header'" #header>
      <div class="font-semibold">
        完整接管头部区域
      </div>
    </template>
    <template v-if="section === 'footer'" #footer="{ close }">
      <UButton label="返回" color="neutral" @click="close()" />
      <UButton label="继续" @click="close()" />
    </template>
    <template v-if="section === 'close'" #close>
      <UButton icon="i-lucide-x" aria-label="关闭" color="neutral" variant="ghost" />
    </template>
    <template v-if="section === 'content'" #content="{ close }">
      <div class="p-6 flex flex-col gap-4">
        <p>自定义整个弹窗内容。</p>
        <UButton label="完成" @click="close()" />
      </div>
    </template>
  </MMessageBox>
</template>
