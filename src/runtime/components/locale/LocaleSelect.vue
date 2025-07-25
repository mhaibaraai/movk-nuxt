<script lang="ts" setup>
import type { SelectMenuItem, SelectMenuProps } from '@nuxt/ui'

type LocaleItem = SelectMenuItem & {
  code: string
  name?: string
}

export interface LocaleSelectProps {
  locales?: LocaleItem[]
  size?: SelectMenuProps['size']
  color?: SelectMenuProps['color']
  variant?: SelectMenuProps['variant']
  disabled?: boolean
  ui?: SelectMenuProps['ui']
}

defineOptions({ inheritAttrs: false })
const { locales = [], ...rest } = defineProps<LocaleSelectProps>()
const modelValue = defineModel<string>()
function getEmojiFlag(locale: string) {
  const languageToCountry = {
    ar: 'sa',
    // Arabic -> Saudi Arabia
    bn: 'bd',
    // Bengali -> Bangladesh
    ca: 'es',
    // Catalan -> Spain
    ckb: 'iq',
    // Central Kurdish -> Iraq
    cs: 'cz',
    // Czech -> Czech Republic (note: modern country code is actually 'cz')
    da: 'dk',
    // Danish -> Denmark
    el: 'gr',
    // Greek -> Greece
    en: 'gb',
    // English -> Great Britain
    et: 'ee',
    // Estonian -> Estonia
    he: 'il',
    // Hebrew -> Israel
    hi: 'in',
    // Hindi -> India
    hy: 'am',
    // Armenian -> Armenia
    ja: 'jp',
    // Japanese -> Japan
    kk: 'kz',
    // Kazakh -> Kazakhstan
    km: 'kh',
    // Khmer -> Cambodia
    ko: 'kr',
    // Korean -> South Korea
    ky: 'kg',
    // Kyrgyz -> Kyrgyzstan
    lb: 'lu',
    // Luxembourgish -> Luxembourg
    ms: 'my',
    // Malay -> Malaysia
    nb: 'no',
    // Norwegian Bokmål -> Norway
    sl: 'si',
    // Slovenian -> Slovenia
    sv: 'se',
    // Swedish -> Sweden
    uk: 'ua',
    // Ukrainian -> Ukraine
    ur: 'pk',
    // Urdu -> Pakistan
    vi: 'vn',
    // Vietnamese -> Vietnam
    zh: 'cn',
    // Chinese -> China
  } as const
  const baseLanguage = locale.split(/[-_]/)[0]?.toLowerCase() || locale
  const countryCode = (languageToCountry as Record<string, string>)[baseLanguage] || locale.replace(/^.*-/, '').slice(0, 2)
  return countryCode.toUpperCase().split('').map((char: string) => String.fromCodePoint(127397 + char.charCodeAt(0))).join('')
}
</script>

<template>
  <USelectMenu
    v-model="modelValue"
    :search-input="false"
    value-key="code"
    label-key="name"
    :items="locales"
    v-bind="rest"
  >
    <template #leading>
      <span
        v-if="modelValue"
        class="text-center size-5"
      >
        {{ getEmojiFlag(modelValue) }}
      </span>
    </template>

    <template #item-leading="{ item }">
      <span class="text-center size-5">
        {{ getEmojiFlag(item.code) }}
      </span>
    </template>
  </USelectMenu>
</template>
