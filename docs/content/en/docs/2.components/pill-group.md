---
title: PillGroup
description: A pill-style single/multiple selection group supporting string and object items, quantity constraints, field mapping, and slot customization.
category: form
seo:
  title: PillGroup
  description: A pill-style single/multiple selection group supporting string and object items, min/max constraints, custom field mapping, per-item color and slot customization.
---

## Introduction

`MPillGroup` is a pill-style option group component supporting both single and multiple selection. It accepts string arrays or object arrays as items, maps business object fields via `labelKey`, `valueKey`, and `descriptionKey`, and supports quantity constraints, per-item semantic colors, active/inactive style differentiation, and slot customization.

## Usage

Pass a string array to generate single-select pills. The selected value is written directly to v-model:

::component-code
---
name: MPillGroup
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: All
  items: ['All', 'Todo', 'In Progress', 'Done', 'Archived']
---
::

### `items` Structured Items

Object `items` can render composite content via `label`, `description`, and `icon`, while preserving the original object as the value:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: 'Free', description: 'Basic · 1 user', icon: 'i-lucide-gift' }
    - { value: 'pro', label: 'Pro', description: 'Team · 10 users', icon: 'i-lucide-zap' }
    - { value: 'team', label: 'Team', description: 'Insights · 50 users', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: 'Enterprise', description: 'Custom SLA · Unlimited', icon: 'i-lucide-building' }
---
::

### `multiple` Multiple Selection Mode

When `multiple` is enabled, `modelValue` becomes an array. Use `valueKey` to save only a stable field as the selected value:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: []
  items:
    - { value: 'free', label: 'Free', icon: 'i-lucide-gift' }
    - { value: 'pro', label: 'Pro', icon: 'i-lucide-zap' }
    - { value: 'team', label: 'Team', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: 'Enterprise', icon: 'i-lucide-building' }
  multiple: true
  valueKey: value
items:
  multiple: [true, false]
  valueKey: ['label', 'value', 'icon']
---
::

### `deselectable` Single Deselect

`deselectable` allows clicking the current item again to clear the selection — useful for optional filter conditions (ignored in multiple mode):

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: 'Free', icon: 'i-lucide-gift' }
    - { value: 'pro', label: 'Pro', icon: 'i-lucide-zap' }
    - { value: 'team', label: 'Team', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: 'Enterprise', icon: 'i-lucide-building' }
  deselectable: true
---
::

### `orientation` Layout Direction

Setting `orientation` to `vertical` stacks items vertically — suited for longer descriptions or narrow containers:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: 'Free', description: 'Basic · 1 user', icon: 'i-lucide-gift' }
    - { value: 'pro', label: 'Pro', description: 'Team · 10 users', icon: 'i-lucide-zap' }
    - { value: 'team', label: 'Team', description: 'Insights · 50 users', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: 'Enterprise', description: 'Custom SLA · Unlimited', icon: 'i-lucide-building' }
  orientation: vertical
items:
  orientation: ['vertical', 'horizontal']
---
::

### `activeVariant` Active Style

`activeVariant` and `inactiveVariant` control the visual variant for selected and unselected states respectively:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: 'Free', icon: 'i-lucide-gift' }
    - { value: 'pro', label: 'Pro', icon: 'i-lucide-zap' }
    - { value: 'team', label: 'Team', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: 'Enterprise', icon: 'i-lucide-building' }
  activeVariant: solid
  inactiveVariant: outline
items:
  activeVariant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
  inactiveVariant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
---
::

### `size` Size

Use `size` to switch pill sizes. When placed inside `UFormField`, the size is automatically inherited from context:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { value: 'free', label: 'Free', icon: 'i-lucide-gift' }
    - { value: 'pro', label: 'Pro', icon: 'i-lucide-zap' }
    - { value: 'team', label: 'Team', icon: 'i-lucide-users' }
    - { value: 'enterprise', label: 'Enterprise', icon: 'i-lucide-building' }
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `color` Primary Color

