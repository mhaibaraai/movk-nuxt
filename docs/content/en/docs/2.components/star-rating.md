---
title: StarRating
description: An interactive star rating component.
category: advanced
seo:
  title: StarRating
  description: An interactive star rating component supporting half stars, custom icons, colors, readonly and clearable states.
---

## Introduction

`MStarRating` is a feature-rich star rating component. It supports full and half-star ratings, readonly display, custom total stars and icons, keyboard interaction, badge display, and highlighted focus state.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/button"}
Built on Nuxt UI's Button and Badge components
::

## Usage

Default 5-star rating system. Click a star to write to v-model:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 3
---
::

### `allowHalf` Half-Star Rating

`allowHalf` allows each star to take a half value. Clicking the left or right half records `.5` or a whole number rating respectively:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 3.5
  allowHalf: true
---
::

### `clearable` Clearable

`clearable` allows clicking the current value again or pressing Backspace to reset the rating to zero — useful for optional fields:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 2.5
  allowHalf: true
  clearable: true
---
::

### `readonly` Readonly Mode

`readonly` displays the rating visually without allowing interaction — used for review and result display:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 4
  readonly: true
---
::

### `max` Total Stars

`max` adjusts the number of stars to support finer-grained rating scales:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 5
  max: 7
---
::

### `emptyIcon` Rating Icons

`emptyIcon`, `filledIcon`, and `halfIcon` can replace the default icons entirely. Use with `allowHalf` to render half values:

::component-code
---
name: MStarRating
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 2.5
  allowHalf: true
  emptyIcon: i-lucide-heart
  filledIcon: i-lucide-heart
  halfIcon: i-lucide-heart-handshake
---
::

### `showBadge` Rating Badge

`showBadge` shows the current score badge by default. Set to `false` to show only the stars:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 3
  showBadge: false
---
::

### `color` Color

`color` sets the color of selected stars and the badge:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 4
  color: primary
items:
  color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

### `highlight` Highlight Focus

`highlight` adds a ring-style highlight to the rating control to emphasize the currently interactive item:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 3
  highlight: true
---
::

### `buttonProps` Button Properties

`buttonProps` is passed to each star's button, allowing uniform adjustment of variant, padding, and other underlying styles:

::component-code
---
name: MStarRating
prettier: true
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 3
  buttonProps:
    variant: soft
    size: xs
items:
  buttonProps.variant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
  buttonProps.size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `disabled` Disabled State

`disabled` prevents interaction and reduces opacity simultaneously:

::component-code
---
name: MStarRating
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 4
  disabled: true
---
::

## Examples

### Inheriting Field Context

When placed inside `UFormField`, it receives field size and error state, and rating icons update with the form state:

::component-code
---
name: UFormField
prettier: true
props:
  label: Satisfaction
  size: xs
  error: Example error state
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MStarRating />
---
:m-star-rating
::

### Inside `UFieldGroup`

When placed alongside a reset button inside `UFieldGroup`, they share size — suitable for combining actions in compact form rows:

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

    <MStarRating />
    <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="subtle" />
---
:m-star-rating
:u-button{color="neutral" variant="subtle" icon="i-lucide-rotate-ccw"}
::

### Event Callbacks

Click, hover, and keyboard interactions fire `update:modelValue`, `change`, and `hover` in sequence:

::component-example
---
name: ComponentsStarRatingEventsExample
prettier: true
---
::

### Custom Slots

Add prefix, suffix, or a custom badge via slots:

::component-example
---
name: ComponentsStarRatingSlotExample
prettier: true
---
::

## Keyboard Navigation

The component supports full keyboard interaction for improved accessibility:

- **Arrow keys**: `←` `→` `↑` `↓` increment/decrement the rating (supports half-star stepping)
- **Shortcuts**: `Home` sets the minimum rating, `End` sets the maximum rating
- **Number keys**: `0-9` jump directly to the corresponding rating
- **Clear keys**: `Backspace` / `Delete` clear the rating (requires `clearable` to be enabled)

::callout{color="primary" icon="i-lucide-keyboard"}
The component follows WCAG accessibility guidelines, including complete ARIA attributes and keyboard focus management
::

## API

### Props

:component-props{slug="MStarRating"}

### Emits

:component-emits{slug="MStarRating"}

### Slots

:component-slots{slug="MStarRating"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
