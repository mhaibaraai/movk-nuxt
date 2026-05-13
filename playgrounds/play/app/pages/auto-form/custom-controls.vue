<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const Counter = defineComponent({
  name: 'CounterControl',
  props: {
    modelValue: { type: Number, default: 0 },
    step: { type: Number, default: 1 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 999 }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const update = (delta: number) => {
      const next = Math.min(props.max, Math.max(props.min, (props.modelValue ?? 0) + delta))
      emit('update:modelValue', next)
    }
    return () => h('div', { class: 'inline-flex items-center gap-1 rounded-md border border-default bg-elevated p-1' }, [
      h('button', {
        type: 'button',
        class: 'size-7 rounded text-muted hover:bg-accented hover:text-toned',
        onClick: () => update(-props.step)
      }, '−'),
      h('span', { class: 'min-w-10 text-center text-sm font-medium tabular-nums' }, String(props.modelValue ?? 0)),
      h('button', {
        type: 'button',
        class: 'size-7 rounded text-muted hover:bg-accented hover:text-toned',
        onClick: () => update(props.step)
      }, '+')
    ])
  }
})

const SlugInput = defineComponent({
  name: 'SlugInput',
  props: {
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const UInput = resolveComponent('UInput')
    return () => h(UInput, {
      'modelValue': props.modelValue,
      'class': 'w-full',
      'icon': 'i-lucide-hash',
      'placeholder': 'auto lowercase + dasherize',
      'onUpdate:modelValue': (v: unknown) => {
        const next = String(v ?? '').toLowerCase().replace(/\s+/g, '-')
        emit('update:modelValue', next)
      }
    })
  }
})

const RatingDescription = defineComponent({
  name: 'RatingDescription',
  props: {
    modelValue: { type: Number, default: 0 },
    max: { type: Number, default: 5 }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const labels: Record<number, string> = {
      0: '未评分',
      1: '很差',
      2: '一般',
      3: '还行',
      4: '不错',
      5: '极佳'
    }
    return () => h('div', { class: 'flex items-center gap-3' }, [
      h('div', { class: 'flex gap-1' },
        Array.from({ length: props.max }, (_, i) => i + 1).map(n =>
          h('button', {
            type: 'button',
            class: [
              'size-7 rounded-full text-sm font-medium transition-colors',
              n <= (props.modelValue ?? 0) ? 'bg-primary text-inverted' : 'bg-elevated text-muted hover:bg-accented'
            ],
            onClick: () => emit('update:modelValue', n)
          }, String(n))
        )
      ),
      h('span', { class: 'text-sm text-muted' }, labels[props.modelValue ?? 0] ?? '')
    ])
  }
})

const { afz, controls } = useAutoForm({
  counter: defineControl({ component: Counter, controlProps: { step: 1 } }),
  slug: defineControl({ component: SlugInput }),
  ratingDesc: defineControl({ component: RatingDescription, controlProps: { max: 5 } })
})

const schema = afz.object({
  quantity: afz
    .number({ type: 'counter', controlProps: { step: 2, max: 50 } })
    .default(4)
    .meta({ label: '数量', description: 'step=2，max=50，最少 0' }),
  slug: afz
    .string({ type: 'slug' })
    .meta({ label: 'URL Slug', description: '输入空格自动替换为「-」并转小写' }).default('auto-lowercase-dasherize'),
  rating: afz
    .number({ type: 'ratingDesc' })
    .default(0)
    .meta({ label: '评分', description: '点击数字直接评分，右侧显示描述' })
})

type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({})

function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event)
  return new Promise<void>(res => setTimeout(res, 3000))
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
    <Showcase title="自定义控件注册" description="通过 useAutoForm({ controls }) 注册 counter、slug、ratingDesc，并在 afz type 中使用">
      <MAutoForm :schema="schema" :state="state" :controls="controls" @submit="onSubmit" />
    </Showcase>
    <StateViewer :state="state" label="state" />
  </div>
</template>
