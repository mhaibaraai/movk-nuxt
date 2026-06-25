import { describe, expect, it } from 'vitest'
import { computed, reactive, ref } from 'vue'
import { deepToValue } from '../../../src/runtime/domains/api/deep-to-value'

describe('domains/api/deep-to-value.deepToValue', () => {
  it('解包顶层 ref', () => {
    expect(deepToValue(ref('USER_SEX'))).toBe('USER_SEX')
  })

  it('解包对象内的嵌套 ref', () => {
    const dictType = ref('USER_SEX')
    expect(deepToValue({ dictType })).toEqual({ dictType: 'USER_SEX' })
  })

  it('解包数组内的嵌套 ref', () => {
    expect(deepToValue([ref(1), ref(2)])).toEqual([1, 2])
  })

  it('解包深层嵌套（对象套数组套 ref）', () => {
    const input = { filters: [{ id: ref('a') }], page: ref(0) }
    expect(deepToValue(input)).toEqual({ filters: [{ id: 'a' }], page: 0 })
  })

  it('解包 reactive 对象内的字段', () => {
    const state = reactive({ dictType: 'USER_STATUS' })
    expect(deepToValue(state)).toEqual({ dictType: 'USER_STATUS' })
  })

  it('不同 ref 值解包后不相等（避免 key 碰撞的根因）', () => {
    const a = deepToValue({ dictType: ref('USER_SEX') })
    const b = deepToValue({ dictType: ref('USER_STATUS') })
    expect(a).not.toEqual(b)
  })

  it('computed 值变化后解包反映新值', () => {
    const base = ref('a')
    const c = computed(() => base.value)
    const query = { dictType: c }
    expect(deepToValue(query)).toEqual({ dictType: 'a' })
    base.value = 'b'
    expect(deepToValue(query)).toEqual({ dictType: 'b' })
  })

  it('非纯对象（Date）原样返回', () => {
    const d = new Date('2026-06-25T00:00:00.000Z')
    expect(deepToValue(d)).toBe(d)
  })

  it('原始值原样返回', () => {
    expect(deepToValue(0)).toBe(0)
    expect(deepToValue(null)).toBe(null)
    expect(deepToValue(undefined)).toBe(undefined)
    expect(deepToValue('x')).toBe('x')
  })
})
