---
title: Tree
description: A tree component built on Nuxt UI Tree, adding search, lazy loading, toolbar, checkboxes, and parent/child strategy.
category: advanced
seo:
  title: Tree
  description: A tree component built on Nuxt UI Tree, adding search filtering with highlight, async lazy loading, a toolbar, cascading checkboxes, parent/child strategy, key-based binding and an imperative API.
navigation.badge: v1.4.2
---

## Introduction

`MTree` is a thin wrapper over Nuxt UI `Tree`, fully passing through all its props, events, and slots while adding several enhancements: search filtering with highlight, async lazy loading, a toolbar (expand/collapse toggle, tri-state select all), checkbox multi-select with parent/child strategy (cascade / isolated), key binding (`v-model:selectedKeys`), an imperative API, and selection categorization. Tree data normalization, filtering, and traversal reuse the `Tree` utility methods from `@movk/core`.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/tree"}
Built on Nuxt UI's Tree component — all native props and slots are fully passed through
::

## Usage

Pass `items` to render a hierarchical structure. Node `defaultExpanded` controls the initial expansion, and `v-model` binds the selected node:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
  - modelValue
hide:
  - modelValue
props:
  modelValue:
    label: app.vue
  items:
    - label: app
      icon: i-lucide-folder
      defaultExpanded: true
      children:
        - label: app.vue
          icon: i-vscode-icons-file-type-vue
        - label: nuxt.config.ts
          icon: i-vscode-icons-file-type-nuxt
    - label: composables
      icon: i-lucide-folder
      children:
        - label: useAuth.ts
          icon: i-vscode-icons-file-type-typescript
        - label: useUser.ts
          icon: i-vscode-icons-file-type-typescript
---
::

### `defaultExpanded` Default Expansion

`defaultExpanded` derives the initially expanded parent nodes from a strategy, falling back to the node's own `defaultExpanded` flag. Pass `true` to expand all parents, a `number` to expand only parents with depth less than that value, or a function for custom logic per node and depth:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
props:
  items:
    - label: app
      icon: i-lucide-folder
      children:
        - label: composables
          icon: i-lucide-folder
          children:
            - label: useAuth.ts
              icon: i-vscode-icons-file-type-typescript
            - label: useUser.ts
              icon: i-vscode-icons-file-type-typescript
        - label: app.vue
          icon: i-vscode-icons-file-type-vue
    - label: nuxt.config.ts
      icon: i-vscode-icons-file-type-nuxt
  defaultExpanded: true
items:
  defaultExpanded: [true, 1]
---
::

### `searchable` Search Filtering

`searchable` renders a search input at the top, prunes the tree by keyword while preserving ancestor chains for matching nodes. `highlight` is enabled by default, highlighting matched text and auto-expanding on match. `filter` allows a custom match predicate. `search` supports `v-model:search` two-way binding of the keyword:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
props:
  items:
    - label: app
      icon: i-lucide-folder
      children:
        - label: useAuth.ts
          icon: i-vscode-icons-file-type-typescript
        - label: useUser.ts
          icon: i-vscode-icons-file-type-typescript
    - label: components
      icon: i-lucide-folder
      children:
        - label: Card.vue
          icon: i-vscode-icons-file-type-vue
        - label: Button.vue
          icon: i-vscode-icons-file-type-vue
  searchable: true
---
::

### `checkable` Checkbox Cascade

`checkable` renders a checkbox before each node, internally enables `multiple` with parent/child cascade and indeterminate state bubbling. `v-model` collects the selected node array. Checkboxes coexist with node `icon` and parent folder icons:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
  - modelValue
hide:
  - modelValue
props:
  modelValue: []
  items:
    - label: app
      icon: i-lucide-folder
      defaultExpanded: true
      children:
        - label: app.vue
          icon: i-vscode-icons-file-type-vue
        - label: nuxt.config.ts
          icon: i-vscode-icons-file-type-nuxt
    - label: composables
      icon: i-lucide-folder
      children:
        - label: useAuth.ts
          icon: i-vscode-icons-file-type-typescript
        - label: useUser.ts
          icon: i-vscode-icons-file-type-typescript
  checkable: true
items:
  checkable: [true, false]
---
::

::note
`checkable` is syntactic sugar for `multiple` + `strategy` (default `cascade`). Use `multiple` instead when you need multi-select without rendering checkboxes.
::

### `multiple` Multiple Selection

`multiple` enables multi-select without rendering checkboxes. Clicking a node accumulates the selection. `v-model` collects the selected node array:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
  - modelValue
hide:
  - modelValue
props:
  modelValue: []
  items:
    - label: Tech Center
      defaultExpanded: true
      children:
        - label: Frontend
          children:
            - label: Component Library
            - label: Visualization
        - label: Backend
    - label: Product Center
      children:
        - label: UX Design
  multiple: true
items:
  multiple: [true, false]
---
::

### `strategy` Parent/Child Strategy

