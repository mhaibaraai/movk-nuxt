<script setup lang="ts">
import type { ProgressProps } from '@nuxt/ui'
import type { ClassValue } from 'tailwind-variants'
import { computed } from 'vue'
import theme from '../../theme/password-strength'
import { smartT } from '../utils/t'
import { tv } from '../utils/tv'

export interface PasswordStrengthProps {
  /**
   * 需要校验的密码
   */
  password?: string
  /**
   * 校验规则数组
   */
  requirements?: { regex: RegExp, text: string }[]
  /**
   * 满足规则时显示的图标
   */
  metIcon?: string
  /**
   * 未满足规则时显示的图标
   */
  notMetIcon?: string
  /**
   * 进度条颜色计算函数
   */
  getColor?: (score: number, total: number) => ProgressProps['color']
  /**
   * 进度条文本计算函数
   */
  getText?: (score: number, total: number) => string
  progress?: ProgressProps
  class?: ClassValue
  ui?: Partial<typeof theme['slots']>
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<PasswordStrengthProps>(), {
  metIcon: 'i-lucide-circle-check',
  notMetIcon: 'i-lucide-circle-x',
  requirements: () => [
    { regex: /.{8,}/, text: smartT('passwordStrength.requirements.minLength') },
    { regex: /\d/, text: smartT('passwordStrength.requirements.hasNumber') },
    { regex: /[a-z]/, text: smartT('passwordStrength.requirements.hasLowercase') },
    { regex: /[A-Z]/, text: smartT('passwordStrength.requirements.hasUppercase') },
  ],
  getColor: (score: number, total: number) => {
    if (score === 0)
      return 'neutral'
    const ratio = score / total
    if (ratio < 0.34)
      return 'error'
    if (ratio < 0.67)
      return 'warning'
    return 'success'
  },
  getText: (score: number, total: number) => {
    if (score === 0)
      return smartT('passwordStrength.levels.none')
    const ratio = score / total
    if (ratio < 0.34)
      return smartT('passwordStrength.levels.weak')
    if (ratio < 0.67)
      return smartT('passwordStrength.levels.medium')
    return smartT('passwordStrength.levels.strong')
  },
})

const passwordRef = computed(() => props.password || '')

const strength = computed(() => props.requirements.map(req => ({ met: req.regex.test(passwordRef.value), text: req.text })))
const score = computed(() => strength.value.filter(req => req.met).length)
const total = computed(() => props.requirements.length)
const color = computed(() => props.getColor(score.value, total.value))
const text = computed(() => props.getText(score.value, total.value))

const tvUi = computed(() => tv({ extend: tv(theme) })())
</script>

<template>
  <div :class="tvUi.root({ class: [ui?.root, props.class] })">
    <UProgress
      :color="color"
      :indicator="text"
      :model-value="score"
      :max="total"
      size="sm"
      v-bind="props.progress"
    />
    <p :class="[tvUi.text({ class: ui?.text })]">
      {{ text }}，{{ smartT('passwordStrength.mustContain') }}
    </p>
    <ul :class="tvUi.list({ class: ui?.list })">
      <li
        v-for="(req, index) in strength"
        :key="index"
        :class="tvUi.item({ met: req.met, class: ui?.item })"
      >
        <UIcon
          :name="req.met ? metIcon : notMetIcon"
          :class="tvUi.icon({ met: req.met, class: ui?.icon })"
        />
        <span :class="tvUi.itemText({ met: req.met, class: ui?.itemText })">{{ req.text }}
          <span class="sr-only">
            {{ req.met ? smartT('passwordStrength.requirementMet') : smartT('passwordStrength.requirementNotMet') }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
