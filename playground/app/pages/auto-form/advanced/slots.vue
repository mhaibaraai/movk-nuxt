<script lang="ts" setup>
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3),
  email: afz.email()
})

const form = ref({})

function handleSubmit() {
  alert('Form submitted!')
}
</script>

<template>
  <Navbar />
  <UCard class="mt-6">
    <MAutoForm :schema="schema" :state="form" @submit="handleSubmit">
      <template #header>
        <div class="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded">
          <p class="text-sm">
            填写表单以继续
          </p>
        </div>
      </template>

      <template #footer="{ state }">
        <div class="mt-4 text-xs text-gray-500">
          <p>已填写字段: {{ Object.keys(state).length }}</p>
        </div>
      </template>
    </MAutoForm>
    <template #footer>
      <pre class="text-xs">{{ form }}</pre>
    </template>
  </UCard>
</template>
