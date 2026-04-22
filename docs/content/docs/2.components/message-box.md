---
title: MessageBox
description: 模态消息对话框，支持六种语义类型，提供声明式与编程式两种调用方式
category: feedback
---

## 简介

`MMessageBox` 是一个模态对话框组件，适用于重要通知或需要用户明确确认的场景。提供 `alert` 和 `confirm` 两种模式，内置六种语义化类型（primary / info / success / warning / error / neutral），并支持通过 `useMessageBox()` 进行编程式调用。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/modal"}
基于 Nuxt UI 的 Modal 组件封装
::

## Alert 模式

`alert` 模式仅提供确认按钮，适用于通知类提示。通过 `v-model:open` 控制显隐，关闭时触发 `@close` 事件：

::component-example
---
name: 'components-message-box-alert-example'
---
::

## Confirm 模式

`confirm` 模式提供取消和确认两个按钮，`@close` 接收 `confirmed: boolean` 参数区分用户操作：

::component-example
---
name: 'components-message-box-confirm-example'
---
::

## 六种语义类型

通过 `type` 属性设置语义化类型，影响标题图标与确认按钮的默认颜色。同时支持切换 `mode` 预览不同模式：

::component-example
---
name: 'components-message-box-types-example'
options:
  - name: 'type'
    label: 'type'
    items:
      - 'primary'
      - 'info'
      - 'success'
      - 'warning'
      - 'error'
      - 'neutral'
    default: 'primary'
  - name: 'mode'
    label: 'mode'
    items:
      - 'alert'
      - 'confirm'
    default: 'alert'
---
::

## 自定义图标

通过 `icon` 属性覆盖各 type 的默认图标，传入任意 Iconify 图标名称：

::component-example
---
name: 'components-message-box-custom-icon-example'
---
::

## 自定义按钮

`confirmButton` 和 `cancelButton` 接受完整的 `ButtonProps`，可覆盖颜色、文案、图标等所有按钮属性：

::component-example
---
name: 'components-message-box-custom-button-example'
---
::

## 布局与样式定制

- `close-icon`：覆盖右上角关闭按钮的图标
- `ui.footer`：控制底部按钮区域的对齐方式（默认 `justify-end`）
- `dismissible`：设为 `true` 时允许点击遮罩层或按 Esc 关闭（默认 `false`）

::component-example
---
name: 'components-message-box-ui-example'
---
::

## 自定义正文内容

使用默认插槽可替代 `description` prop，插入任意富文本内容：

::component-example
---
name: 'components-message-box-slot-example'
---
::

## 编程式用法

使用 `useMessageBox()` 在任意逻辑中调用对话框，无需在模板中声明组件。`alert()` 返回 `Promise<void>`，`confirm()` 返回 `Promise<boolean>`：

::component-example
---
name: 'components-message-box-programmatic-example'
---
::

## API

### Props

:component-props{slug="MMessageBox"}

### Emits

:component-emits{slug="MMessageBox"}

### Slots

:component-slots{slug="MMessageBox"}

## Changelog

:commit-changelog{prefix="components"}
