import type { ComputedRef, Ref } from 'vue'
import type { Locale, Messages } from '@nuxt/ui'
import { computed } from 'vue'
import { defu } from 'defu'
import { useLocale } from '@nuxt/ui/composables/useLocale'
import type { MovkLocaleMessages, MovkMessageKey, MovkMessages } from '../types/locale'
import { en, movkLocales } from '../locale'
import { interpolate } from '../utils/interpolate'

type MessagesWithMovk = Messages & { movk?: MovkLocaleMessages }

export type MovkTranslator = (key: MovkMessageKey, vars?: Record<string, string | number>) => string

export interface MovkLocaleContext {
  code: ComputedRef<string>
  t: MovkTranslator
}

/**
 * 读取 `@movk/nuxt` 组件文案：跟随 `<UApp :locale>`，按 locale code 选择内置字典，
 * 并以 `locale.messages.movk` 覆盖；没有内置字典的语言回退到英文。
 */
export function useMovkLocale(localeOverride?: Ref<Locale<Messages> | undefined>): MovkLocaleContext {
  const { locale } = useLocale(localeOverride)
  const code = computed(() => locale.value.code)

  const messages = computed(() => defu(
    (locale.value.messages as MessagesWithMovk).movk,
    movkLocales[code.value] ?? en
  ) as MovkMessages)

  const t: MovkTranslator = (key, vars) => {
    const [group, name] = key.split('.') as [keyof MovkMessages, string]
    const message = (messages.value[group] as Record<string, unknown> | undefined)?.[name]
    return typeof message === 'string' ? interpolate(message, vars) : key
  }

  return { code, t }
}

/** 在 Nuxt UI locale 上覆盖 `@movk/nuxt` 文案，返回可直接传给 `<UApp :locale>` 的 locale */
export function extendMovkLocale(locale: Locale<Messages>, movk: MovkLocaleMessages): Locale<Messages> {
  const current = (locale.messages as MessagesWithMovk).movk
  return {
    ...locale,
    messages: { ...locale.messages, movk: defu(movk, current) } as Messages
  }
}
