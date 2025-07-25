<script lang="ts" setup>
import type { CardProps, LinkProps } from '@nuxt/ui'
import type { ClassValue } from 'tailwind-variants'
import { computed } from 'vue'
import theme from '../../theme/page-card'
import { smartT } from '../utils/t'
import { tv } from '../utils/tv'

export interface PageCardProps {
  as?: CardProps['as']
  /**
   * 标题上方显示的图标
   * @IconifyIcon
   */
  icon?: string
  title?: string
  description?: string
  /**
   * 页面卡的方向
   * @defaultValue 'vertical'
   */
  orientation?: keyof (typeof theme['variants']['orientation'])
  /**
   * 是否颠倒默认插槽的顺序
   * @defaultValue false
   */
  reverse?: boolean
  /**
   * 是否在页面卡周围显示高亮线条
   */
  highlight?: boolean
  /**
   * @defaultValue 'primary'
   */
  highlightColor?: keyof typeof theme['variants']['highlightColor']
  /**
   * @defaultValue 'outline'
   */
  variant?: keyof typeof theme['variants']['variant']
  to?: LinkProps['to']
  target?: LinkProps['target']
  onClick?: (event: MouseEvent) => void | Promise<void>
  class?: ClassValue
  ui?: Partial<typeof theme['slots']>
}

export interface PageCardSlots {
  header: (props?: object) => any
  body: (props?: object) => any
  leading: (props?: object) => any
  title: (props?: object) => any
  description: (props?: object) => any
  footer: (props?: object) => any
  default: (props?: object) => any
}

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<PageCardProps>(), {
  orientation: 'vertical',
})
const slots = defineSlots<PageCardSlots>()

const tvUi = computed(() => tv({
  extend: tv(theme),
})({
  orientation: props.orientation,
  reverse: props.reverse,
  variant: props.variant,
  to: !!props.to || !!props.onClick,
  title: !!props.title || !!slots.title,
  highlight: props.highlight,
  highlightColor: props.highlightColor,
}))
const ariaLabel = computed(() => {
  return (props.title || smartT('common.link')).trim()
})
</script>

<template>
  <UCard
    :as="as"
    :data-orientation="orientation"
    :ui="{
      body: tvUi.container({ class: ui?.container }),
    }"
    :class="tvUi.root({ class: [ui?.root, props.class] })"
    @click="onClick"
  >
    <div
      v-if="!!slots.header || !!slots.body || (icon || !!slots.leading) || (title || !!slots.title) || (description || !!slots.description) || !!slots.footer"
      :class="tvUi.wrapper({ class: ui?.wrapper })"
    >
      <div
        v-if="!!slots.header"
        :class="tvUi.header({ class: ui?.header })"
      >
        <slot name="header" />
      </div>

      <div
        v-if="icon || !!slots.leading"
        :class="tvUi.leading({ class: ui?.leading })"
      >
        <slot name="leading">
          <UIcon
            v-if="icon"
            :name="icon"
            :class="tvUi.leadingIcon({ class: ui?.leadingIcon })"
          />
        </slot>
      </div>

      <div
        v-if="!!slots.body || (title || !!slots.title) || (description || !!slots.description)"
        :class="tvUi.body({ class: ui?.body })"
      >
        <slot name="body">
          <div
            v-if="title || !!slots.title"
            :class="tvUi.title({ class: ui?.title })"
          >
            <slot name="title">
              {{ title }}
            </slot>
          </div>

          <div
            v-if="description || !!slots.description"
            :class="tvUi.description({ class: ui?.description })"
          >
            <slot name="description">
              {{ description }}
            </slot>
          </div>
        </slot>
      </div>

      <div
        v-if="!!slots.footer"
        :class="tvUi.footer({ class: ui?.footer })"
      >
        <slot name="footer" />
      </div>
    </div>

    <slot />

    <ULink
      v-if="to"
      :aria-label="ariaLabel"
      v-bind="{ to, target, ...$attrs }"
      class="peer focus:outline-none"
      tabindex="-1"
      raw
    >
      <span
        class="inset-0 absolute"
        aria-hidden="true"
      />
    </ULink>
  </UCard>
</template>
