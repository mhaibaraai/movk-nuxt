<script lang="ts" setup>
import { z } from 'zod/v4'

const { afz } = createAutoFormZ()
const schema = z.object({
  username: afz.string().min(2, { message: '用户名至少需要2个字符' }),
  password: afz.string({ controlProps: { type: 'password' } })
    .min(6, { message: '密码至少需要6个字符' })
    .meta({ label: '密码' })
    .default('123456'),
  withClear: afz.string({ type: 'withClear' })
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
