# 参考文档：

  - [auto-form](https://www.shadcn-vue.com/docs/components/auto-form)
  - [nuxt-auto-form](https://nuxt-auto-form.norbiros.dev/)

# 重要

- 不需要考虑兼容性

# [已完成] 补充 defaultControls 的组件映射（date 使用 UCalendar）

- 优先级：component > type > zodType

# zod 配置

[已完成] label

- meta.label -> formField.label (函数时，内置参数 state: any)
- 未配置 -> 使用字段名称自动生成（camelCase -> "Camel Case"）
  ```ts
  z.object({
    nameValue: z.string(), // will be "Name Value"
  })
  ```

[已完成] description

- meta.description -> formField.description (函数时，内置参数 state: any)
- 优先级：meta.description > zod.describe -> formField.description

[已完成] required 默认值true

- meta.required -> formField.required (函数时，内置参数 state: any)
- zod.optional -> !formField.required

[已完成] default

- zod.default -> state.value[path]（组件初始化时自动设置）
  ```ts
  z.object({
    nameValue: z.string().default('default name'),
  })
  state.value = {
    nameValue: 'default name', // will be "default name"
  }
  ```

# 字对象 object 和数组 array 的组件处理方式
# 添加 submit 插槽及功能
# 思考如何动态控制字段是否渲染
# 思考如何动态控制组件布局
