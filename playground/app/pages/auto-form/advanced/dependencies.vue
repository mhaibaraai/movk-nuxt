<script lang="ts" setup>
const { afz } = useAutoForm()

interface FormState {
  hasPartner: boolean
  partnerName?: string
  partnerEmail?: string
  numberOfChildren: number
  childrenNames?: string[]
}

const schema = afz.object({
  hasPartner: afz.boolean({ type: 'switch' }).default(false),

  partnerName: afz.string().meta({
    hidden: ({ state }: { state: FormState }) => !state.hasPartner
  }).optional(),

  partnerEmail: afz.email().meta({
    hidden: ({ state }: { state: FormState }) => !state.hasPartner
  }).optional(),

  numberOfChildren: afz.number()
    .int()
    .min(0)
    .max(10)
    .default(0),

  childrenNames: afz.array(afz.string()).meta({
    hidden: ({ state }: { state: FormState }) => !state.numberOfChildren || state.numberOfChildren === 0
  }).optional()
})

const form = ref<FormState>({
  hasPartner: false,
  numberOfChildren: 0
})

// 自动同步子女数量和姓名数组
watch(() => form.value.numberOfChildren, (count) => {
  if (count && count > 0) {
    const names = form.value.childrenNames || []
    if (names.length < count) {
      form.value.childrenNames = [...names, ...Array(count - names.length).fill('')]
    }
    else if (names.length > count) {
      form.value.childrenNames = names.slice(0, count)
    }
  }
  else {
    form.value.childrenNames = []
  }
})
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
