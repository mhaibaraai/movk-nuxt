---
title: WithCharacterLimit
description: An input component with character limit and live counter display.
category: input
seo:
  title: WithCharacterLimit
  description: An input with character limit and live counter display, built on the Nuxt UI input.
---

## Introduction

`MWithCharacterLimit` is an input component with a character limit and real-time counter display. It shows the current character count and maximum limit to the right of the input field, helping users control input length.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
Built on Nuxt UI's Input component
::

## Usage

Default limit is 50 characters, with current/max count displayed in real time on the right:

::component-code
---
name: MWithCharacterLimit
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: Type up to the limit...
---
::

### `maxLength` Character Limit

Set the maximum character count via `maxLength`:

::component-code
---
name: MWithCharacterLimit
props:
  maxLength: 10
---
::

### `leadingIcon` Leading Icon

Add a semantic icon to the input via `leadingIcon`:

::component-code
---
name: MWithCharacterLimit
props:
  leadingIcon: i-lucide-message-square
---
::

### `size` Size

Switch input and counter size via `size`:

::component-code
---
name: MWithCharacterLimit
props:
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `ui` Styles

Customize the counter style via `ui.counter`:

::component-code
---
name: MWithCharacterLimit
prettier: true
props:
  maxLength: 100
  ui:
    counter: text-success
---
::

## API

### Props

:component-props{slug="MWithCharacterLimit"}

### Emits

:component-emits{slug="MWithCharacterLimit"}

### Slots

:component-slots{slug="MWithCharacterLimit"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
