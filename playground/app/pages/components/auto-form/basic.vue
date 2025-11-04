<script lang="ts" setup>
import { z } from 'zod/v4'

const { afz } = createAutoFormZ()

const schema = z.object({
  username: afz.string({ controlProps: { icon: 'i-lucide-user' } }).min(2, { message: '用户名至少需要2个字符' }).meta({ hint: '用户名' }),

  withClear: afz.string({ type: 'withClear' }).default('Type here...').meta({ label: '清除输入框' }),
  withPasswordToggle: afz.string({ type: 'withPasswordToggle' })
    .min(6, { message: '密码至少需要6个字符' })
    .default('123456')
    .meta({ label: '密码切换' }),
  withCopy: afz.string({ type: 'withCopy' }).default('Copy me!').meta({ label: '复制输入框' }),
  withCharacterLimit: afz.string({ type: 'withCharacterLimit' }).default('Character limit...').meta({ label: '字符限制输入框' }),

  favoriteNumber: afz.number().min(0).max(10)
    .meta({ label: '最喜欢的数字(可选)', description: '您最喜欢的 1 到 10 之间的数字。' })
    .optional(),
  acceptTerms: afz.boolean({
    controlProps: { label: '接受条款和条件', required: true },
    controlSlots: {
      description: () => [
        '请阅读并接受我们的 ',
        h('a', { href: '#', class: 'underline' }, '条款和条件'),
        ' 才能继续。'
      ]
    }
  })
    .refine(val => val === true, { message: '您必须接受条款和条件' })
    .meta({ label: '' }),
  sendNewsletter: afz.boolean({ type: 'switch', controlProps: { label: '订阅新闻通讯' } })
    .default(false)
    .meta({ label: '' }),
  birthdate: afz.date().meta({ label: '出生日期' }).optional(),
  bio: afz.string({ type: 'textarea' }).max(200, { message: '简介不能超过200个字符' }).meta({ label: '个人简介' }).optional()
})

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({})
</script>

<template>
  <Navbar />
  {{ state }}
  <UCard class="w-full overflow-y-auto">
    <MAutoForm :schema="schema" :state="state" />
  </UCard>
</template>
