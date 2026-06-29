---
title: SearchForm
description: A schema-driven, collapsible search form component.
category: form
seo:
  title: SearchForm
  description: A schema-driven, collapsible search form with grid layout, search/reset actions and auto row collapsing.
---

## Introduction

`MSearchForm` is a schema-driven search form component with built-in grid layout, search/reset buttons, and collapse behavior. When there are many search fields, items exceeding the visible row count are automatically collapsed. Users can expand or collapse them using the toggle button.

::callout{color="neutral" to="/docs/auto-form/quickstart"}
Reuses the AutoForm infrastructure (schema introspection, control mapping, field renderers) and defines search fields via Zod schema.
::

## Usage

Renders fields from an AutoForm schema. `cols` controls the grid. Built-in search and reset buttons — clicking "Search" triggers validation and emits `@submit`:

::component-example
---
name: ComponentsSearchFormBasicExample
---
::

### `v-model` Binding

`v-model` binds form data bidirectionally. The initial value passed in is recorded as the reset baseline — clicking "Reset" restores to that initial value rather than clearing the form.

::component-example
---
name: ComponentsSearchFormModelExample
---
::

### `cols` Grid Columns

`cols` controls the number of grid columns: pass a number for a fixed count, or a breakpoint object to switch columns across `sm`, `md`, `lg`, `xl` breakpoints.

::component-example
---
name: ComponentsSearchFormColsExample
options:
  - name: cols
    label: cols
    items: [1, 2, 3, 4]
    default: 4
---
::

::component-example
---
name: ComponentsSearchFormResponsiveExample
---
::

### `visibleRows` Collapse Behavior

`visibleRows` controls the number of visible rows. Fields exceeding this count collapse into the expanded area. Drag `cols` and `visibleRows` below to change the collapse threshold in real time.

::component-example
---
name: ComponentsSearchFormExpandExample
options:
  - name: visible-rows
    label: visibleRows
    items: [1, 2, 3]
    default: 1
  - name: cols
    label: cols
    items: [2, 3, 4]
    default: 3
---
::

### `expanded` Controlled Expand

`v-model:expanded` takes over the expanded state, taking priority over `defaultExpanded`. It can be driven by external buttons or logic.

::component-example
---
name: ComponentsSearchFormExpandedControlledExample
---
::

### `expandText` / `collapseText` / `icon` Toggle Button

`expandText` and `collapseText` customize the expand/collapse label text. `icon` switches the button icon. `collapseButtonProps` passes through button attributes.

::component-example
---
name: ComponentsSearchFormToggleButtonExample
options:
  - name: icon
    label: icon
    default: 'i-lucide-chevron-down'
  - name: expand-text
    label: expandText
    default: 'More Filters'
  - name: collapse-text
    label: collapseText
    default: 'Collapse'
---
::

### `actions` Action Buttons

The `actions` array extends or trims buttons:

- Built-in `key: search` automatically binds to submit; `key: reset` automatically binds to reset
- Custom `key` requires an `onClick(ctx)` handler where `ctx` contains `state`, `errors`, `search`, `reset`, `clear`, `toggle`, `loading`, and `expanded`
- Pass `actions: []` to disable all built-in buttons and fully customize via the `actions` slot

::component-example
---
name: ComponentsSearchFormHideButtonsExample
prettier: true
collapse: true
---
::

::component-example
---
name: ComponentsSearchFormCustomExample
prettier: true
collapse: true
---
::

## Examples

### Taking Over the Actions Area

The `#actions` slot exposes `search`, `clear`, and `loading`, allowing custom buttons to replace the default actions area:

::component-example
---
name: ComponentsSearchFormActionsSlotExample
prettier: true
---
::

### Extending Layout Areas

`header`, `footer`, and `extraActions` insert supplementary content. Slot props update with expand state and form values:

::component-example
---
name: ComponentsSearchFormLayoutSlotsExample
prettier: true
---
::

### Async Submit and Validation

`loading` controls the button loading state. `@error` returns the list of Zod validation failures:

::component-example
---
name: ComponentsSearchFormAsyncExample
prettier: true
---
::

## API

### Props

:component-props{slug="MSearchForm"}

### Emits

:component-emits{slug="MSearchForm"}

::note
`@submit` is forwarded from the underlying `UForm` and is not listed in the table above. It fires after successful validation and returns a `FormSubmitEvent` where search conditions are in `event.data` — the primary outlet for receiving query parameters.
::

### Slots

:component-slots{slug="MSearchForm"}

### Expose

You can access the typed component instance via [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref).

| Name | Type |
| ---- | ---- |
| `formRef`{lang="ts-type"} | `Ref<InstanceType<typeof UForm>>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Reference to the UForm component</p> |
| `submit()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Programmatically trigger form submission (equivalent to clicking the search button)</p> |
| `reset()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Restore to baseline (the v-model snapshot from initial mount) and fire the `reset` event</p> |
| `clear()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Clear all form fields to empty values and fire the `clear` event</p> |
| `setBaseline(value?)`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Set the restore baseline for `reset()`; uses the current v-model value if no argument is passed</p> |
| `expanded`{lang="ts-type"} | `ComputedRef<boolean>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Current expanded/collapsed state</p> |
| `toggle()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Toggle expand/collapse and emit `expand` and `update:expanded`</p> |

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