`strategy` controls the parent/child check relationship in multi-select / `checkable` mode. `cascade` (default) cascades parent/child and re-fills the parent when all children are selected. `isolated` keeps parent and child independent — indeterminate state does not bubble:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
  - modelValue
hide:
  - modelValue
items:
  strategy:
    - cascade
    - isolated
  checkable: [true, false]
props:
  modelValue: []
  items:
    - label: Tech Center
      defaultExpanded: true
      children:
        - label: Frontend
          children:
            - label: Component Library
            - label: Visualization
        - label: Backend
          children:
            - label: Gateway
            - label: Storage
  checkable: true
  strategy: cascade
---
::

### `selectedKeys` Key Binding

`selectedKeys` two-way binds the selection using an array of node keys — useful for re-populating from the backend or syncing with routes. `v-model:selectedKeys` and `v-model` are interoperable. Keys are derived from `getKey` / `labelKey`:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
model:
  - selectedKeys
props:
  selectedKeys:
    - app.vue
  items:
    - label: app
      icon: i-lucide-folder
      defaultExpanded: true
      children:
        - label: app.vue
          icon: i-vscode-icons-file-type-vue
        - label: nuxt.config.ts
          icon: i-vscode-icons-file-type-nuxt
  checkable: true
items:
  checkable: [true, false]
---
::

### `toolbar` Toolbar

`toolbar` renders a top toolbar with expand/collapse toggle buttons. When `searchable` is set, it embeds a clearable search input. When `checkable` is set, it adds a tri-state select-all checkbox and selection count:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
  - modelValue
hide:
  - modelValue
props:
  modelValue: []
  items:
    - label: Tech Center
      children:
        - label: Frontend
          children:
            - label: Component Library
            - label: Visualization
        - label: Backend
          children:
            - label: Gateway
            - label: Storage
    - label: Product Center
      children:
        - label: UX Design
        - label: User Research
  toolbar: true
  searchable: true
  checkable: true
items:
  checkable: [true, false]
  toolbar: [true, false]
  searchable: [true, false]
---
::

::note
The toolbar's select-all count is based on **leaves**: in cascade mode, selecting a parent brings in child keys. Counting by leaves avoids double counting.
::

### `lazy` Async Lazy Loading

`lazy` works with `loadChildren` — expanding an unloaded parent node fetches child nodes and displays a loading state. The `isLeaf` flag on a node marks it as a leaf, preventing expansion placeholder rendering:

::component-example
---
name: ComponentsTreeLazyExample
---
::

### `childrenKey` Field Mapping

`childrenKey` normalizes the backend's child node field to `children`. `labelKey` specifies the display field, eliminating the need to pre-transform data structures:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
props:
  items:
    - name: Tech Center
      nodes:
        - name: Frontend
          nodes:
            - name: Component Library
            - name: Visualization
        - name: Backend
    - name: Product Center
      nodes:
        - name: UX Design
  childrenKey: nodes
  labelKey: name
---
::

### `labelKey` Dot-Path Value Extraction

`labelKey` specifies the node display field, supporting dot-path deep extraction of nested fields like `meta.title`. Key derivation, search, and highlight all use the same path:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
props:
  items:
    - meta:
        title: Tech Center
      children:
        - meta:
            title: Frontend
          children:
            - meta:
                title: Component Library
            - meta:
                title: Visualization
        - meta:
            title: Backend
    - meta:
        title: Product Center
      children:
        - meta:
            title: UX Design
  labelKey: meta.title
  searchable: true
---
::

::note
The dot-path must align with UTree's internal value extraction. Only dot notation (`a.b.c`) is supported — bracket notation (`a[0].b`) is not.
::

### `virtualize` Virtual Scrolling

`virtualize` passes through Nuxt UI Tree's virtualization capability, rendering only visible nodes — suitable for large data sets:

::component-example
---
name: ComponentsTreeVirtualizeExample
---
::

### `color` Primary Color

`color` passes through Nuxt UI Tree's primary color, applying to selected node text color and keyboard focus ring. The example pre-selects a node for visual reference:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
  - modelValue
hide:
  - modelValue
items:
  color:
    - primary
    - success
    - info
    - warning
    - error
    - neutral
props:
  modelValue:
    label: app.vue
  items:
    - label: app
      icon: i-lucide-folder
      defaultExpanded: true
      children:
        - label: app.vue
          icon: i-vscode-icons-file-type-vue
        - label: nuxt.config.ts
          icon: i-vscode-icons-file-type-nuxt
    - label: composables
      icon: i-lucide-folder
      children:
        - label: useAuth.ts
          icon: i-vscode-icons-file-type-typescript
  color: error
---
::

::note
UTree's `color` only applies to selected node text and focus ring. No visible change occurs when no node is selected. Single-color icons (e.g., lucide) inherit the text color; multi-color icons (e.g., vscode-icons) maintain their own coloring.
::

### `trailingIcon` Trailing Icon

