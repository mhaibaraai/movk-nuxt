---
title: MessageBox
description: A modal message dialog offering both declarative and programmatic usage.
category: feedback
seo:
  title: MessageBox
  description: A modal message dialog component, offering both declarative and programmatic (alert/confirm) usage.
---

## Introduction

`MMessageBox` is a modal dialog component designed for important notifications or scenarios requiring explicit user confirmation. It offers `alert` and `confirm` modes, six built-in semantic types, and programmatic invocation via `useMessageBox()`.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/modal"}
Built on Nuxt UI's Modal component
::

## Usage

Place the trigger element in the `default` slot. The component internally manages the open state via `UModal`:

::component-code
---
name: MMessageBox
prettier: true
props:
  title: Save Changes
  description: Click "Got it" to close the dialog.
slots:
  default: |

    <UButton label="Open" />
---
:u-button{label="Open"}
::

### `mode` Mode

`alert` shows only a confirm button; `confirm` provides both cancel and confirm buttons, returning a boolean result:

::component-code
---
name: MMessageBox
prettier: true
hide: ['title', 'description']
props:
  mode: confirm
  title: Alert and Confirm Modes
  description: Switch mode to observe the change.
items:
  mode: ['alert', 'confirm']
slots:
  default: |

    <UButton label="Open" color="neutral" variant="subtle" />
---
:u-button{label="Open" color="neutral" variant="subtle"}
::

### `type` Type

`type` affects the default icon and confirm button color, with six semantic values:

::component-code
---
name: MMessageBox
prettier: true
hide: ['title', 'description']
props:
  type: primary
  mode: confirm
  title: Semantic Confirmation
  description: Switch type to observe icon and button color changes.
items:
  type: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
  mode: ['alert', 'confirm']
slots:
  default: |

    <UButton label="Open" color="neutral" variant="subtle" />
---
:u-button{label="Open" color="neutral" variant="subtle"}
::

### `icon` Icon

`icon` overrides the default icon from `type`. Pass any Iconify icon name:

::component-code
---
name: MMessageBox
prettier: true
hide: ['title', 'type']
props:
  icon: i-lucide-rocket
  type: success
  title: Deployment Complete
slots:
  default: |

    <UButton variant="soft" color="success" label="Deployment Complete" />
---
:u-button{variant="soft" color="success" label="Deployment Complete"}
::

### `label` Button Labels

`alertConfirmLabel` controls the `alert` mode button label. `confirmLabel` and `cancelLabel` override the two buttons in `confirm` mode respectively:

::component-code
---
name: MMessageBox
prettier: true
hide: ['title']
props:
  mode: confirm
  title: Confirm Terms of Service
  alert-confirm-label: Acknowledged
  confirm-label: I Agree
  cancel-label: I Disagree
items:
  mode: ['alert', 'confirm']
slots:
  default: |

    <UButton variant="outline" label="Custom Labels" />
---
:u-button{variant="outline" label="Custom Labels"}
::

### `buttonProps` Button Properties

`confirmButton` and `cancelButton` accept full `ButtonProps`, allowing customization of icon, color, variant, and label:

::component-code
---
name: MMessageBox
prettier: true
hide: ['title', 'mode']
props:
  title: Continue Process
  mode: confirm
  confirmButton:
    label: Continue
    icon: i-lucide-arrow-right
    color: info
  cancelButton:
    label: Cancel
    variant: ghost
slots:
  default: |

    <UButton variant="outline" label="Button Properties" />
---
:u-button{variant="outline" label="Button Properties"}
::

### `dismissible` Close Strategy

`dismissible` defaults to `false` (strict mode). When enabled, clicking the overlay or pressing Esc closes the dialog and marks it as unconfirmed via `close(false)`:

::component-code
---
name: MMessageBox
prettier: true
hide: ['title']
props:
  title: Strict Confirmation for High-Risk Operations
  dismissible: true
items:
  dismissible: [true, false]
slots:
  default: |

    <UButton variant="outline" color="neutral" label="Close Strategy" />
---
:u-button{variant="outline" color="neutral" label="Close Strategy"}
::

## Examples

### Controlled State

Use `v-model:open` to control the open state externally — ideal for programmatic triggering and multi-button coordination:

::component-example
---
name: ComponentsMessageBoxControlledExample
---
::

### Body Slot

The `body` slot renders rich text content. The `close` slot parameter allows programmatically closing the dialog from within the body:

::component-example
---
name: ComponentsMessageBoxBodySlotExample
---
::

### Title Slot

The `title` slot fully takes over the title area, replacing the default icon-plus-text combination:

::component-example
---
name: ComponentsMessageBoxTitleSlotExample
---
::

### Description Slot

The `description` slot supports rich text descriptions and works alongside the `title` prop:

::component-example
---
name: ComponentsMessageBoxDescriptionSlotExample
---
::

### Header Slot

The `header` slot fully takes over the title and description container, enabling custom layout and typography:

::component-example
---
name: ComponentsMessageBoxHeaderSlotExample
---
::

### Footer Slot

The `footer` slot fully takes over the button area. The `close` slot parameter is used to close the dialog:

::component-example
---
name: ComponentsMessageBoxFooterSlotExample
---
::

### Close Button Slot

The `close` slot customizes the top-right close button — change icon, color, and styles:

::component-example
---
name: ComponentsMessageBoxCloseSlotExample
---
::

### Content Slot

The `content` slot replaces the entire header / body / footer layout — ideal for fully custom scenarios:

::component-example
---
name: ComponentsMessageBoxContentSlotExample
---
::

### Programmatic Usage

Use `useMessageBox()` to invoke dialogs from any logic without declaring the component in templates. `alert()` returns `Promise<void>`, and `confirm()` returns `Promise<boolean>`:

::component-example
---
name: ComponentsMessageBoxProgrammaticExample
prettier: true
---
::

## API

### Props

:component-props{slug="MMessageBox"}

### Emits

:component-emits{slug="MMessageBox"}

### Slots

:component-slots{slug="MMessageBox"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
