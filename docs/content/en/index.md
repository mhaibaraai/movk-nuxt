---
seo:
  title: UI Engineering Suite Built on Nuxt UI — AutoForm, DataTable, Vue/Vite Universal
  description: Schema-driven AutoForm (Zod v4), fully-featured DataTable, standalone components and composables; complete capabilities in Nuxt 4 with API integration including auth and progress tracking; UI layer also available in plain Vue + Vite via Vite plugin (API integration domain is Nuxt-only).
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
:::motion
UI Engineering Suite Built on [Nuxt UI]{.text-primary}
:::

#description
:::motion
---
transition: { duration: 0.6, delay: 0.3 }
---
A UI engineering suite built on Nuxt UI and Zod v4: schema-driven AutoForm, a fully-featured DataTable, standalone components and composables. Get complete capabilities in Nuxt 4 including API integration with auth and progress tracking; its UI, forms, tables and theming can also be used directly in plain Vue + Vite projects via a Vite plugin (API integration domain is Nuxt-only).
:::

#links
:::motion{class="flex flex-wrap gap-x-6 gap-y-3"}
---
transition: { duration: 0.6, delay: 0.5 }
---
  ::::u-button
  ---
  to: /docs/getting-started
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  Get Started
  ::::

  ::::u-button
  ---
  icon: i-simple-icons-github
  color: neutral
  variant: outline
  size: xl
  to: https://github.com/mhaibaraai/movk-nuxt
  target: _blank
  ---
  View Source
  ::::
:::

#default
:home
::

::u-page-section{class="dark:bg-neutral-950"}
#title
Core Features

#description
Modular design, progressive adoption — from simple utility functions to complete automation systems, meeting all kinds of development needs.

#features
  :::u-page-feature{icon="i-lucide-zap"}
  #title
  AutoForm Engine

  #description
  Define data structures with a Zod Schema and automatically generate complete form interfaces, validation logic and layout.
  :::

  :::u-page-feature{icon="i-lucide-table"}
  #title
  DataTable

  #description
  Data columns, special columns, tree data, row interaction, appearance customization and pagination — all driven by declarative column configuration.
  :::

  :::u-page-feature{icon="i-lucide-cloud"}
  #title
  API Integration System (Nuxt only)

  #description
  The useApiFetch trio with upload/download progress, built-in multi-endpoint, auth, business code validation and Toast; requires Nuxt server runtime.
  :::

  :::u-page-feature{icon="i-lucide-blocks"}
  #title
  Nuxt / Vue Dual Mode

  #description
  Both a Nuxt module and a provider of @movk/nuxt/vite + vue-plugin, making the UI layer directly available in plain Vue + Vite projects.
  :::

  :::u-page-feature{icon="i-lucide-package"}
  #title
  Components & Composables

  #description
  DatePicker, PillGroup, SearchForm, Tree and other standalone components, paired with useTheme, useMessageBox and other utilities.
  :::

  :::u-page-feature{icon="i-lucide-shield-check"}
  #title
  Type Safe

  #description
  Full TypeScript type inference; prop callbacks and event handler types can be derived via index access.
  :::

  :::u-page-feature{icon="i-lucide-sparkles"}
  #title
  AI Friendly

  #description
  Built-in MCP Server and llms.txt; components, composables and docs can be retrieved by AI agents.
  :::
::

::u-page-section
---
orientation: horizontal
links:
  - label: View AutoForm Docs
    to: /docs/auto-form
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
Schema as Form

#description
Describe your data structure with Zod v4, and AutoForm automatically renders controls, binds validation and organizes layout — with fine-grained control over each field's appearance and conditional visibility through metadata.

#features
  :::u-page-feature{icon="i-lucide-binary"}
  #title
  Schema Driven

  #description
  The afz factory extends Zod with control types and metadata, so one Schema carries both data constraints and UI definitions.
  :::

  :::u-page-feature{icon="i-lucide-shield-check"}
  #title
  Built-in Validation

  #description
  Field constraints come directly from Zod; validation fires on submit, and error messages can be customized per field.
  :::

  :::u-page-feature{icon="i-lucide-layout-panel-left"}
  #title
  Layout & Conditional Rendering

  #description
  Group fields with layout, conditionally show/hide with meta.if based on form state — complex forms stay declarative.
  :::

#default
  :::code-group{class="lg:[&_pre]:min-h-[362px]"}
  ```vue [AutoForm.vue]
  <script setup lang="ts">
  import type { z } from 'zod'

  const { afz } = useAutoForm()

  const schema = afz.object({
    username: afz.string('Please enter a username').min(3).max(20),
    age: afz.number().min(18, 'Age must be at least 18').max(99),
    role: afz.enum(['Admin', 'Editor', 'Viewer'] as const)
      .meta({ label: 'Role', placeholder: 'Select role' }),
    email: afz.email({ error: 'Please enter a valid email address' })
  })

  type Schema = z.output<typeof schema>

  const state = ref<Partial<Schema>>({})
  </script>

  <template>
    <MAutoForm :schema="schema" :state="state" />
  </template>
  ```
  :::
::

::u-page-section
---
orientation: horizontal
reverse: true
links:
  - label: View DataTable Docs
    to: /docs/data-table
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
Declarative Data Table

#description
Describe your table's columns, alignment, sorting and cell rendering with a single column configuration — DataTable handles selection columns, pinned columns, resizable columns, tree data, pagination and more.

#features
  :::u-page-feature{icon="i-lucide-columns-3"}
  #title
  Column Configuration Driven

  #description
  Define accessorKey, header, size, align and cell in one place; data columns and special columns share a unified descriptor.
  :::

  :::u-page-feature{icon="i-lucide-list-tree"}
  #title
  Special Columns & Tree Data

  #description
  Built-in selection, expand and index columns; supports tree data and cascading selection strategies.
  :::

  :::u-page-feature{icon="i-lucide-move-horizontal"}
  #title
  Interactive Capabilities

  #description
  Sorting, column pinning, column resizing, visibility control and paginated loading — all toggled via props.
  :::

