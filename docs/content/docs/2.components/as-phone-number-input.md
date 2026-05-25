---
title: AsPhoneNumberInput
description: 带输入掩码格式化的电话号码输入框组件。
category: input
seo:
  title: AsPhoneNumberInput
  description: A phone number input with mask formatting and dial-code support, built on the Nuxt UI input.
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
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
  - name: 'mask'
    label: 'mask'
    items: ['### #### ####', '(###) ###-####', '#### ### ####', '###-####-####']
    default: '### #### ####'
  - name: 'dialCode'
    label: 'dialCode'
    items: ['+86', '+1', '+44', '+81']
    default: '+86'
---
::

## 带区号

通过 `dialCode` 展示区号前缀，配合自定义掩码使用：

::component-example
---
name: 'components-as-phone-number-input-dial-code-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
  - name: 'dialCode'
    label: 'dialCode'
    items: ['+86', '+1', '+44', '+81']
    default: '+1'
  - name: 'mask'
    label: 'mask'
    items: ['### #### ####', '(###) ###-####', '#### ### ####', '###-####-####']
    default: '(###) ###-####'
---
::

## 自定义掩码

通过 `mask` prop 适配不同国家的号码格式：

::component-example
---
name: 'components-as-phone-number-input-mask-example'
options:
  - name: 'size'
    label: 'size'
    items: ['xs', 'sm', 'md', 'lg', 'xl']
    default: 'md'
  - name: 'mask'
    label: 'mask'
    items: ['### #### ####', '(###) ###-####', '#### ### ####', '###-####-####']
    default: '(###) ###-####'
  - name: 'dialCode'
    label: 'dialCode'
    items: ['+86', '+1', '+44', '+81']
    default: '+1'
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

## Theme

:component-theme

## Changelog

:commit-changelog{prefix="components/input"}
