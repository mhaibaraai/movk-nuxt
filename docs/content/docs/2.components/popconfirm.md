---
title: Popconfirm
description: 基于气泡弹出层的操作确认组件
category: feedback
---

`MPopconfirm` 是一个气泡式确认组件，在用户执行危险或不可逆操作前弹出确认气泡。支持同步与异步确认回调，并完整透传 `UPopover` 的所有定位参数。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/popover"}
基于 Nuxt UI 的 Popover 组件封装
::

## 类型

通过 `type` 属性设置语义化颜色主题，影响标题图标和颜色：

::component-example
---
name: 'components-popconfirm-types-example'
---
::

## 基础用法

将触发元素放入默认 slot，通过 `:on-confirm` 传入确认回调，`@cancel` 监听取消事件：

::component-example
---
name: 'components-popconfirm-basic-example'
---
::

## 异步确认

`:on-confirm` 支持返回 `Promise`，期间确认按钮自动进入 loading 状态，成功后自动关闭弹层：

::component-example
---
name: 'components-popconfirm-async-example'
---
::

## 自定义外观

通过 `icon`、`confirmButton`、`cancelButton` 自定义图标和按钮：

::component-example
---
name: 'components-popconfirm-custom-example'
---
::

## 禁用取消按钮

`:cancel-button="false"` 隐藏取消按钮，强制用户完成确认：

::component-example
---
name: 'components-popconfirm-no-cancel-example'
---
::

## 错误处理

当 `onConfirm` 回调抛出异常时，弹层保持打开并触发 `@error` 事件，可在此处展示错误反馈：

::component-example
---
name: 'components-popconfirm-error-example'
---
::

## 自定义内容

使用 `body` slot 插入任意内容，`description` 传空字符串可隐藏默认描述区：

::component-example
---
name: 'components-popconfirm-slot-example'
---
::

## 样式定制

通过 `ui` 属性覆盖内部各区块的 class，支持 `title`、`description`、`footer`、`content` 等：

::component-example
---
name: 'components-popconfirm-ui-example'
---
::

## 弹出方向

透传 `content` 属性给底层 `UPopover`，支持 `top`、`bottom`、`left`、`right` 四个方向：

::component-example
---
name: 'components-popconfirm-side-example'
---
::

## API

### Props

:component-props{slug="MPopconfirm"}

### Emits

:component-emits{slug="MPopconfirm"}

### Slots

:component-slots{slug="MPopconfirm"}

## Changelog

:commit-changelog{prefix="components"}

## Theme

```ts [app.config.ts]
export default defineAppConfig({
  ui: {
    popconfirm: {
      slots: {
        content: 'p-4 flex flex-col gap-2',
        arrow: '',
        header: 'flex flex-col gap-1',
        title: 'flex gap-2 items-center text-sm text-highlighted font-semibold',
        description: 'text-muted text-xs',
        body: '',
        footer: 'mt-1 flex items-center justify-end gap-1.5'
      }
    }
  }
})
```
