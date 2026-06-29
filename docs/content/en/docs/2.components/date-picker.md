---
title: DatePicker
description: An internationalized date picker component.
category: advanced
seo:
  title: DatePicker
  description: An internationalized date picker supporting single, range and multiple selection, presets and custom output formats.
---

## Introduction

`MDatePicker` is an internationalized date picker built on `@internationalized/date` for timezone and locale handling. It supports single date, date range, and multiple date selection, with button trigger, clearable, and quick preset interactions.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/calendar"}
Built on Nuxt UI's Calendar component
::

::note{to="https://react-spectrum.adobe.com/internationalized/date/index.html"}
Uses the `@internationalized/date` library for date handling, ensuring timezone safety and i18n support.
::

## Usage

The default button trigger displays the current date. Click to open the calendar panel and write the selected date to v-model:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
---
::

### `range` Date Range

`range` mode maintains `start` / `end` dates. `numberOfMonths` can display a dual-month calendar simultaneously:

::component-code
---
name: MDatePicker
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
  range: true
  numberOfMonths: 2
items:
  range: [true, false]
---
::

### `numberOfMonths` Number of Months

`numberOfMonths` controls the number of months displayed side by side in the popover, making cross-month selection easier:

::component-code
---
name: MDatePicker
props:
  numberOfMonths: 3
items:
  numberOfMonths: [1, 2, 3]
---
::

### `clearable` Clearable

`clearable` shows a clear entry when a value is set. Clicking it resets without opening the calendar:

::component-code
---
name: MDatePicker
props:
  clearable: true
---
::

### `presets` Quick Presets

Setting `presets` to `default` automatically generates quick items like "Today", "This Week", "This Month" based on the current mode:

::component-code
---
name: MDatePicker
hide: ['placeholder']
ignore: ['presets']
props:
  range: true
  presets: default
  placeholder: Select range
items:
  range: [true, false]
---
::

### `multiple` Multiple Date Selection

`multiple` mode saves multiple dates in an array. The button label can dynamically display the number of selected dates:

::component-code
---
name: MDatePicker
prettier: true
props:
  multiple: true
  buttonProps:
    label: Select multiple dates
    color: primary
items:
  multiple: [true, false]
  buttonProps.color: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
---
::

### `buttonProps` Trigger Button

`buttonProps` is passed to the trigger button, allowing adjustment of label, color, variant, and icon:

::component-code
---
name: MDatePicker
prettier: true
props:
  buttonProps:
    label: Select birthday
    color: primary
    variant: outline
    icon: i-lucide-cake
items:
  buttonProps.color: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
  buttonProps.variant: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
---
::

## Examples

### Inheriting Field Context

When placed inside `UFormField`, it inherits `size` and error state, and the trigger button renders according to the form state:

::component-code
---
name: UFormField
prettier: true
props:
  label: Appointment Date
  size: xs
  error: Example error state
slots:
  default: |

    <MDatePicker />
---
:m-date-picker
::

### Inside `UFieldGroup`

When placed alongside a button inside `UFieldGroup`, they share size and border connection — ideal for filter bars with shortcut actions:

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

    <MDatePicker />
    <UButton icon="i-lucide-calendar-check" color="neutral" variant="subtle" />
---
:m-date-picker
:u-button{color="neutral" variant="subtle" icon="i-lucide-calendar-check"}
::

### Constraining Selectable Date Boundaries

`minValue` and `maxValue` disable dates outside the boundary, restricting selection to future or past dates respectively:

::component-example
---
name: ComponentsDatePickerValidationExample
---
::

### Disabling Dates by Rule

`isDateUnavailable` disables dates according to business rules (e.g., weekends as shown in the example):

::component-example
---
name: ComponentsDatePickerUnavailableExample
---
::

### Custom Trigger Button Label

`labelFormat` receives formatting utilities and the current value to combine date and weekday info into the button label:

::component-example
---
name: ComponentsDatePickerFormatExample
---
::

### Custom Quick Presets

Passing an array to `presets` allows business-rule-based date returns. Each item's `value` is a function that receives a `formatter`:

::component-example
---
name: ComponentsDatePickerPresetsExample
---
::

## API

### Props

:component-props{slug="MDatePicker"}

### Emits

:component-emits{slug="MDatePicker"}

### Slots

:component-slots{slug="MDatePicker"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
