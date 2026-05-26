---
title: MessageBox
description: 模态消息对话框，提供声明式与编程式两种调用方式。
category: feedback
seo:
  title: MessageBox
  description: A modal message dialog component, offering both declarative and programmatic (alert/confirm) usage.
---

## 简介

`MMessageBox` 是一个模态对话框组件，适用于重要通知或需要用户明确确认的场景。提供 `alert` 与 `confirm` 两种模式，内置六种语义化类型，并支持通过 `useMessageBox()` 进行编程式调用。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/modal"}
基于 Nuxt UI 的 Modal 组件封装
::

## 用法

`default` 插槽放置触发元素，组件内部由 `UModal` 自动管理打开状态：

::component-code
---
name: MMessageBox
prettier: true
props:
  title: 提交保存
  description: 点击「知道了」关闭弹窗。
slots:
  default: |

    <UButton label="打开" />
---
:u-button{label="打开"}
::

### `mode` 模式

`alert` 仅显示确认按钮，`confirm` 同时提供取消与确认并返回布尔结果：

::component-code
---
name: MMessageBox
prettier: true
hide: ['title', 'description']
props:
  mode: confirm
  title: 提示与确认模式
  description: 切换 mode 观察模式变化。
items:
  mode: ['alert', 'confirm']
slots:
  default: |

    <UButton label="打开" color="neutral" variant="subtle" />
---
:u-button{label="打开" color="neutral" variant="subtle"}
::

### `type` 类型

`type` 影响默认图标与确认按钮颜色，包含六种语义化值：

::component-code
---
name: MMessageBox
prettier: true
hide: ['title', 'description']
props:
  type: primary
  mode: confirm
  title: 语义确认
  description: 切换 type 观察图标与确认按钮颜色变化。
items:
  type: ['primary', 'info', 'success', 'warning', 'error', 'neutral']
  mode: ['alert', 'confirm']
slots:
  default: |

    <UButton label="打开" color="neutral" variant="subtle" />
---
:u-button{label="打开" color="neutral" variant="subtle"}
::

### `icon` 图标

`icon` 覆盖 `type` 默认图标，传入任意 Iconify 图标名称：

::component-code
---
name: MMessageBox
prettier: true
hide: ['title', 'type']
props:
  icon: i-lucide-rocket
  type: success
  title: 部署完成
slots:
  default: |

    <UButton variant="soft" color="success" label="部署完成" />
---
:u-button{variant="soft" color="success" label="部署完成"}
::

### `label` 文案

`alertConfirmLabel` 控制 `alert` 模式按钮文案，`confirmLabel` 与 `cancelLabel` 分别覆盖 `confirm` 模式的两个按钮：

::component-code
---
name: MMessageBox
prettier: true
hide: ['title']
props:
  mode: confirm
  title: 确认接受服务协议
  alert-confirm-label: 我已知晓
  confirm-label: 我同意
  cancel-label: 我不同意
items:
  mode: ['alert', 'confirm']
slots:
  default: |

    <UButton variant="outline" label="文案覆盖" />
---
:u-button{variant="outline" label="文案覆盖"}
::

### `buttonProps` 按钮属性

`confirmButton` 与 `cancelButton` 接收完整 `ButtonProps`，可定制 icon、color、variant 与 label：

::component-code
---
name: MMessageBox
prettier: true
hide: ['title', 'mode']
props:
  title: 继续后续流程
  mode: confirm
  confirmButton:
    label: 继续
    icon: i-lucide-arrow-right
    color: info
  cancelButton:
    label: 取消
    variant: ghost
slots:
  default: |

    <UButton variant="outline" label="按钮属性" />
---
:u-button{variant="outline" label="按钮属性"}
::

### `dismissible` 关闭策略

`dismissible` 默认为 `false` 严格模式；开启后允许点击遮罩或按 Esc 关闭，并通过 `close(false)` 标记为未确认：

::component-code
---
name: MMessageBox
prettier: true
hide: ['title']
props:
  title: 严格确认高风险操作
  dismissible: true
items:
  dismissible: [true, false]
slots:
  default: |

    <UButton variant="outline" color="neutral" label="关闭策略" />
---
:u-button{variant="outline" color="neutral" label="关闭策略"}
::

## 示例

### 受控状态

通过 `v-model:open` 外部控制开关，适合编程式触发与多按钮联动：

::component-example
---
name: ComponentsMessageBoxControlledExample
---
::

### 正文插槽

`body` 插槽渲染富文本正文，slot 参数 `close` 可在正文内主动关闭弹窗：

::component-example
---
name: ComponentsMessageBoxBodySlotExample
---
::

### 标题插槽

`title` 插槽完全接管标题区，覆盖默认的图标加文本组合：

::component-example
---
name: ComponentsMessageBoxTitleSlotExample
---
::

### 描述插槽

`description` 插槽支持富文本描述，可与 `title` prop 配合工作：

::component-example
---
name: ComponentsMessageBoxDescriptionSlotExample
---
::

### 头部插槽

`header` 插槽完整接管 title 与 description 容器，可自定义布局与排版：

::component-example
---
name: ComponentsMessageBoxHeaderSlotExample
---
::

### 操作插槽

`footer` 插槽完全接管按钮区，slot 参数 `close` 用于关闭弹窗：

::component-example
---
name: ComponentsMessageBoxFooterSlotExample
---
::

### 关闭按钮插槽

`close` 插槽自定义右上角关闭按钮，可改 icon、color 与样式：

::component-example
---
name: ComponentsMessageBoxCloseSlotExample
---
::

### 内容插槽

`content` 插槽替代 header / body / footer 的整体布局，适合极致定制场景：

::component-example
---
name: ComponentsMessageBoxContentSlotExample
---
::

### 命令式调用

使用 `useMessageBox()` 在任意逻辑中调用对话框，无需在模板中声明组件。`alert()` 返回 `Promise<void>`，`confirm()` 返回 `Promise<boolean>`：

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
