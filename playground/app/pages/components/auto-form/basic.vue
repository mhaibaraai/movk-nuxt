<script lang="ts" setup>
import { UIcon } from '#components'
import { CalendarDate } from '@internationalized/date'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()

const { data: users } = await useFetch('https://jsonplaceholder.typicode.com/users', {
  key: 'typicode-users',
  transform: (data: { id: number, name: string }[]) => {
    return data?.map(user => ({
      label: user.name,
      value: String(user.id),
      avatar: { src: `https://i.pravatar.cc/120?img=${user.id}` }
    }))
  }
})

const { data: countries, status, execute } = await useLazyFetch<{
  name: string
  code: string
  emoji: string
}[]>('https://ui.nuxt.com/api/countries.json', {
  immediate: false
})

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
      birthdates: afz.array(afz.date(), { type: 'date', controlProps: { multiple: true } })
        .default(() => [
          new CalendarDate(2022, 2, 4),
          new CalendarDate(2022, 2, 6),
          new CalendarDate(2022, 2, 8)
        ])
        .meta({ label: '日期合集', class: 'col-span-2' }),
      datarange: afz.date({
        controlProps: { range: true, numberOfMonths: 2, class: 'w-full' }
      }).meta({ label: '日期范围', class: 'col-span-2' }),
      slider: afz.number({ type: 'slider', controlProps: { min: 0, max: 100, step: 1 } })
        .default(50)
        .meta({ label: '滑块输入框' })
    }
  }),

  $layout1: afz.layout({
    class: 'grid grid-cols-6 gap-4',
    fields: {
      profilePicture: afz.file({
        controlProps: { accept: 'image/*' }
      }).meta({ label: '上传头像', hidden: ({ state }) => !!state.username }),
      bio: afz.string({ type: 'textarea', controlProps: { rows: 4 } })
        .max(200, { message: '简介不能超过200个字符' })
        .meta({ class: 'col-span-5', label: '个人简介' }).optional()
    }
  }),

  $layout2: afz.layout({
    class: 'grid grid-cols-3 gap-4',
    fields: {
      pinsNums: afz.array(afz.number({ type: 'pinInput' })).meta({
        label: '邮政编码列表', collapsible: {
          defaultOpen: true
        }
      }).optional(),
      tags: afz.array(afz.string(), { type: 'inputTags', controlProps: { placeholder: '添加标签' } })
        .meta({ label: '标签输入框', hidden: ({ state }) => state.favoriteNumber !== 7 })
        .default(['标签1', '标签2']),
      favoriteColor: afz.string({ type: 'colorChooser' }).meta({ label: '喜欢的颜色' }).optional()
    }
  }),

  $layout3: afz.layout({
    class: 'grid grid-cols-4 gap-4',
    fields: {
      status: afz.enum(['active', 'inactive', 'pending']).exclude(['inactive'])
        .default('active')
        .meta({ label: '状态选择' }),
      selectUser: afz.string({
        type: 'select',
        controlProps: ({ value }) => {
          const avatarUser = users.value?.find(u => u.value === value)
          return {
            avatar: avatarUser?.avatar,
            items: users.value
          }
        }
      })
        .meta({ label: '选择用户' })
        .default(users.value?.[0]?.value || ''),
      countrie: afz.string({
        type: 'selectMenu',
        controlProps: computed(() => ({
          'items': countries.value,
          'loading': status.value === 'pending',
          'labelKey': 'name',
          'searchInput': { icon: 'i-lucide-search' },
          'onUpdate:open': () => {
            if (!countries.value?.length && status.value !== 'pending') {
              execute()
            }
          }
        })),
        controlSlots: {
          'leading': ({ modelValue, ui }) => {
            if (modelValue) {
              return h('span', { class: 'size-5 text-center' }, modelValue?.emoji)
            }
            return h(UIcon, { name: 'i-lucide-earth', class: ui.leadingIcon() })
          },
          'item-leading': ({ item }) => {
            return h('span', { class: 'size-5 text-center' }, (item as any)?.emoji)
          }
        }
      })
        .meta({ label: '选择国家列表' })
        .optional()
    }
  })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})
</script>

<template>
  <Navbar />
  <UCard class="w-full overflow-y-auto">
    <MAutoForm :schema="schema" :state="form" />
  </UCard>
</template>
