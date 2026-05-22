<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  title: afz.string({ controlProps: { placeholder: '附件描述' } }).meta({ label: '标题' }),
  attachments: afz.array(afz.file()).default([]).meta({ label: '附件（多选）' })
})
const state = reactive<Partial<z.input<typeof schema>>>({})

async function onSubmit() {
  await new Promise(r => setTimeout(r, 600))
  const count = state.attachments?.length ?? 0
  toast.add({ title: `已上传 ${count} 个文件`, color: 'success' })
}
</script>

<template>
  <MAutoForm :schema="schema" :state="state" :submit-button-props="{ label: '上 传' }" @submit="onSubmit" />
</template>
