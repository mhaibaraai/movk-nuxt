import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { en as uiEn, zh_cn as uiZhCn } from '@nuxt/ui/locale'
import { extendMovkLocale, useMovkLocale } from '../../src/runtime/composables/useMovkLocale'

describe('useMovkLocale', () => {
  it('未提供 locale 时回退到英文', () => {
    const { code, t } = useMovkLocale()
    expect(code.value).toBe('en')
    expect(t('messageBox.confirm')).toBe('Confirm')
  })

  it('按 Nuxt UI locale code 选择内置字典', () => {
    const { t } = useMovkLocale(ref(uiZhCn))
    expect(t('messageBox.confirm')).toBe('确认')
  })

  it('支持插值', () => {
    const { t } = useMovkLocale(ref(uiZhCn))
    expect(t('pagination.total', { total: 12 })).toBe('共 12 条')
  })

  it('locale.messages.movk 覆盖内置文案，未覆盖的键保留内置值', () => {
    const custom = extendMovkLocale(uiZhCn, { messageBox: { confirm: '好的' } })
    const { t } = useMovkLocale(ref(custom))
    expect(t('messageBox.confirm')).toBe('好的')
    expect(t('messageBox.cancel')).toBe('取消')
  })

  it('没有内置字典的语言回退到英文', () => {
    const { t } = useMovkLocale(ref({ ...uiEn, code: 'xx' }))
    expect(t('messageBox.cancel')).toBe('Cancel')
  })

  it('缺失的键原样返回路径', () => {
    const { t } = useMovkLocale()
    expect(t('unknown.key' as never)).toBe('unknown.key')
  })

  it('locale 变化时文案响应更新', () => {
    const locale = ref(uiEn)
    const { t } = useMovkLocale(locale)
    expect(t('tree.loading')).toBe('Loading')
    locale.value = uiZhCn
    expect(t('tree.loading')).toBe('加载中')
  })
})
