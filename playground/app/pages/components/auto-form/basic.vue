<script lang="ts" setup>
import { z } from 'zod/v4'

const { afz } = createAutoFormZ()
const schema = z.object({
  username: afz.string().min(2, { message: '用户名至少需要2个字符' }),
  withClear: afz.string({ type: 'withClear' }).default('Type here...').meta({ label: '清除输入框' }),
  withPasswordToggle: afz.string({ type: 'withPasswordToggle' })
    .min(6, { message: '密码至少需要6个字符' })
    .default('123456')
    .meta({ label: '密码切换' }),
  withCopy: afz.string({ type: 'withCopy' }).default('Copy me!').meta({ label: '复制输入框' }),
  withCharacterLimit: afz.string({ type: 'withCharacterLimit' }).default('Character limit...').meta({ label: '字符限制输入框' }),
  age: afz.number().min(0, { message: '年龄必须大于等于0' })
    .max(150, { message: '年龄必须小于等于150' })
    .meta({ label: '年龄(可选)' })
    .optional()
})

type Schema = z.output<typeof schema>

const state = ref<Partial<Schema>>({})
</script>

<template>
  <Navbar />
  <UCard class="w-lg">
    <MAutoForm :schema="schema" :state="state">
      <template #field-description:username>
        <span>
          这是用户名的描述信息
        </span>
      </template>
    </MAutoForm>
  </UCard>
</template>
