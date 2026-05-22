<script setup lang="ts">
import type { z } from 'zod'
import type { AutoFormFieldContext } from '@movk/nuxt'

const { afz } = useAutoForm()

const countryOptions = ['CN', 'US', 'JP'] as const
type CountryCode = typeof countryOptions[number]

const cityItemsByCountry: Record<CountryCode, string[]> = {
  CN: ['北京', '上海', '广州'],
  US: ['New York', 'San Francisco', 'Seattle'],
  JP: ['Tokyo', 'Osaka', 'Kyoto']
}

const conditionalSchema = afz.object({
  notify: afz.boolean({ type: 'switch' }).default(false).meta({ label: '通知' }),
  email: afz.email().meta({ label: '通知邮箱', if: ({ state }: AutoFormFieldContext) => Boolean(state.notify) }),
  agreeToTerms: afz
    .boolean()
    .default(false)
    .meta({
      label: '同意服务条款',
      description: '我已阅读并同意相关服务条款和隐私政策'
    }),
  newsletter: afz
    .boolean()
    .default(true)
    .meta({
      label: '订阅邮件通知',
      description: '接收产品更新和优惠信息',
      hidden: ({ state }: AutoFormFieldContext) => !state?.agreeToTerms
    })
})

const dependsSchema = afz.object({
  country: afz.enum(countryOptions).default('CN').meta({ label: '国家' }),
  city: afz.enum([], {
    type: 'enum',
    controlProps: ({ state }) => ({
      items: cityItemsByCountry[(state.country as CountryCode | undefined) ?? 'CN']
    })
  }).meta({ label: '城市' })
})

const arraySchema = afz.object({
  members: afz.array(
    afz.object({
      name: afz.string({ controlProps: { placeholder: '姓名' } }),
      role: afz.enum(['leader', 'dev', 'qa'])
    })
  ).default([{ name: '', role: 'dev' }]).meta({ label: '团队成员' })
})

const asyncSchema = afz.object({
  username: afz.string().refine(async (val) => {
    await new Promise(r => setTimeout(r, 600))
    return val !== 'admin'
  }, { message: '该用户名已被占用' }).meta({ label: '用户名' })
})

const conditionalState = reactive<Partial<z.output<typeof conditionalSchema>>>({})
const dependsState = reactive<Partial<z.output<typeof dependsSchema>>>({})
const arrayState = reactive<Partial<z.output<typeof arraySchema>>>({})
const asyncState = reactive<Partial<z.output<typeof asyncSchema>>>({})

watch(() => dependsState.country, () => {
  dependsState.city = undefined
})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase title="条件字段渲染" description="if 控制字段挂载，hidden 按其它字段值隐藏" :state="conditionalState">
      <MAutoForm :schema="conditionalSchema" :state="conditionalState" />
    </Showcase>

    <Showcase title="依赖项联动" description="国家字段变化时重算城市选项并清空失效值" :state="dependsState">
      <MAutoForm :schema="dependsSchema" :state="dependsState" />
    </Showcase>

    <Showcase title="数组对象编辑" description="afz.array() 渲染对象列表，支持添加、删除与状态同步" :state="arrayState">
      <MAutoForm :schema="arraySchema" :state="arrayState" />
    </Showcase>

    <Showcase title="异步字段校验" description="异步 refine 模拟服务端校验，失焦后返回占用错误" :state="asyncState">
      <MAutoForm :schema="asyncSchema" :state="asyncState" :validate-on="['blur']" />
    </Showcase>
  </div>
</template>
