---
title: WithPasswordToggle
description: 带显示/隐藏切换的密码输入框组件
category: input
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
---
::

## 带图标

为密码框添加锁的图标：

::component-example
---
name: 'components-with-password-toggle-icon-example'
---
::

## 登录表单

结合表单字段使用：

::component-example
---
name: 'components-with-password-toggle-login-example'
---
::

## 不同尺寸

支持多种尺寸：

::component-example
---
name: 'components-with-password-toggle-size-example'
---
::

## 自定义按钮

通过 `buttonProps` 自定义切换按钮样式：

::component-example
---
name: 'components-with-password-toggle-custom-example'
---
::

## API

### Props

:component-props{slug="MWithPasswordToggle"}

### Emits

:component-emits{slug="MWithPasswordToggle"}

### Slots

:component-slots{slug="MWithPasswordToggle"}

## Changelog

:commit-changelog{prefix="/components/input"}
