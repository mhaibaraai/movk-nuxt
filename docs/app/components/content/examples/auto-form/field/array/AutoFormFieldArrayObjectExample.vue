<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const schema = afz.object({
  experience: afz.array(
    afz.object({
      company: afz.string({
        controlProps: {
          placeholder: '公司名称'
        }
      }).min(1).meta({ label: '公司' }),
      position: afz.string({
        controlProps: {
          placeholder: '职位'
        }
      }).min(1).meta({ label: '职位' }),
      years: afz.number({
        controlProps: {
          placeholder: '工作年限'
        }
      }).int().min(0).max(50).meta({ label: '年限', hint: '工作年数' })
    }).meta({ label: '工作经历' })
  ).default([{
    company: '示例公司',
    position: '软件工程师',
    years: 3
  }]).meta({
    label: '工作经历列表',
    collapsible: { defaultOpen: true }
  })
})

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema>>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <UCard>
    <MAutoForm :schema="schema" @submit="onSubmit" />
  </UCard>
</template>