Use `color` to set the component's primary color, making it easier to coordinate with external `UFieldGroup` or button groups:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: All
  items: ['All', 'Todo', 'In Progress', 'Done', 'Archived']
  color: primary
items:
  color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

### `min` and `max` Quantity Constraints

`min` and `max` constrain the number of multiple selections: unselected items become grayed out at the max, and selected items cannot be deselected at the min:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: ['frontend', 'design']
  items:
    - { value: 'frontend', label: 'Frontend', icon: 'i-lucide-layout' }
    - { value: 'backend', label: 'Backend', icon: 'i-lucide-server' }
    - { value: 'devops', label: 'DevOps', icon: 'i-lucide-cloud' }
    - { value: 'design', label: 'Design', icon: 'i-lucide-palette' }
    - { value: 'data', label: 'Data', icon: 'i-lucide-database' }
  multiple: true
  valueKey: value
  min: 1
  max: 3
items:
  multiple: [true, false]
  min: [0, 1, 2]
  max: [2, 3, 4]
---
::

### `labelKey` Display Field

`labelKey` specifies the field to read from the business object for display. Falls back to `label` if not set:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: null
  items:
    - { id: 'u1', name: 'Alice', handle: '@alice', email: 'alice@team.dev' }
    - { id: 'u2', name: 'Bob', handle: '@bob', email: 'bob@team.dev' }
    - { id: 'u3', name: 'Carol', handle: '@carol', email: 'carol@team.dev' }
  labelKey: name
items:
  labelKey: ['name', 'handle', 'email', 'id']
---
::

### `valueKey` Value Field

`valueKey` specifies the field written back to `modelValue`, making it easy to save only a stable id rather than the entire object:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: u1
  items:
    - { id: 'u1', name: 'Alice', handle: '@alice', email: 'alice@team.dev' }
    - { id: 'u2', name: 'Bob', handle: '@bob', email: 'bob@team.dev' }
    - { id: 'u3', name: 'Carol', handle: '@carol', email: 'carol@team.dev' }
  labelKey: name
  valueKey: id
items:
  valueKey: ['id', 'handle', 'email']
---
::

### `color` Per-Item Semantic Color

Each item can carry an independent `color`, applied per item at render time to express status differences:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: doing
  items:
    - { value: 'todo', label: 'Todo', icon: 'i-lucide-circle', color: 'neutral' }
    - { value: 'doing', label: 'In Progress', icon: 'i-lucide-loader', color: 'warning' }
    - { value: 'done', label: 'Done', icon: 'i-lucide-check-circle', color: 'success' }
    - { value: 'block', label: 'Blocked', icon: 'i-lucide-octagon-x', color: 'error' }
  valueKey: value
---
::

### `disabled` Disabled

A per-item `disabled` prevents interaction on that item. The component-level `disabled` freezes the entire group while preserving the current value:

::component-code
---
name: MPillGroup
prettier: true
external: ['modelValue']
hide: ['modelValue']
ignore: ['items']
props:
  modelValue: pdf
  items:
    - { value: 'pdf', label: 'PDF', icon: 'i-lucide-file-text' }
    - { value: 'excel', label: 'Excel (Coming Soon)', icon: 'i-lucide-file-spreadsheet', disabled: true }
    - { value: 'csv', label: 'CSV', icon: 'i-lucide-file' }
    - { value: 'json', label: 'JSON', icon: 'i-lucide-braces' }
  valueKey: value
  disabled: false
---
::

## Examples

### Slot-Based Item Customization

The `item-label`, `item-trailing`, and other slots can take over partial rendering of individual items. The selection indicator updates with the `selected` slot prop:

::component-example
---
name: ComponentsPillGroupSlotsExample
prettier: true
---
::

### Event Callbacks

Clicking an item fires `update:modelValue`, `change`, and `select` in sequence. The `select` payload contains `item`, `value`, `selected`, and `index`:

::component-example
---
name: ComponentsPillGroupEventsExample
prettier: true
---
::

## API

### Props

:component-props{slug="MPillGroup"}

### Emits

:component-emits{slug="MPillGroup"}

### Slots

:component-slots{slug="MPillGroup"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
