<script setup lang="ts">
import { z } from 'zod'

const { afz } = useFormBuilder()

const conditionalSchema = z.object({
  notify: afz.boolean({ type: 'switch', label: '启用通知' }).default(false),
  email: afz.email({
    label: '邮箱地址',
    if: (ctx: { state: { notify?: boolean } }) => Boolean(ctx.state.notify)
  })
})

const dependsSchema = z.object({
  country: afz.enum(['CN', 'US', 'JP'], { label: '国家' }).default('CN'),
  city: afz.enum([], {
    label: '城市',
    depends: ['country'],
    controlProps: (ctx: { state: { country?: string } }) => ({
      items: ({
        CN: ['北京', '上海', '广州'],
        US: ['New York', 'San Francisco', 'Seattle'],
        JP: ['Tokyo', 'Osaka', 'Kyoto']
      }[ctx.state.country ?? 'CN']) ?? []
    })
  })
})

const arraySchema = z.object({
  members: afz.array(
    afz.object({
      name: afz.string({ controlProps: { placeholder: '姓名' } }),
      role: afz.enum(['leader', 'dev', 'qa'])
    }),
    { label: '团队成员' }
  ).default([{ name: '', role: 'dev' }])
})

const asyncSchema = z.object({
  username: afz.string({ label: '用户名' }).refine(async (val) => {
    await new Promise(r => setTimeout(r, 600))
    return val !== 'admin'
  }, { message: '该用户名已被占用' })
})

const conditionalState = reactive<Partial<z.input<typeof conditionalSchema>>>({})
const dependsState = reactive<Partial<z.input<typeof dependsSchema>>>({})
const arrayState = reactive<Partial<z.input<typeof arraySchema>>>({})
const asyncState = reactive<Partial<z.input<typeof asyncSchema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase title="if 条件渲染" description="字段元数据 if(ctx) 返回 false 则跳过渲染" :state="conditionalState">
      <MAutoForm :schema="conditionalSchema" :state="conditionalState" />
    </Showcase>

    <Showcase title="depends 依赖联动" description="依赖字段变更时重算 controlProps" :state="dependsState">
      <MAutoForm :schema="dependsSchema" :state="dependsState" />
    </Showcase>

    <Showcase title="array 动态增删" description="afz.array() 自动渲染添加/删除按钮" :state="arrayState">
      <MAutoForm :schema="arraySchema" :state="arrayState" />
    </Showcase>

    <Showcase
      title="异步校验"
      description="尝试输入 'admin' 触发服务端式异步校验"
      :state="asyncState"
    >
      <MAutoForm :schema="asyncSchema" :state="asyncState" :validate-on="['blur']" />
    </Showcase>
  </div>
</template>
