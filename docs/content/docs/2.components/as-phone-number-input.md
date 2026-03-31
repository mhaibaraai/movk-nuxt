---
title: AsPhoneNumberInput
description: 带输入掩码格式化的电话号码输入框组件
category: input
---

## 简介

`MAsPhoneNumberInput` 是一个电话号码输入框组件，通过输入掩码自动格式化号码，支持自定义掩码和区号前缀展示。

::callout{color="neutral" to="https://ui.nuxt.com/docs/components/input"}
基于 Nuxt UI 的 Input 组件封装，使用 [maska](https://beholdr.github.io/maska/) 处理输入掩码
::

## 基础用法

`#` 代表数字占位符，默认掩码为 `### #### ####`、区号为 `+86`（中国大陆格式）。

::component-example
---
name: 'components-as-phone-number-input-basic-example'
---
::

## 带区号

通过 `dialCode` 展示区号前缀，配合自定义掩码使用：

::component-example
---
name: 'components-as-phone-number-input-dial-code-example'
---
::

## 自定义掩码

通过 `mask` prop 适配不同国家的号码格式：

::component-example
---
name: 'components-as-phone-number-input-mask-example'
---
::

## 表单场景

结合表单字段使用：

::component-example
---
name: 'components-as-phone-number-input-form-example'
---
::

## API

### Props

:component-props{slug="MAsPhoneNumberInput"}

### Emits

:component-emits{slug="MAsPhoneNumberInput"}

### Slots

:component-slots{slug="MAsPhoneNumberInput"}

## Changelog

:commit-changelog{prefix="components/input"}
