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

### 插槽定制

通过 `body`、`title`、`description`、`header`、`footer`、`close` 或 `content` 替换对应区域；带操作的插槽使用 Nuxt UI Modal 提供的 `close()` 关闭弹层。切换区域分别查看：

::component-example
---
name: ComponentsMessageBoxSlotsExample
options:
  - name: section
    label: section
    items: ['body', 'title', 'description', 'header', 'footer', 'close', 'content']
    default: body
---
::

## useMessageBox

### 简介

`useMessageBox` 提供命令式弹窗 API，无需在模板中声明组件即可弹出对话框。它基于 [`MessageBox`](/docs/components/message-box) 组件与 Nuxt UI 的 `useOverlay` 实现。

```ts
const { alert, confirm } = useMessageBox()
```

两个方法的入参均为 `MessageBox` 的 props（`mode` 由方法自动设置）：`title`、`description`、`type`、`icon`、按钮配置等，详见组件文档。

### alert

`alert(options)` 弹出仅含确认动作的提示框，返回 Promise，用户关闭后才 resolve，适合阻塞式提示：

```ts
const { alert } = useMessageBox()

async function onSave() {
  await save()
  await alert({ type: 'success', title: '保存成功' })
  // 用户关闭弹窗后继续
}
```

### confirm

`confirm(options)` 返回 `Promise<boolean>`，把确认/取消映射为布尔值：

```ts
const { confirm } = useMessageBox()

async function onDelete() {
  const ok = await confirm({
    type: 'warning',
    title: '删除确认',
    description: '该操作不可恢复，确定继续？'
  })
  if (!ok) return
  await remove()
}
```

### 异步确认流程

`confirm` 适合串联异步流程——确认后再执行耗时任务：

::tip{icon="i-lucide-message-square" to="/docs/components/message-box"}
声明式用法与完整 props 见 MessageBox 组件文档。
::

## 命令式调用示例

选择提示、确认或确认后执行异步任务，观察 Promise 完成后的结果：

::component-example
---
name: ComponentsMessageBoxProgrammaticExample
options:
  - name: mode
    label: mode
    items: ['alert', 'confirm', 'async']
    default: confirm
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
