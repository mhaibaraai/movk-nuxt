<script lang="ts" setup>
const { afz } = useAutoForm()

const schema = afz.object({
  accountType: afz.enum(['personal', 'business']).default('personal'),

  username: afz.string().min(3),
  email: afz.email(),

  companyName: afz.string().meta({
    hidden: ({ state }) => state.accountType !== 'business'
  }).optional(),

  taxId: afz.string().meta({
    hidden: ({ state }) => state.accountType !== 'business'
  }).optional()
})

const form = ref({})
</script>

<template>
  <Navbar />
  <UCard class="mt-6">
    <MAutoForm :schema="schema" :state="form" />
    <template #footer>
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
