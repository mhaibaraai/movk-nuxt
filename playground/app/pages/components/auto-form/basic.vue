<script lang="ts" setup>
import type { z } from 'zod/v4'

const { afz } = useAutoForm()

const schema = afz.object({
  $layout: afz.layout({
    class: 'grid grid-cols-4 gap-4',
    fields: {
      username: afz.string({ controlProps: { icon: 'i-lucide-user' } }).min(2, { message: '用户名至少需要2个字符' }).meta({ hint: '用户名' }),
      withClear: afz.string({ type: 'withClear' }).default('Type here...').meta({ label: '清除输入框' }),
      withPasswordToggle: afz.string({ type: 'withPasswordToggle' })
        .min(6, { message: '密码至少需要6个字符' })
        .default('123456')
        .meta({ label: '密码切换' }),
      withCopy: afz.string({ type: 'withCopy' }).default('Copy me!').meta({ label: '复制输入框' }),
      withCharacterLimit: afz.string({ type: 'withCharacterLimit' }).default('Character limit...').meta({ label: '字符限制输入框' }),

      favoriteNumber: afz.number().min(0).max(10)
        .meta({ label: '最喜欢的数字(可选)', hint: '1 至 10' })
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
        .default(true)
        .meta({ label: '' }),
      birthdate: afz.date().meta({ label: '出生日期' }).optional(),
      datarange: afz.date({
        controlProps: { range: true, numberOfMonths: 2, class: 'w-full' }
      }).meta({ label: '日期范围', class: 'col-span-2' }),
      slider: afz.number({ type: 'slider', controlProps: { min: 0, max: 100, step: 1 } })
        .default(50)
        .meta({ label: '滑块输入框' })
    }
  }),
  bio: afz.string({ type: 'textarea' }).max(200, { message: '简介不能超过200个字符' }).meta({ label: '个人简介' }).optional(),
  areas: afz.array(
    afz.object({
      $layout: afz.layout({
        class: 'grid grid-cols-3 gap-4',
        fields: {
          areaName: afz.string().meta({ label: '区域名称' }).default('浙江省'),
          areaCode: afz.string().meta({ label: '区域代码' }),
          isActive: afz.boolean({ type: 'switch', controlProps: { label: '是否激活' } }).default(true).meta({ label: '' })
        }
      })
    }).meta({ label: '区域' })
  ).default([{
    areaName: '湖北省',
    areaCode: '027',
    isActive: false
  }])
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
