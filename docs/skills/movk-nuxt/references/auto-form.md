# AutoForm and SearchForm

Use `MAutoForm` for editing data with validation and `MSearchForm` for a filter bar. Both derive fields from a Zod v4 object schema. Use the `afz` factory for Movk field metadata and typed control options.

## Build and submit a form

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { AutoFormSubmitHandler } from '@movk/nuxt'
import type { z } from 'zod'

const { afz } = useAutoForm()
const schema = afz.object({
  name: afz.string().min(1).meta({ label: 'Name' }),
  email: afz.email().meta({ label: 'Email address' }),
  active: afz.boolean({ type: 'toggle' }).default(true).meta({ label: 'Active' })
})

const state = ref<Partial<z.input<typeof schema>>>({})
const submittedName = ref('')

const onSubmit: AutoFormSubmitHandler<typeof schema> = (event) => {
  submittedName.value = event.data.name
}
</script>

<template>
  <MAutoForm v-model="state" :schema="schema" @submit="onSubmit" />
  <p v-if="submittedName">Submitted {{ submittedName }}</p>
</template>
```

- Use `z.input<typeof schema>` for editable state. Use `AutoFormSubmitHandler<typeof schema>` to type the validated payload. With the default transform behavior, `event.data` uses the schema output.
- Return the save promise from the submit handler to use the default `loadingAuto` behavior. For externally managed pending state, pass `:loading-auto="false"` and bind `loading`.
- `@error` receives a Nuxt UI `FormErrorEvent`. Use the exposed `formRef?.setErrors([{ name: 'email', message: 'Email already exists' }])` after interpreting a server field error.
- The component exposes `submit()`, `validate()`, `reset()`, `clear()`, and `setBaseline()`. Use `setBaseline()` when a loaded or saved record becomes the new reset point.

## Pick a field or control

| Need | Pattern |
| --- | --- |
| Text, number, checkbox | `afz.string()`, `afz.number()`, `afz.boolean()` |
| Email and URL validation | `afz.email()`, `afz.url()` |
| One choice | `afz.enum(values)`, with `type: 'selectMenu'`, `'radioGroup'`, or `'toggleGroup'` when appropriate |
| Pressed / unpressed | `afz.boolean({ type: 'toggle' })` |
| Multiple toggle buttons | `afz.array(afz.enum(values), { type: 'toggleGroup', controlProps: { type: 'multiple', items } })` |
| Calendar, typed date, typed time | `afz.calendarDate()`, `afz.inputDate()`, `afz.inputTime()` |
| Nested fields or repeatable entries | `afz.object(shape)`, `afz.array(itemSchema)` |
| File selection | `afz.file()` |

For a single toggle group, add `.optional()` when clearing the selection is valid. Give fields labels and descriptions through `.meta()`. Use `controlProps` for properties of the rendered control such as input icons or a password input type. Use `afz.layout({ class, fields })` to group fields visually, or add `component`, `props`, and `fieldSlots` to place fields inside named slots.

## Register a control

```ts
import RichEditor from './RichEditor.vue'

const { afz, controls } = useAutoForm({
  richEditor: defineControl({ component: RichEditor })
})

const schema = afz.object({
  biography: afz.string({ type: 'richEditor' }).meta({ label: 'Biography' })
})
```

Bind `:controls="controls"` with `:schema="schema"` on the form. The custom control should support the field's model value and update event. For a one-off control, pass its component through field metadata.

## Handle conditional fields and filters

- Use `if: ctx => ...` to exclude fields from rendering, validation, and submission. Use `hidden: ctx => ...` for visibility alone. Use the schema to validate required fields when they apply.
- Set `asyncItems.deps` to a function of form state and use `asyncItems.load({ state, signal })` to fetch choices. Forward the signal so a new choice of dependency can cancel the previous request.
- Use `MSearchForm` with the same schema and control map. Use `@submit` for explicit searches. With `sync-query` in Nuxt or Vue Router, use `@query-restore` to refresh results from restored URL values.

[AutoForm quickstart](https://nuxt.mhaibaraai.cn/docs/auto-form/quickstart) · [Controls](https://nuxt.mhaibaraai.cn/docs/auto-form/controls) · [SearchForm](https://nuxt.mhaibaraai.cn/docs/auto-form/search-form)
