<script setup lang="ts">
import { z } from 'zod'

const { afz } = useFormBuilder()

const gridSchema = z.object({
  firstName: afz.string({ label: '姓', cols: 3 }),
  lastName: afz.string({ label: '名', cols: 3 }),
  email: afz.email({ label: '邮箱', cols: 4 }),
  phone: afz.string({ label: '电话', type: 'asPhoneNumberInput', cols: 2 }),
  bio: afz.string({ label: '简介', type: 'textarea', cols: 6 })
})

const nestedSchema = z.object({
  user: afz.object({
    name: afz.string({ label: '姓名' }),
    age: afz.number({ label: '年龄' })
  }, { label: '用户信息' }),
  contact: afz.object({
    email: afz.email({ label: '邮箱' }),
    phone: afz.string({ label: '电话' })
  }, { label: '联系方式' })
})

const layoutSchema = z.object({
  base: afz.layout({
    component: 'UAccordion',
    props: { multiple: true, defaultValue: ['account'] },
    items: [
      { label: '账号', value: 'account', fields: ['username', 'password'] },
      { label: '资料', value: 'profile', fields: ['name', 'phone'] }
    ],
    fields: {
      username: afz.string({ label: '用户名' }),
      password: afz.string({ type: 'withPasswordToggle', label: '密码' }),
      name: afz.string({ label: '昵称' }),
      phone: afz.string({ label: '电话' })
    }
  })
})

const gridState = reactive<Partial<z.input<typeof gridSchema>>>({})
const nestedState = reactive<Partial<z.input<typeof nestedSchema>>>({})
const layoutState = reactive<Partial<z.input<typeof layoutSchema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
    <Showcase title="cols 网格" description="globalMeta.cols=6 + 字段 cols 控制每行占比" :state="gridState">
      <MAutoForm :schema="gridSchema" :state="gridState" :global-meta="{ cols: 6 }" />
    </Showcase>

    <Showcase title="嵌套对象自动 fieldset" description="afz.object 自动作为分组" :state="nestedState">
      <MAutoForm :schema="nestedSchema" :state="nestedState" />
    </Showcase>

    <Showcase title="afz.layout 容器" description="将字段嵌入 UAccordion / UTabs 等容器" :state="layoutState">
      <MAutoForm :schema="layoutSchema" :state="layoutState" />
    </Showcase>
  </div>
</template>