`trailingIcon` replaces the expand indicator icon at the end of parent nodes (default `i-lucide-chevron-down`). `item.trailingIcon` on node data takes higher priority:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
props:
  items:
    - label: app
      icon: i-lucide-folder
      trailingIcon: i-lucide-arrow-down
      defaultExpanded: true
      children:
        - label: app.vue
          icon: i-vscode-icons-file-type-vue
        - label: nuxt.config.ts
          icon: i-vscode-icons-file-type-nuxt
    - label: composables
      icon: i-lucide-folder
      children:
        - label: useAuth.ts
          icon: i-vscode-icons-file-type-typescript
  trailingIcon: i-lucide-chevron-right
---
::

### `expandedIcon` Expand Icon

`expandedIcon` / `collapsedIcon` customize the leading icon for parent nodes when expanded / collapsed (default `i-lucide-folder-open` / `i-lucide-folder`):

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
props:
  items:
    - label: app
      defaultExpanded: true
      children:
        - label: app.vue
          icon: i-vscode-icons-file-type-vue
        - label: nuxt.config.ts
          icon: i-vscode-icons-file-type-nuxt
    - label: composables
      children:
        - label: useAuth.ts
          icon: i-vscode-icons-file-type-typescript
  expandedIcon: i-lucide-book-open
  collapsedIcon: i-lucide-book
---
::

::note
`item.icon` on a node takes higher priority than `expandedIcon` / `collapsedIcon`. Therefore, folders that need to switch icons based on expanded state should not set `item.icon`.
::

### `disabled` Disabled

`disabled` disables the entire tree, blocking click events on nodes, toolbar controls, and checkboxes for expand, collapse, and select operations. Per-node `item.disabled` disables that node and its entire subtree — freezing expansion state and disabling checkboxes within the subtree:

::component-code
---
name: MTree
collapse: true
prettier: true
ignore:
  - items
external:
  - items
  - modelValue
hide:
  - modelValue
props:
  modelValue:
    - label: useAuth.ts
  items:
    - label: app
      icon: i-lucide-folder
      defaultExpanded: true
      children:
        - label: app.vue
          icon: i-vscode-icons-file-type-vue
        - label: nuxt.config.ts
          icon: i-vscode-icons-file-type-nuxt
    - label: composables
      icon: i-lucide-folder
      children:
        - label: useAuth.ts
          icon: i-vscode-icons-file-type-typescript
  checkable: true
  toolbar: true
  disabled: true
items:
  checkable: [true, false]
  toolbar: [true, false]
  disabled: [true, false]
---
::

::note
Imperative API methods (`expandToDepth`, `selectAll`, etc.) are explicit calls and are not affected by `disabled`. `disabled` only intercepts user clicks and toolbar interactions.
::

## Examples

### Custom Node

Customize node content via passed-through slots like `item-trailing`. Uncovered slots are still rendered by Nuxt UI Tree's defaults:

::component-example
---
name: ComponentsTreeSlotExample
---
::

### Custom Toolbar

`toolbar-leading` / `toolbar-trailing` append content to the start/end of the default toolbar. Use the `#toolbar` slot for full control — its scope exposes methods and state like `toggleExpand`, `selectAll`, `clear`, and `selectionSummary`:

::component-example
---
name: ComponentsTreeCustomToolbarExample
---
::

### Imperative Control

Obtain the component instance via `useTemplateRef` and call methods like `expandToDepth`, `collapseAll`, `selectAll`, and `clearSelection` to control the tree:

::component-example
---
name: ComponentsTreeImperativeExample
---
::

### Selection Categorization

The instance's reactive `treeSelection` returns selection categories: `leaves` (selected leaves), `parents` (fully selected parents), `halfSelected` (indeterminate parents), and `strictlyChecked` (excludes children selected via parent cascade):

::component-example
---
name: ComponentsTreeSelectionExample
---
::

## API

### Props

:component-props{slug="MTree"}

### Emits

:component-emits{slug="MTree"}

::tip
In addition to passing through Nuxt UI Tree's `update:modelValue` and `update:expanded`, `MTree` additionally provides:

- `update:search`: Fires when the search keyword changes, supports `v-model:search`.
- `update:selectedKeys`: Fires when the selected key list changes, supports `v-model:selectedKeys`.
- `change`: Fires when the selection changes. Payload is `{ value, keys, selection }`. `keys` is derived from `getKey`/`labelKey`. `selection` is the selection categorization result.
::

### Slots

:component-slots{slug="MTree"}

### Expose

You can access the typed component instance via [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref).

| Name | Type |
| ---- | ---- |
| `expandAll()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Expand all expandable nodes</p> |
| `collapseAll()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Collapse all nodes</p> |
| `expandToDepth(depth)`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Expand to the specified depth. `depth=0` collapses all</p> |
| `selectAll()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Select all selectable nodes</p> |
| `clearSelection()`{lang="ts-type"} | `void`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Clear all selections</p> |
| `treeSelection`{lang="ts-type"} | `TreeSelectionResult`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Current selection categorization (`selected` / `leaves` / `parents` / `halfSelected` / `strictlyChecked`)</p> |

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
