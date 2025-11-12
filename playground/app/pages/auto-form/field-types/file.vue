<script lang="ts" setup>
const { afz } = useAutoForm()

const schema = afz.object({
  singleFile: afz.file(),
  imageOnly: afz.file({
    controlProps: { accept: 'image/*' }
  }),
  multipleFiles: afz.array(afz.file(), {
    type: 'file',
    controlProps: { multiple: true }
  })
})

const form = ref({})
</script>

<template>
  <Navbar />
  <UCard>
    <MAutoForm :schema="schema" :state="form" @submit="onSubmit" />
  </UCard>
</template>
