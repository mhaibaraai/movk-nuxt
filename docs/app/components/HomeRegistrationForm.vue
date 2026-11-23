<script setup lang="ts">
import type { AutoFormFieldContext } from '#movk/types'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { RegistrationCopy, RegistrationDetails } from '../data/home-registration'
import { z } from 'zod'
import { attendanceModes, workshopSessions, workshopTracks } from '../data/home-registration'

const props = defineProps<{ copy: RegistrationCopy }>()
const emit = defineEmits<{
  add: [registration: RegistrationDetails]
  viewRegistrations: []
}>()

const { afz } = useAutoForm()
const schema = computed(() => {
  const { copy } = props
  return afz.object({
    name: afz.string({ error: copy.nameError, controlProps: { placeholder: copy.namePlaceholder } })
      .trim().min(1, copy.nameError).meta({ label: copy.name }),
    email: afz.email({ error: copy.emailError, controlProps: { placeholder: 'name@example.com' } })
      .meta({ label: copy.email }),
    attendance: afz.enum(attendanceModes, {
      controlProps: { items: attendanceModes.map(value => ({ label: copy[value], value })) }
    }).meta({ label: copy.attendance }),
    track: afz.enum(workshopTracks, {
      controlProps: { items: workshopTracks.map(value => ({ label: copy[value], value })) }
    }).meta({ label: copy.track }),
    seats: afz.number().int().min(1).max(4).meta({ label: copy.seats }),
    session: z.enum(workshopSessions, { error: copy.sessionError }).meta({
      type: 'enum',
      label: copy.session,
      if: ({ state }: AutoFormFieldContext) => state?.attendance === 'inPerson',
      controlProps: { items: workshopSessions.map(value => ({ label: copy[value], value })) }
    }),
    organization: afz.string({ error: copy.organizationError }).trim().min(1, copy.organizationError).meta({
      label: copy.organization,
      class: 'sm:col-span-2',
      if: ({ state }: AutoFormFieldContext) => Number(state?.seats) > 1
    })
  })
})

type FormValues = z.output<typeof schema.value>
const defaults = { attendance: 'inPerson', track: 'foundations', seats: 1, session: 'morning' } satisfies Partial<FormValues>
const form = ref<Partial<FormValues>>({ ...defaults })
const saved = ref(false)

function submit({ data }: FormSubmitEvent<FormValues>) {
  emit('add', data)
  form.value = { ...defaults }
  saved.value = true
}
</script>

<template>
  <div class="space-y-4 p-4 sm:p-5">
    <header>
      <h2 class="text-lg font-semibold tracking-tight text-highlighted">
        {{ copy.title }}
      </h2>
      <p class="mt-1 text-sm/relaxed text-muted">
        {{ copy.formHint }}
      </p>
    </header>

    <MAutoForm
      v-model="form"
      :schema="schema"
      hidden-value="clear"
      :ui="{ base: 'grid grid-cols-1 gap-3 space-y-0 sm:grid-cols-2', actions: 'sm:col-span-2' }"
      @submit="submit"
      @error="saved = false"
    >
      <template #submit="{ loading }">
        <div class="flex flex-wrap items-center gap-3 border-t border-default pt-3">
          <UButton type="submit" :label="copy.submit" :loading="loading" icon="i-lucide-plus" />
          <span v-if="saved" role="status" class="text-sm text-success">{{ copy.saved }}</span>
          <UButton
            v-if="saved"
            :label="copy.viewRegistrations"
            color="neutral"
            variant="link"
            class="p-0"
            @click="emit('viewRegistrations')"
          />
        </div>
      </template>
    </MAutoForm>
  </div>
</template>
