<script lang="ts" setup>
import type { z } from 'zod/v4'

const { afz } = useAutoForm()

const schema = afz.object({
  $basic: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string(),
      lastName: afz.string(),
      email: afz.email().meta({ class: 'col-span-2' }),
      phone: afz.string().optional()
    }
  }),

  bio: afz.string({ type: 'textarea' }).max(500).optional(),

  $preferences: afz.layout({
    class: 'space-y-4',
    fields: {
      notifications: afz.array(afz.string(), {
        type: 'checkboxGroup',
        controlProps: {
          orientation: 'horizontal',
          items: [
            { label: '邮件', value: 'email' },
            { label: '短信', value: 'sms' },
            { label: '推送', value: 'push' }
          ]
        }
      }).default(['email']),

      theme: afz.enum(['light', 'dark', 'system']).default('system')
    }
  })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="个人资料表示例" description="一个用于编辑用户个人资料的表单，包含多个字段分组。">
    <MAutoForm :schema="schema" :state="form" />
  </Matrix>
</template>
