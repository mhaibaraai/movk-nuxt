import { watch } from 'vue'
import { useMovkLocale } from '../../composables/useMovkLocale'
import { isZodLocaleAuto, syncZodLocale } from './apply'

/** `zod.locale: 'auto'` 时让 zod 校验文案跟随当前组件所处的 `<UApp :locale>` */
export function useZodLocaleSync(): void {
  if (import.meta.server || !isZodLocaleAuto()) return

  const { code, t } = useMovkLocale()
  watch(code, value => syncZodLocale(value, t), { immediate: true })
}
