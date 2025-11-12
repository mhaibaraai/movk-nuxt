<script lang="ts" setup>
const { afz } = useAutoForm()

const schema = afz.object({
  $basic: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string(),
      lastName: afz.string(),
      email: afz.email().meta({ class: 'col-span-2' }),
      phone: afz.string().optional()
    }
  }),

  bio: afz.string({ type: 'textarea' }).max(500).optional(),

  $preferences: afz.layout({
    class: 'space-y-4',
    fields: {
      notifications: afz.array(afz.string(), {
        type: 'checkboxGroup',
        controlProps: {
          items: [
            { label: '邮件', value: 'email' },
            { label: '短信', value: 'sms' },
            { label: '推送', value: 'push' }
          ]
        }
      }).default(['email']),

      theme: afz.enum(['light', 'dark', 'system']).default('system')
    }
  })
})

const form = ref({})
</script>

<template>
  <Navbar />
  <UCard class="mt-6">
    <template #header>
      <h2 class="text-xl font-semibold">
        个人设置
      </h2>
    </template>

    <MAutoForm :schema="schema" :state="form" />
  </UCard>
</template>
