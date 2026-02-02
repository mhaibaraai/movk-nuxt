<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import { RichTextEditor } from '#components'

const toast = useToast()
const { afz, controls } = useAutoForm({
  richtext: { component: RichTextEditor, controlProps: { class: 'w-full' } }
})

const schema = afz.object({
  title: afz
    .string({ controlProps: { placeholder: '请输入文章标题' } })
    .min(1, '标题不能为空')
    .meta({
      label: '文章标题',
      description: '请输入一个简洁明了的标题'
    }),

  category: afz
    .enum(['tech', 'design', 'business', 'lifestyle'])
    .default('tech')
    .meta({
      label: '分类',
      description: '选择文章分类'
    }),

  content: afz
    .string({
      type: 'richtext',
      controlProps: {
        readonly: false
      }
    })
    .min(10, '内容至少需要 10 个字符')
    .meta({
      label: '文章内容',
      description: '使用富文本编辑器编写文章内容'
    }),

  tags: afz
    .array(afz.string(), { type: 'inputTags' })
    .default(['nuxt', 'vue'])
    .meta({
      label: '标签',
      description: '添加相关标签'
    }),

  publishImmediately: afz
    .boolean()
    .default(false)
    .meta({
      label: '立即发布',
      description: '勾选后文章将立即发布'
    })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: '文章已保存，查看控制台输出。'
  })
  console.log('提交的数据:', event.data)
}
</script>

<template>
  <UCard>
    <MAutoForm
      :schema="schema"
      :state="form"
      :controls="controls"
      @submit="onSubmit"
    />
  </UCard>
</template>
