<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'

const { afz, _ } = useAutoForm()
const toast = useToast()

// 测试：使用占位符 _ 覆盖对象类型为其他控件
const schema = afz.object({
  name: afz.string().min(1, '请输入姓名'),

  // 使用 selectMenu 控件
  userSelectMenu: afz.object(_, {
    type: 'selectMenu',
    controlProps: {
      items: [
        {
          label: 'benjamincanac',
          value: 'benjamincanac',
          avatar: {
            src: 'https://github.com/benjamincanac.png',
            alt: 'benjamincanac'
          }
        },
        {
          label: 'romhml',
          value: 'romhml',
          avatar: {
            src: 'https://github.com/romhml.png',
            alt: 'romhml'
          }
        }
      ]
    }
  }),

  // 使用 enum 控件（下拉选择）
  userEnum: afz.object(_, {
    type: 'enum',
    controlProps: {
      items: [
        {
          label: 'smarroufin',
          value: 'smarroufin',
          avatar: {
            src: 'https://github.com/smarroufin.png',
            alt: 'smarroufin'
          }
        },
        {
          label: 'noook',
          value: 'noook',
          avatar: {
            src: 'https://github.com/noook.png',
            alt: 'noook'
          }
        }
      ]
    }
  }),

  // 使用 radioGroup 控件
  userRadio: afz.object(_, {
    type: 'radioGroup',
    controlProps: {
      items: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Guest', value: 'guest' }
      ]
    }
  })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: '提交成功',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold">
        Object 类型覆盖测试
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        使用 afz.object(_, { type, controlProps }) 将对象字段转换为其他控件类型
      </p>
    </template>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
    <template #footer>
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
