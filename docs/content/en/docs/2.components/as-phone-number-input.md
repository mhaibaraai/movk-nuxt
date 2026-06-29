---
title: AsPhoneNumberInput
description: A phone number input component with mask formatting.
category: input
seo:
  title: AsPhoneNumberInput
  description: A phone number input with mask formatting and dial-code support, built on the Nuxt UI input.
---

## Introduction

`MAsPhoneNumberInput` is a phone number input component that automatically formats numbers through input masks, supporting custom masks and dial-code prefix display.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
Built on Nuxt UI's Input component, using [maska](https://beholdr.github.io/maska/) for input masking
::

## Usage

`#` represents a digit placeholder. The default mask is `### #### ####` with dial code `+86` (China mainland format).

::component-code
---
name: MAsPhoneNumberInput
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
---
::

### `dialCode` Dial Code

Use `dialCode` to display a country or region dial code in front of the input:

::component-code
---
name: MAsPhoneNumberInput
props:
  dialCode: '+1'
items:
  dialCode: ['+86', '+1', '+44', '+81']
---
::

### `mask` Mask

Use `mask` to adapt number formats for different countries. `#` represents a digit placeholder:

::component-code
---
name: MAsPhoneNumberInput
props:
  mask: '(###) ###-####'
items:
  mask: ['### #### ####', '(###) ###-####', '#### ### ####', '###-####-####']
---
::

## Examples

### Inside `UFieldGroup`

When placed alongside a button inside `UFieldGroup`, they share size, border-radius, and border connection — ideal for combined dial operations:

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

    <MAsPhoneNumberInput dial-code="+1" />
    <UButton icon="i-lucide-phone-call" color="neutral" variant="subtle" />
---
:m-as-phone-number-input{dial-code="+1"}
:u-button{color="neutral" variant="subtle" icon="i-lucide-phone-call"}
::

## API

### Props

:component-props{slug="MAsPhoneNumberInput"}

### Emits

:component-emits{slug="MAsPhoneNumberInput"}

### Slots

:component-slots{slug="MAsPhoneNumberInput"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
