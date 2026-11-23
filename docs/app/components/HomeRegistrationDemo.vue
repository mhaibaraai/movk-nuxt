<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import type { Registration, RegistrationCopy, RegistrationDetails } from '../data/home-registration'
import { exampleRegistrations } from '../data/home-registration'

defineProps<{ copy: RegistrationCopy }>()

const tabs = [
  { label: 'AutoForm', value: 'form', slot: 'form', icon: 'i-lucide-list-checks' },
  { label: 'DataTable', value: 'table', slot: 'table', icon: 'i-lucide-table-2' }
] satisfies TabsItem[]

const activeTab = ref<string | number>('form')
const showSource = ref(false)
const registrations = shallowRef<Registration[]>([...exampleRegistrations])

function addRegistration(registration: RegistrationDetails) {
  registrations.value = [...registrations.value, { ...registration, id: registrations.value.length + 1 }]
}

function viewRegistrations() {
  activeTab.value = 'table'
}
</script>

<template>
  <UTabs
    v-model="activeTab"
    :items="tabs"
    variant="link"
    size="sm"
    :unmount-on-hide="false"
    class="min-w-0 overflow-hidden rounded-xl border border-default bg-default shadow-sm"
    :ui="{
      root: 'gap-0',
      list: 'h-12 justify-start gap-0 bg-elevated/55 px-2 sm:px-3',
      trigger: 'h-full grow-0 px-2.5 sm:px-3',
      leadingIcon: 'hidden sm:inline-block',
      content: 'h-[26rem] min-w-0 overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:h-99'
    }"
  >
    <template #list-trailing>
      <UButton
        :label="showSource ? copy.preview : copy.source"
        :icon="showSource ? 'i-lucide-panel-top' : 'i-lucide-code-xml'"
        color="neutral"
        :variant="showSource ? 'soft' : 'ghost'"
        size="sm"
        class="ms-auto shrink-0"
        @click="showSource = !showSource"
      />
    </template>

    <template #form>
      <HomeRegistrationForm v-show="!showSource" :copy="copy" class="h-full overflow-auto overscroll-contain" @add="addRegistration" @view-registrations="viewRegistrations" />
      <LazyHomeRegistrationSource v-if="showSource && activeTab === 'form'" file="form" class="h-full overflow-auto overscroll-contain" />
    </template>

    <template #table>
      <HomeRegistrationTable v-show="!showSource" :copy="copy" :registrations="registrations" class="h-full overflow-auto overscroll-contain" />
      <LazyHomeRegistrationSource v-if="showSource && activeTab === 'table'" file="table" class="h-full overflow-auto overscroll-contain" />
    </template>
  </UTabs>
</template>
