---
title: WithPasswordToggle
description: 带显示/隐藏切换的密码输入框组件
---

## 简介

`MWithPasswordToggle` 是一个带有显示/隐藏切换功能的密码输入框组件。提供眼睛图标按钮，点击可在明文和密文之间切换显示，提升密码输入的用户体验。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装
::

## 基础用法

最简单的密码切换输入框：

::component-example
---
name: 'components-with-password-toggle-basic-example'
collapse: true
props:
  class: 'px-4'
---
::

## 带图标

为密码框添加锁的图标：

::component-example
---
name: 'components-with-password-toggle-icon-example'
collapse: true
props:
  class: 'px-4'
---
::

## 登录表单

结合表单字段使用：

::component-example
---
name: 'components-with-password-toggle-login-example'
collapse: true
props:
  class: 'px-4'
---
::

## 不同尺寸

支持多种尺寸：

::component-example
---
name: 'components-with-password-toggle-size-example'
collapse: true
props:
  class: 'px-4'
---
::

## 自定义按钮

通过 `buttonProps` 自定义切换按钮样式：

::component-example
---
name: 'components-with-password-toggle-custom-example'
collapse: true
props:
  class: 'px-4'
---
::

## API

### Props

继承自 [UInput](https://ui.nuxt.com/docs/components/input#props) 的所有属性（除了 `type`），并扩展：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `buttonProps` | `ButtonProps` | - | 自定义切换按钮的属性 |

::note
`type` 属性被组件内部管理，会在 `'password'` 和 `'text'` 之间自动切换。
::

### Emits

继承自 [UInput](https://ui.nuxt.com/docs/components/input#emits) 的所有事件。

### Slots

继承 UInput 的所有插槽，除了 `trailing` 插槽（被切换按钮占用）。

## 无障碍支持

组件内置了完善的无障碍支持：

- `aria-label`: 根据状态显示 "Show password" 或 "Hide password"
- `aria-pressed`: 指示按钮的按下状态
- 兼容屏幕阅读器的状态切换提示

## 使用场景

- **登录/注册表单**：用户输入密码时可以切换查看
- **修改密码**：确认新密码时避免输入错误
- **安全设置**：设置 API 密钥等敏感信息时提供可见性选项
- **密码确认**：在需要二次确认密码的场景下提升体验
