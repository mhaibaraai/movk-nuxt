---
title: Popconfirm
description: 基于气泡弹出层的操作确认组件。
category: feedback
seo:
  title: Popconfirm
  description: A popover-based confirmation component for guarding actions, with async confirm and custom content.
---

## 简介

`MPopconfirm` 是一个气泡式确认组件，在用户执行危险或不可逆操作前弹出确认气泡。支持同步与异步确认回调，并完整透传 `UPopover` 的所有定位参数。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/popover"}
基于 Nuxt UI 的 Popover 组件封装
::

## 用法

`default` 插槽放置触发元素，点击后弹出确认气泡：

::component-code
---
name: MPopconfirm
prettier: true
props:
  title: 确认删除？
  description: 删除后数据将无法恢复。
slots:
  default: |

    <UButton label="删除记录" color="neutral" variant="outline" icon="i-lucide-trash" />
---
:u-button{label="删除记录" color="neutral" variant="outline" icon="i-lucide-trash"}
::

### `type` 类型

`type` 影响默认图标与确认按钮颜色，包含六种语义化值：

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description']
props:
  type: warning
  title: 语义确认
  description: 切换 type 观察图标与确认按钮颜色变化。
items:
  type: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
slots:
  default: |

    <UButton label="打开" color="neutral" variant="soft" />
---
:u-button{label="打开" color="neutral" variant="soft"}
::

### `icon` 图标

`icon` 覆盖 `type` 默认图标，传入任意 Iconify 图标名称：

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description']
props:
  type: error
  icon: i-lucide-trash-2
  title: 永久删除？
  description: 此操作不可撤销，数据将永久丢失。
items:
  type: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
slots:
  default: |

    <UButton label="危险操作" color="error" variant="soft" icon="i-lucide-alert-triangle" />
---
:u-button{label="危险操作" color="error" variant="soft" icon="i-lucide-alert-triangle"}
::

### `confirmButton` 确认按钮

`confirmButton` 接收完整 `ButtonProps`，可定制 label、color、icon、variant：

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description', 'type']
props:
  title: 永久删除？
  description: 此操作不可撤销，数据将永久丢失。
  confirmButton:
    color: error
    label: 确认删除
    icon: i-lucide-trash-2
items:
  confirmButton.color: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
slots:
  default: |

    <UButton label="删除记录" color="error" variant="soft" />
---
:u-button{label="删除记录" color="error" variant="soft"}
::

### `cancelButton` 取消按钮

`cancelButton` 接收 `ButtonProps` 或 `false`，传 `false` 时隐藏取消按钮以强制确认：

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description', 'type']
props:
  type: warning
  title: 强制确认
  description: 此操作无法取消，请确认后继续。
  cancelButton: false
items:
  cancelButton: [true, false]
slots:
  default: |

    <UButton label="强制执行" color="warning" variant="soft" />
---
:u-button{label="强制执行" color="warning" variant="soft"}
::

### `dismissible` 关闭策略

`dismissible` 默认为 `false` 严格模式；开启后允许点击遮罩或按 Esc 关闭气泡：

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description']
props:
  title: 严格确认高风险操作
  description: 关闭策略受 dismissible 控制。
  dismissible: false
items:
  dismissible: [true, false]
slots:
  default: |

    <UButton label="关闭策略" color="neutral" variant="outline" />
---
:u-button{label="关闭策略" color="neutral" variant="outline"}
::

### `arrow` 箭头

`arrow` 控制气泡指向触发器的箭头，默认开启：

::component-code
---
name: MPopconfirm
prettier: true
hide: ['title', 'description']
props:
  title: 箭头指示
  description: 切换 arrow 观察箭头开关。
  arrow: true
items:
  arrow: [true, false]
slots:
  default: |

    <UButton label="箭头开关" color="neutral" variant="subtle" />
---
:u-button{label="箭头开关" color="neutral" variant="subtle"}
::

## 示例

### 异步确认

`:on-confirm` 支持返回 `Promise`，期间确认按钮自动进入 loading 状态，成功后自动关闭弹层：

::component-example
---
name: ComponentsPopconfirmAsyncExample
prettier: true
---
::

### 正文插槽

使用 `body` 插槽插入任意内容，`description` 传空字符串可隐藏默认描述区：

::component-example
---
name: ComponentsPopconfirmSlotExample
prettier: true
---
::

### 样式定制

通过 `ui` 属性覆盖内部各区块的 class，支持 `title`、`description`、`footer`、`content` 等：

::component-example
---
name: ComponentsPopconfirmUiExample
---
::

### 弹出方向

透传 `content` 属性给底层 `UPopover`，支持 `top`、`bottom`、`left`、`right` 四个方向：

::component-example
---
name: ComponentsPopconfirmSideExample
---
::

### 错误处理

当 `onConfirm` 回调抛出异常时，弹层保持打开并触发 `@error` 事件，可在此处展示错误反馈：

::component-example
---
name: ComponentsPopconfirmErrorExample
---
::

### 事件回调

同步确认、取消、异步确认与异常依次触发 `confirm`、`cancel` 与 `error`：

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
