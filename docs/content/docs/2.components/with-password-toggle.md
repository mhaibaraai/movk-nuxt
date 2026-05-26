---
title: WithPasswordToggle
description: 带显示/隐藏切换的密码输入框组件。
category: input
seo:
  title: WithPasswordToggle
  description: A password input with a show/hide visibility toggle, built on the Nuxt UI input.
---

## 简介

`MWithPasswordToggle` 是一个带有显示/隐藏切换功能的密码输入框组件。提供眼睛图标按钮，点击可在明文和密文之间切换显示，提升密码输入的用户体验。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装
::

## 用法

右侧眼睛按钮在明文与密文间切换：

::component-code
---
name: MWithPasswordToggle
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: 'hide-me'
---
::

### `leadingIcon` 前置图标

通过 `leadingIcon` 为密码框添加语义化图标：

::component-code
---
name: MWithPasswordToggle
props:
  leadingIcon: i-lucide-lock
---
::

### `size` 尺寸

通过 `size` 切换输入框与按钮尺寸：

::component-code
---
name: MWithPasswordToggle
props:
  modelValue: Test@123
  size: md
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
---
::

### `buttonProps` 切换按钮

通过 `buttonProps` 自定义切换按钮样式：

::component-code
---
name: MWithPasswordToggle
prettier: true
props:
  modelValue: SecurePass123
  buttonProps:
    color: primary
    variant: soft
items:
  buttonProps.color: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
  buttonProps.variant: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']
---
::

## API

### Props

:component-props{slug="MWithPasswordToggle"}

### Emits

:component-emits{slug="MWithPasswordToggle"}

### Slots

:component-slots{slug="MWithPasswordToggle"}

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