#default
  :::code-group
  ```vue [DataTable.vue]
  <script setup lang="ts">
  import type { DataTableColumn } from '@movk/nuxt'

  interface Member {
    id: string
    name: string
    role: string
    salary: number
  }

  const data = ref<Member[]>([])

  const columns: DataTableColumn<Member>[] = [
    { type: 'selection' },
    { accessorKey: 'name', header: 'Name', size: 120 },
    { accessorKey: 'role', header: 'Role', size: 140 },
    {
      accessorKey: 'salary',
      header: 'Salary',
      align: 'right',
      cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`
    }
  ]
  </script>

  <template>
    <MDataTable :columns="columns" :data="data" sortable pinable resizable />
  </template>
  ```
  :::
::

::u-page-section
---
orientation: horizontal
links:
  - label: View API Docs
    to: /docs/api
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
Out-of-the-Box API Integration

#description
useApiFetch wraps Nuxt's useFetch with multi-endpoint switching, auth injection, business status code validation, data unwrapping and unified Toast — configure once and reuse across the entire app.

#features
  :::u-page-feature{icon="i-lucide-layers"}
  #title
  Multi-Endpoint

  #description
  Declare multiple named endpoints, each independently configured with its own baseURL, auth, Toast and response rules.
  :::

  :::u-page-feature{icon="i-lucide-key-round"}
  #title
  Auth & Business Codes

  #description
  Requests automatically inject tokens; responses automatically validate business status codes and unwrap data.
  :::

  :::u-page-feature{icon="i-lucide-bell"}
  #title
  Unified Toast & Progress

  #description
  Success and error notifications handled uniformly, with companion upload/download progress composables.
  :::

#default
  :::code-group
  ```ts [component.vue]
  // SSR + CSR, data available on first render
  const { data, status, error } = await useApiFetch<User[]>('/users')

  // Switch endpoint + data unwrapping
  const { data: profile } = await useApiFetch('/profile', {
    endpoint: 'admin'
  })
  ```

  ```ts [nuxt.config.ts]
  export default defineNuxtConfig({
    movk: {
      api: {
        endpoints: {
          default: { baseURL: '/api' },
          admin: {
            baseURL: '/admin-api',
            auth: { tokenType: 'Bearer' }
          }
        }
      }
    }
  })
  ```
  :::
::

::u-page-section
---
orientation: horizontal
reverse: true
links:
  - label: Browse Components
    to: /docs/components
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
  - label: Browse Composables
    to: /docs/composables
    color: neutral
    variant: ghost
    trailingIcon: i-lucide-arrow-right
---
#title
Components & Composables

#description
Standalone components like DatePicker, SearchForm, PillGroup, SlideVerify and Tree are ready to use out of the box, paired with imperative utilities like useTheme, useMessageBox and useDateFormatter for common interaction patterns.

#features
  :::u-page-feature{icon="i-lucide-blocks"}
  #title
  Standalone Components

  #description
  Date picking, color choosing, slide verification, star rating and input enhancements — no extra wrapping required.
  :::

  :::u-page-feature{icon="i-lucide-square-function"}
  #title
  Imperative Utilities

  #description
  useMessageBox dialogs, useTheme for reading and writing theme state, useDateFormatter for date formatting.
  :::

  :::u-page-feature{icon="i-lucide-palette"}
  #title
  Runtime Theming

  #description
  Colors, radius, fonts, icon sets and light/dark mode can be switched at runtime, with a companion ThemePicker.
  :::

#default
  :::code-group
  ```vue [Components.vue]
  <template>
    <MDatePicker v-model="date" />
    <MColorChooser v-model="color" />
    <MSlideVerify v-model="verified" />
  </template>
  ```

  ```ts [composables.ts]
  // Imperative dialog
  const { confirm } = useMessageBox()
  await confirm({ type: 'warning', title: 'Confirm delete?' })

  // Read and write runtime theme
  const { primary, mode } = useTheme()
  ```
  :::
::

::u-page-section
---
links:
  - label: Configure MCP Server
    to: /docs/getting-started/ai/mcp
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
  - label: Learn about llms.txt
    to: /docs/getting-started/ai/llms-txt
    color: neutral
    variant: ghost
    trailingIcon: i-lucide-arrow-right
---
#title
Built for AI Agents

#description
The module ships with a built-in MCP Server and llms.txt — component APIs, composables and docs can all be retrieved and called by AI agents, making AI-assisted development more precise.

#features
  :::u-page-feature{icon="i-lucide-plug"}
  #title
  MCP Server

  #description
  Exposes components, composables and examples via the Model Context Protocol for agents to query in real time.
  :::

  :::u-page-feature{icon="i-lucide-file-text"}
  #title
  llms.txt

  #description
  Generates structured llms.txt so large language models can quickly understand module capabilities and documentation structure.
  :::

  :::u-page-feature{icon="i-lucide-search"}
  #title
  Searchable Docs

  #description
  Components, composables and examples are uniformly indexed for more accurate AI-assisted development references.
  :::
::

::u-page-c-t-a
---
class: dark:bg-neutral-950
links:
  - label: Star on GitHub
    to: https://github.com/mhaibaraai/movk-nuxt
    target: _blank
    icon: i-lucide-star
    color: neutral
  - label: Get Started
    to: /docs/getting-started
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
Start Building Your Next Nuxt App

#description
From a single Schema to complete forms, tables and API integration — Movk Nuxt helps you consolidate high-frequency requirements into ready-to-use module capabilities.
::
