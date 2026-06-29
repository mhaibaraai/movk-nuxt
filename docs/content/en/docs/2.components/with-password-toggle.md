---
title: WithPasswordToggle
description: A password input component with show/hide visibility toggle.
category: input
seo:
  title: WithPasswordToggle
  description: A password input with a show/hide visibility toggle, built on the Nuxt UI input.
---

## Introduction

`MWithPasswordToggle` is a password input component with a show/hide visibility toggle. It provides an eye icon button that toggles between plaintext and masked display, improving the user experience for password input.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
Built on Nuxt UI's Input component
::

## Usage

The eye button on the right toggles between plaintext and masked display:

::component-code
---
name: MWithPasswordToggle
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 'hide-me'
---
::

### `leadingIcon` Leading Icon

Add a semantic icon to the password input via `leadingIcon`:

::component-code
---
name: MWithPasswordToggle
props:
  leadingIcon: i-lucide-lock
---
::

### `size` Size

Switch input and button size via `size`:

::component-code
---
name: MWithPasswordToggle
props:
  modelValue: Test@123
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `buttonProps` Toggle Button

Customize the toggle button style via `buttonProps`:

::component-code
---
name: MWithPasswordToggle
prettier: true
props:
  modelValue: SecurePass123
  buttonProps:
    color: primary
    variant: soft
items:
  buttonProps.color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
  buttonProps.variant: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

## API

### Props

:component-props{slug="MWithPasswordToggle"}

### Emits

:component-emits{slug="MWithPasswordToggle"}

### Slots

:component-slots{slug="MWithPasswordToggle"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
