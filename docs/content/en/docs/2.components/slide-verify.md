---
title: SlideVerify
description: A smooth slide-to-verify component.
category: advanced
seo:
  title: SlideVerify
  description: A smooth slide-to-verify component with configurable threshold, size and success feedback.
---

## Introduction

`MSlideVerify` is a slide-to-verify component with drag interaction and state transition animations. Built on `motion-v` for smooth transitions, it is suitable for form verification, sensitive operation confirmation, and similar scenarios.

::callout{color="neutral"}
Uses the [Motion](https://motion.dev/) animation library for drag interaction and state transition animations
::

## Usage

Hold and drag the slider to the right to reach the threshold and pass verification:

::component-code
---
name: MSlideVerify
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: false
---
::

### `threshold` Pass Threshold

`threshold` determines the drag ratio required to pass. Defaults to `0.9`. Lowering it relaxes the requirement:

::component-code
---
name: MSlideVerify
props:
  threshold: 0.5
  text: Drag halfway to pass
---
::

### `text` Hint Text

`text` sets the hint before verification; `successText` sets the text displayed after passing:

::component-code
---
name: MSlideVerify
props:
  text: Hold and drag right
  successText: Human verification passed
---
::

### `icon` Slider Icon

`icon` sets the icon before verification; `successIcon` sets the icon displayed after passing:

::component-code
---
name: MSlideVerify
props:
  icon: i-lucide-arrow-right
  successIcon: i-lucide-shield-check
---
::

### `size` Size

Use `size` to adjust the component size:

::component-code
---
name: MSlideVerify
props:
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `disabled` Disabled State

`disabled` freezes the slider. The cursor cannot drag and the unverified state is preserved:

::component-code
---
name: MSlideVerify
props:
  disabled: true
---
::

## Examples

### Inheriting Field Context

When placed inside `UFormField`, it receives field size and error state, and the slider renders according to the form state:

::component-code
---
name: UFormField
prettier: true
hide: ['class']
props:
  class: w-sm
  label: Slide Verification
  size: xs
  error: Example error state
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MSlideVerify />
---
:m-slide-verify
::

### Inside `UFieldGroup`

When combined with a reset button, they share the `UFieldGroup` size. The slider area and button maintain a unified height:

::component-code
---
name: UFieldGroup
prettier: true
hide: ['class']
props:
  class: w-sm
  size: xs
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MSlideVerify class="flex-1" />
    <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" />
---
:m-slide-verify{class="flex-1"}
:u-button{color="neutral" variant="subtle" icon="i-lucide-rotate-ccw"}
::

### Custom Slider Content

The `slider` slot takes over the slider's inner rendering. Read `verified` and `progress` to dynamically display progress:

::component-example
---
name: ComponentsSlideVerifySliderSlotExample
prettier: true
---
::

### Event Callbacks

Drag start fires `dragStart`. Releasing fires `dragEnd` with a success boolean. Reaching the threshold additionally fires `success`:

::component-example
---
name: ComponentsSlideVerifyEventsExample
prettier: true
---
::

## API

### Props

:component-props{slug="MSlideVerify"}

### Emits

:component-emits{slug="MSlideVerify"}

### Slots

:component-slots{slug="MSlideVerify"}

### Expose

You can access the typed component instance via [`useTemplateRef`](https://vuejs.org/api/composition-api-helpers.html#usetemplateref).

| Name | Type |
| ---- | ---- |
| `reset()`{lang="ts-type"} | `Promise<void>`{lang="ts-type"} <br> <div class="text-toned mt-1"><p>Reset the verification state</p> |

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/slide-verify"}
