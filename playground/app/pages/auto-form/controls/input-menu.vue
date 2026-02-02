<script lang="ts" setup>
import type { ComponentProps } from '@movk/core'
import type { FormSubmitEvent, InputMenuItem } from '@nuxt/ui'
import type { z } from 'zod'
import { UAvatar, type UInputMenu } from '#components'

const { afz } = useAutoForm()
const toast = useToast()

const searchTerm = ref('')
const searchTermDebounced = refDebounced(searchTerm, 200)

const { data: users, pending } = await useFetch('https://jsonplaceholder.typicode.com/users', {
  params: { q: searchTermDebounced },
  transform: (data: { id: number, name: string }[]) => {
    return data?.map(user => ({
      label: user.name,
      value: String(user.id),
      avatar: { src: `https://i.pravatar.cc/120?img=${user.id}` }
    }))
  },
  lazy: true
})

const items = ref([
  { type: 'label', label: '水果' },
  'Apple',
  'Banana',
  'Orange',
  { type: 'separator' },
  { type: 'label', label: '蔬菜' },
  'Carrot',
  'Tomato'
] satisfies InputMenuItem[])

const schema = afz.object({
  food: afz.array(afz.string(), {
    type: 'inputMenu',
    controlProps: ({ value }) => ({
      items: items.value,
      createItem: true,
      multiple: true,
      onCreate: (item: string) => {
        items.value.push(item)
        value.push(item)
      }
    })
  }).default(['Apple']).meta({ label: '选择食物', hint: '可创建新选项' }),

  multipleFoods: afz.object({
    label: afz.string(),
    value: afz.string(),
    avatar: afz.object({
      src: afz.string().optional()
    })
  }, {
    type: 'inputMenu',
    controlProps: computed(() => ({
      'items': users.value,
      'loading': pending.value,
      'ignoreFilter': true,
      'icon': 'i-lucide-user',
      'placeholder': '搜索用户...',
      'searchTerm': searchTerm.value,
      'onUpdate:searchTerm': (term: string) => {
        searchTerm.value = term
      }
    } as ComponentProps<typeof UInputMenu>)),
    controlSlots: {
      leading: ({ modelValue, ui }) => {
        if (modelValue) {
          return h(UAvatar, {
            ...modelValue.avatar,
            class: ui.leadingAvatar(),
            size: ui.leadingAvatarSize()
          })
        }
      }
    }
  }).meta({ label: '选择用户', hint: '' })
})

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <Matrix :form="form" title="输入菜单" description="使用 `inputMenu` 类型来渲染一个带有下拉菜单的输入框，支持搜索和异步加载。">
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </Matrix>
</template>
