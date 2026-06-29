---
title: WithClear
description: An input component with a clear button.
category: input
seo:
  title: WithClear
  description: An input with a clear button, built on the Nuxt UI input.
---

## Introduction

`MWithClear` is an input component with a one-click clear function. When the input has content, a clear button (×) appears on the right. Clicking it quickly clears the input.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
Built on Nuxt UI's Input component
::

## Usage

A clear button appears on the right automatically when there is content:

::component-code
---
name: MWithClear
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: John Doe
---
::

### `leadingIcon` Leading Icon

Add a semantic icon to the input via `leadingIcon`:

::component-code
---
name: MWithClear
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: user@example.com
  leadingIcon: i-lucide-mail
---
::

### `size` Size

Switch input and clear button size via `size`:

::component-code
---
name: MWithClear
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: Content
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `buttonProps` Clear Button

Customize the clear button style via `buttonProps`:

::component-code
---
name: MWithClear
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: Some content
  buttonProps:
    color: error
    icon: i-lucide-x
---
::

## Examples

### Clear Event

Listen to clear actions via the `@clear` event:

::component-example
---
name: ComponentsWithClearEventExample
---
::

## API

### Props

:component-props{slug="MWithClear"}

### Emits

:component-emits{slug="MWithClear"}

### Slots

:component-slots{slug="MWithClear"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
