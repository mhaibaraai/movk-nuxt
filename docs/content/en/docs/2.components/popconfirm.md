---
title: Popconfirm
description: A popover-based action confirmation component.
category: feedback
seo:
  title: Popconfirm
  description: A popover-based confirmation component for guarding actions, with async confirm and custom content.
---

## Introduction

`MPopconfirm` is a popover-style confirmation component that displays a confirmation bubble before users perform dangerous or irreversible actions. It supports both synchronous and asynchronous confirm callbacks, and fully passes through all `UPopover` positioning parameters.

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/popover"}
Built on Nuxt UI's Popover component
::

## Usage

Place the trigger element in the `default` slot. Clicking it opens the confirmation bubble:

::component-code
---
name: MPopconfirm
prettier: true
props:
  title: Confirm Delete?
  description: This action cannot be undone.
slots:
  default: |

    <UButton label="Delete Record" color="neutral" variant="outline" icon="i-lucide-trash" />
---
:u-button{label="Delete Record" color="neutral" variant="outline" icon="i-lucide-trash"}
::

### `type` Type

`type` affects the default icon and confirm button color, with six semantic values:

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description']
props:
  type: warning
  title: Semantic Confirmation
  description: Switch type to observe icon and button color changes.
items:
  type: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
slots:
  default: |

    <UButton label="Open" color="neutral" variant="soft" />
---
:u-button{label="Open" color="neutral" variant="soft"}
::

### `icon` Icon

`icon` overrides the default icon from `type`. Pass any Iconify icon name:

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description']
props:
  type: error
  icon: i-lucide-trash-2
  title: Permanently Delete?
  description: This action is irreversible and data will be permanently lost.
items:
  type: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
slots:
  default: |

    <UButton label="Dangerous Action" color="error" variant="soft" icon="i-lucide-alert-triangle" />
---
:u-button{label="Dangerous Action" color="error" variant="soft" icon="i-lucide-alert-triangle"}
::

### `confirmButton` Confirm Button

`confirmButton` accepts full `ButtonProps`, allowing customization of label, color, icon, and variant:

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description', 'type']
props:
  title: Permanently Delete?
  description: This action is irreversible and data will be permanently lost.
  confirmButton:
    color: error
    label: Confirm Delete
    icon: i-lucide-trash-2
items:
  confirmButton.color: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
slots:
  default: |

    <UButton label="Delete Record" color="error" variant="soft" />
---
:u-button{label="Delete Record" color="error" variant="soft"}
::

### `cancelButton` Cancel Button

`cancelButton` accepts `ButtonProps` or `false`. Passing `false` hides the cancel button to force confirmation:

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description', 'type']
props:
  type: warning
  title: Force Confirmation
  description: This action cannot be cancelled. Please confirm before continuing.
  cancelButton: false
items:
  cancelButton: [true, false]
slots:
  default: |

    <UButton label="Force Execute" color="warning" variant="soft" />
---
:u-button{label="Force Execute" color="warning" variant="soft"}
::

### `dismissible` Close Strategy

`dismissible` defaults to `false` (strict mode). When enabled, clicking the overlay or pressing Esc closes the bubble:

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description']
props:
  title: Strict Confirmation for High-Risk Operations
  description: Close strategy is controlled by dismissible.
  dismissible: false
items:
  dismissible: [true, false]
slots:
  default: |

    <UButton label="Close Strategy" color="neutral" variant="outline" />
---
:u-button{label="Close Strategy" color="neutral" variant="outline"}
::

### `arrow` Arrow

`arrow` controls the arrow pointing to the trigger. Enabled by default:

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description']
props:
  title: Arrow Indicator
  description: Toggle arrow to observe the switch.
  arrow: true
items:
  arrow: [true, false]
slots:
  default: |

    <UButton label="Arrow Toggle" color="neutral" variant="subtle" />
---
:u-button{label="Arrow Toggle" color="neutral" variant="subtle"}
::

## Examples

### Async Confirmation

`:on-confirm` supports returning a `Promise`. During execution, the confirm button enters a loading state and closes automatically on success:

::component-example
---
name: ComponentsPopconfirmAsyncExample
prettier: true
---
::

### Body Slot

Use the `body` slot to insert any content. Pass an empty string to `description` to hide the default description area:

::component-example
---
name: ComponentsPopconfirmSlotExample
prettier: true
---
::

### Style Customization

Override the class of internal sections via the `ui` prop, supporting `title`, `description`, `footer`, `content`, and more:

::component-example
---
name: ComponentsPopconfirmUiExample
---
::

### Popover Direction

Pass the `content` prop to the underlying `UPopover` to support `top`, `bottom`, `left`, and `right` placement:

::component-example
---
name: ComponentsPopconfirmSideExample
---
::

### Error Handling

When the `onConfirm` callback throws an exception, the popover remains open and fires the `@error` event where you can display error feedback:

::component-example
---
name: ComponentsPopconfirmErrorExample
---
::

### Event Callbacks

Synchronous confirm, cancel, async confirm, and exceptions fire `confirm`, `cancel`, and `error` in sequence:

::component-example
---
name: ComponentsPopconfirmEventsExample
---
::

## API

### Props

:component-props{slug="MPopconfirm"}

### Emits

:component-emits{slug="MPopconfirm"}

### Slots

:component-slots{slug="MPopconfirm"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components"}
