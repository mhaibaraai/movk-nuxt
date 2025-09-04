# AutoForm 组件开发文档

## 目标

使用 Nuxt UI V4 的 UForm 组件，实现一个自动表单组件。主要参考 shadcn-vue/auto-form 组件库。

## 参考文档

- [Nuxt UI](https://ui4.nuxt.com/)
- [zod](https://zod.dev/)
- [shadcn-vue/auto-form](https://www.shadcn-vue.com/docs/components/auto-form)
- [unovue/shadcn-vue](https://github.com/unovue/shadcn-vue)
- [Norbiros/nuxt-auto-form](https://github.com/Norbiros/nuxt-auto-form)

## 总体架构

- 对 zod schema 做“类型遍历 + 元信息提取”，生成字段树；通过“字段→输入组件”映射渲染 UI，并将 zod 校验结果回填到对应字段的错误展示。
- 类型推断与组件映射可使用 type 属性指定表单类型 (Nuxt UI V4 的 UForm 组件)，例如：type="UCheckbox"

### 目标范围

- 仅支持 zod
- 需要支持嵌套对象、数组、枚举、联合、可选与默认值
- 通过 type 属性指定表单类型 (Nuxt UI V4 的 UForm 组件)
  - UCheckbox
  - UCheckboxGroup
  - UColorPicker
  - UFileUpload
  - UInput
  - UInputNumber
  - UInputTags
  - UPinInput
  - URadioGroup
  - USelect
  - USelectMenu
  - USlider
  - USwitch
  - UTextarea
  - ... （其他未列出的组件，后续是可以根据 Nuxt UI 的更新，逐步支持）
