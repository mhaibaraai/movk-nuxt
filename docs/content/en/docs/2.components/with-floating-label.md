---
title: WithFloatingLabel
description: An input component with a floating label and clear button.
category: input
seo:
  title: WithFloatingLabel
  description: An input with a floating label and clear button, built on the Nuxt UI input.
---

## Introduction

`MWithFloatingLabel` is an input component with a floating label effect. The label displays centered as a placeholder when the input is empty, and automatically floats upward when focused or when content is entered. It also has a built-in clear button that appears on the right when there is content.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
Built on Nuxt UI's Input component
::

## Usage

The label displays centered when empty, and automatically floats up when focused or when content is entered:

::component-code
---
name: MWithFloatingLabel
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: test@example.com
  label: Email Address
---
::

### `leadingIcon` Leading Icon

Add a leading icon to the input via `leadingIcon`:

::component-code
---
name: MWithFloatingLabel
props:
  label: Username
  leadingIcon: i-lucide-user
---
::

### `size` Size

Switch input and label size via `size`:

::component-code
---
name: MWithFloatingLabel
props:
  label: Size Demo
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `clearButtonProps` Clear Button

::component-code
---
name: MWithFloatingLabel
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: test@example.com
  label: Email Address
  ui:
    label: text-warning
  clearButtonProps:
    color: error
    icon: i-lucide-x
items:
  clearButtonProps.color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

## Examples

### Clear Event

Listen to clear actions via the `@clear` event:

::component-example
---
name: ComponentsWithFloatingLabelClearExample
---
::

## API

### Props

:component-props{slug="MWithFloatingLabel"}

### Emits

:component-emits{slug="MWithFloatingLabel"}

### Slots

:component-slots{slug="MWithFloatingLabel"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
