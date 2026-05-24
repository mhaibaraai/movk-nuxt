# AutoForm

Render a complete form from a single Zod v4 schema built with the `afz` factory. One schema declares data shape, validation rules, and UI configuration — define once, render. Component is `<MAutoForm>` (the `M` prefix is configurable via `movk.prefix`).

## Basic pattern

```vue
<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'

const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string().min(3).meta({ label: 'Username' }),
  email: afz.email().meta({ label: 'Email' }),
  age: afz.number().min(18).meta({ label: 'Age' })
})

type Schema = z.output<typeof schema>
const state = ref<Partial<Schema>>({})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // `@submit` only fires after validation passes — event.data is fully typed
  await saveUser(event.data)
}
</script>

<template>
  <MAutoForm :schema="schema" :state="state" @submit="onSubmit" />
</template>
```

## Key rules

- **Always use `afz`, never raw `z`** — `afz` proxies Zod methods to preserve `.meta()` through `.optional()`, `.default()`, etc. Raw `z` drops UI metadata.
- **Derive state type from the schema** — `type Schema = z.output<typeof schema>`, then `ref<Partial<Schema>>({})`. Never declare a parallel `interface`.
- **`@submit` only fires after validation** — for field-level errors, use `@error` with `FormError[]`.
- **Metadata priority**: global (`movk.autoForm` in `nuxt.config.ts`) → field (`.meta()`) → decorator. Higher wins.

## Schema → control mapping

| `afz` method | Default control |
| --- | --- |
| `afz.string()` | `UInput` |
| `afz.number()` | `UInputNumber` |
| `afz.boolean()` | `UCheckbox` |
| `afz.enum([...])` | `USelect` |
| `afz.calendarDate()` | `MDatePicker` |
| `afz.file()` | `UFileUpload` |
| `afz.array(...)` | repeatable group |
| `afz.object({...})` | nested fieldset (`collapsible` for accordion) |

For `afz.string()`, switch the rendered control via `meta({ type })`: `'textarea'`, `'withClear'`, `'withPasswordToggle'`, `'withCopy'`, `'withCharacterLimit'`, `'asPhoneNumberInput'` — each maps to the corresponding `M`-component wrapper.

## Field metadata

```ts
const schema = afz.object({
  username: afz.string()
    .min(3, 'At least 3 characters')
    .meta({
      label: 'Username',
      description: 'Visible to other users',
      hint: '3-20 chars',
      placeholder: 'Enter username',
      required: true,
      class: 'col-span-full',
      ui: { label: 'text-primary' },
      controlProps: { icon: 'i-lucide-user' }
    })
})
```

`controlProps` is forwarded to the underlying control (e.g. `UInput`), so any prop on that control is reachable here.

## Layout with `afz.layout`

### Grid

```ts
const schema = afz.object({
  $row: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string().meta({ label: 'First name' }),
      lastName: afz.string().meta({ label: 'Last name' }),
      email: afz.email().meta({ label: 'Email', class: 'col-span-full' })
    }
  })
})
```

Layout keys conventionally start with `$` but it's not required — any key whose value is `afz.layout(...)` is treated as a layout node.

### Tabs / accordion via `fieldSlots`

```ts
import { UTabs } from '#components'

const schema = afz.object({
  $tabs: afz.layout({
    component: UTabs,
    props: {
      items: [
        { label: 'Profile', slot: 'profile' },
        { label: 'Security', slot: 'security' }
      ]
    },
    fieldSlots: {
      name: 'profile',
      email: 'profile',
      password: 'security'
    },
    fields: {
      name: afz.string().meta({ label: 'Name' }),
      email: afz.email().meta({ label: 'Email' }),
      password: afz.string().min(8).meta({ label: 'Password', type: 'withPasswordToggle' })
    }
  })
})
```

`fieldSlot` (singular) puts **all** fields into one slot; `fieldSlots` (plural) maps fields per slot. Both accept a `(ctx) => string` function for reactive routing.

## Conditional & reactive fields

`if` and `hidden` accept either a boolean or `(ctx) => boolean`. Mark conditionally-rendered fields `.optional()` so validation doesn't fail when they're hidden.

```ts
const schema = afz.object({
  userType: afz.enum(['personal', 'company']).meta({ label: 'Account type' }),
  companyName: afz.string().optional().meta({
    label: 'Company',
    if: ctx => ctx.state.userType === 'company',
    required: ctx => ctx.state.userType === 'company'
  })
})
```

The same `ctx` (typed as `AutoFormFieldContext`) carries `state`, `path`, `value`, `setValue`, `errors`, `loading`.

## Custom controls

Register at the `useAutoForm()` call site, then reference by `type`:

```ts
import MyRichEditor from '~/components/MyRichEditor.vue'

const { afz, defineControl } = useAutoForm()

defineControl('richEditor', {
  component: MyRichEditor,
  controlProps: { theme: 'snow' }
})

const schema = afz.object({
  bio: afz.string().meta({ type: 'richEditor', label: 'Bio' })
})
```

Field-level `controlProps` merges over the global default.

## Submit handling

### Automatic loading

Return a promise from `@submit` and AutoForm tracks the submit button's loading state (default `loadingAuto: true`):

```ts
async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $api('/users', { method: 'POST', body: event.data })
}
```

### Manual loading

```vue
<MAutoForm
  :schema="schema"
  :state="state"
  :loading-auto="false"
  :submit-button-props="{ loading: saving, label: 'Save' }"
  @submit="onSubmit"
/>
```

### Field-level errors from the server

```vue
<script setup lang="ts">
import type { FormError } from '@nuxt/ui'

const form = useTemplateRef<InstanceType<typeof MAutoForm>>('form')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $api('/users', { method: 'POST', body: event.data })
  } catch {
    form.value?.formRef?.setErrors([
      { name: 'email', message: 'Email already taken' }
    ])
  }
}

function onError(errors: FormError[]) {
  // local validation failures
  console.warn(errors)
}
</script>

<template>
  <MAutoForm ref="form" :schema="schema" :state="state" @submit="onSubmit" @error="onError" />
</template>
```

### Programmatic submit / reset

```vue
<script setup lang="ts">
const form = useTemplateRef<InstanceType<typeof MAutoForm>>('form')

function save() { form.value?.formRef?.submit() }
function reset() { form.value?.reset() }
function clear() { form.value?.clear() }
</script>

<template>
  <MAutoForm ref="form" :schema="schema" :state="state" :submit-button="false" @submit="onSubmit" />
  <UButton label="Save" @click="save" />
  <UButton label="Reset" variant="outline" @click="reset" />
</template>
```

`form.formRef` exposes the underlying `UForm` instance — `validate()`, `getErrors()`, `setErrors()`, `clearErrors()`, plus reactive `dirty`, `dirtyFields`, `touchedFields`, `blurredFields`.
