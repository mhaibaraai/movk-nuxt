---
title: WithCopy
description: An input component with a copy-to-clipboard button.
category: input
seo:
  title: WithCopy
  description: An input with a copy-to-clipboard button, built on the Nuxt UI input.
---

## Introduction

`WithCopy` is an input component with a one-click copy function. When the input has content, a copy button appears on the right. Clicking it quickly copies the input content to the clipboard.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
Built on Nuxt UI's Input component
::

## Usage

The copy button on the right copies content to the clipboard with one click:

::component-code
---
name: MWithCopy
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: sk-1234567890abcdef
---
::

### `leadingIcon` Leading Icon

Add a semantic icon to the input via `leadingIcon`:

::component-code
---
name: MWithCopy
props:
  leadingIcon: i-lucide-key
---
::

### `size` Size

Switch input and copy button size via `size`:

::component-code
---
name: MWithCopy
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ABC123XYZ
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `buttonProps` Copy Button

Customize the copy button style via `buttonProps`:

::component-code
---
name: MWithCopy
prettier: true
props:
  modelValue: ABC123XYZ
  buttonProps:
    variant: soft
    color: primary
items:
  buttonProps.variant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
  buttonProps.color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

## Examples

### Copy Event

Listen to copy actions via the `@copy` event:

::component-example
---
name: ComponentsWithCopyEventExample
---
::

## API

### Props

:component-props{slug=MWithCopy}

### Emits

:component-emits{slug=MWithCopy}

### Slots

:component-slots{slug=MWithCopy}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
