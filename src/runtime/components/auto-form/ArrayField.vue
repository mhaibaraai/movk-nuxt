<script setup lang="ts">
import { toRefs } from 'vue'
import { stableItemKey } from './utils'

interface Props<T = any> {
  modelValue: T[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: any[]): void
}>()

const { modelValue } = toRefs(props)

function addItem() {
  emit('update:modelValue', [...(modelValue?.value ?? []), undefined])
}
function removeAt(i: number) {
  const copy = [...(modelValue?.value ?? [])]
  copy.splice(i, 1)
  emit('update:modelValue', copy)
}

</script>

<template>
  <div class="space-y-2">
    <div v-for="(item, i) in modelValue" :key="stableItemKey(i, item)" class="flex items-center gap-2">
      <slot :index="i" :item="item" />
      <UButton color="red" variant="soft" @click="removeAt(i)">删除</UButton>
    </div>
    <UButton variant="soft" @click="addItem">新增</UButton>
  </div>
  
</template>


