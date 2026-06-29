---
title: ColorChooser
description: A visual color picker component.
category: advanced
seo:
  title: ColorChooser
  description: A visual color picker supporting hex/rgb/hsl formats, preset swatches, copy and clearable selection.
---

## Introduction

`MColorChooser` is a visual color picker component. It provides a color wheel and HSL sliders for color selection, supports custom trigger styles, preset swatches, copy and clear actions, and synchronizes the value in one of three formats: hex, rgb, or hsl.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/color-picker"}
Built on Nuxt UI's ColorPicker component
::

## Usage

The default button trigger displays the current color value. Click to open the popover and select a color from the panel to sync with v-model:

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#0ea5e9'
---
::

### `formats` Output Format

Switch between `hex`, `rgb`, `hsl`, `cmyk`, and `lab` at the top of the popover — the current value is converted to the selected format:

::component-code
---
name: MColorChooser
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#22c55e'
  formats: ['hex', 'rgb', 'hsl', 'cmyk', 'lab']
---
::

### `swatches` Single-Group Presets

A one-dimensional `swatches` array renders as a continuous color palette. Clicking a swatch selects the color and closes the popover by default:

::component-code
---
name: MColorChooser
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#ef4444'
  swatches:
    - '#ef4444'
    - '#f97316'
    - '#f59e0b'
    - '#eab308'
    - '#84cc16'
    - '#22c55e'
    - '#10b981'
    - '#14b8a6'
    - '#06b6d4'
    - '#0ea5e9'
    - '#3b82f6'
    - '#6366f1'
    - '#8b5cf6'
    - '#a855f7'
    - '#d946ef'
    - '#ec4899'
---
::

### `swatches` Grouped Presets

A two-dimensional `swatches` array groups colors by row to display hues and neutral tones. `closeOnSwatch` controls whether the popover closes after selection:

::component-code
---
name: MColorChooser
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#3b82f6'
  closeOnSwatch: false
  swatches:
    - ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6']
    - ['#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']
    - ['#0a0a0a', '#404040', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5', '#f5f5f5', '#ffffff']
---
::

### `trigger` Trigger Style

`trigger` controls the trigger appearance: `button` renders a button, `chip` renders a compact color block only, and `input` provides a color dot + text input that validates hex on blur:

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#f59e0b'
  trigger: chip
items:
  trigger: ['button', 'chip', 'input']
---
::

### `copyable` Copy Button

`copyable` enables a copy button at the bottom of the popover. Clicking it fires the `@copy` event:

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#a855f7'
  copyable: true
---
::

### `clearable` Clear Button

`clearable` enables a clear button at the bottom of the popover. Clicking it resets the current value and fires the `@clear` event:

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#a855f7'
  clearable: true
---
::

### `ui` Style Customization

`ui` overrides the class of internal slots to customize the swatch grid and swatch size, without affecting the color picker, copy, or clear mechanisms:

::component-code
---
name: MColorChooser
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#14b8a6'
  ui:
    swatches: grid grid-cols-4 gap-2
    swatch: size-8 rounded-lg ring-2 ring-default cursor-pointer hover:ring-primary
  swatches:
    - '#ef4444'
    - '#f97316'
    - '#f59e0b'
    - '#eab308'
    - '#84cc16'
    - '#22c55e'
    - '#10b981'
    - '#14b8a6'
    - '#06b6d4'
    - '#0ea5e9'
    - '#3b82f6'
    - '#6366f1'
    - '#8b5cf6'
    - '#a855f7'
    - '#d946ef'
    - '#ec4899'
---
::

### `disabled` Disabled State

`disabled` prevents the popover from opening. The `input` trigger enters a read-only state while still displaying the current value:

::component-code
---
name: MColorChooser
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: '#6b7280'
  disabled: true
---
::

## Examples

### Inheriting Field Context

When placed inside `UFormField`, it inherits `size` and error state, and the trigger renders according to the form state:

::component-code
---
name: UFormField
prettier: true
props:
  label: Brand Color
  size: xs
  error: Example error state
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MColorChooser />
---
:m-color-chooser
::

### Inside `UFieldGroup`

When placed alongside a button inside `UFieldGroup`, they share size, border-radius, and border connection — ideal for inline color picking within a form:

::component-code
---
name: UFieldGroup
prettier: true
props:
  size: xs
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MColorChooser trigger="input" />
    <UButton icon="i-lucide-pipette" color="neutral" variant="subtle" />
---
:m-color-chooser{trigger="input"}
:u-button{color="neutral" variant="subtle" icon="i-lucide-pipette"}
::

### Custom Trigger Rendering

The `default` slot gives full control over the trigger appearance, while `open` and `value` slot props keep the popover state accessible:

::component-example
---
name: ComponentsColorChooserSlotExample
prettier: true
---
::

## API

### Props

:component-props{slug="MColorChooser"}

### Emits

:component-emits{slug="MColorChooser"}

### Slots

:component-slots{slug="MColorChooser"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
