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

::component-code
---
name: MAsPhoneNumberInput
external: ['modelValue']
hide: ['modelValue']
props:
  modelValue: ''
---
::

### `dialCode` 区号

通过 `dialCode` 在输入框前展示国家或地区区号：

::component-code
---
name: MAsPhoneNumberInput
props:
  dialCode: '+1'
items:
  dialCode: ['+86', '+1', '+44', '+81']
---
::

### `mask` 掩码

通过 `mask` 适配不同国家的号码格式，`#` 代表数字占位符：

::component-code
---
name: MAsPhoneNumberInput
props:
  mask: '(###) ###-####'
items:
  mask: ['### #### ####', '(###) ###-####', '#### ### ####', '###-####-####']
---
::

## 示例

### 融入分组控件

与按钮置于 `UFieldGroup` 时共用尺寸、圆角和边框衔接，适合组合拨号操作：

::component-code
---
name: UFieldGroup
prettier: true
props:
  size: xs
items:
  size: ['xs', 'sm', 'md', 'lg', 'xl']
slots:
  default: |

    <MAsPhoneNumberInput dial-code="+1" />
    <UButton icon="i-lucide-phone-call" color="neutral" variant="subtle" />
---
:m-as-phone-number-input{dial-code="+1"}
:u-button{color="neutral" variant="subtle" icon="i-lucide-phone-call"}
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
