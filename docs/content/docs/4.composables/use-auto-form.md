---
title: useAutoForm
description: 用于创建类型化 Zod Schema 和管理 AutoForm 控件的 composable。
---

## Usage

使用自动导入的 `useAutoForm` composable 创建类型化的 Zod Schema，为 [AutoForm](/docs/auto-form) 组件提供验证规则和控件配置。

```vue
<script setup lang="ts">
const { afz } = useAutoForm()

const schema = afz.object({
  username: afz.string('用户名不能为空'),
  email: afz.email('请输入有效的邮箱地址'),
  age: afz.number().min(18, '必须年满 18 岁')
})

const formData = ref()
</script>

<template>
  <MAutoForm v-model="formData" :schema="schema" />
</template>
```

- `useAutoForm` 返回增强的 Zod 工厂对象 `afz`，支持为 Schema 附加 AutoForm 元数据。
- 元数据会自动在 Zod 的链式调用中持久化（如 `.optional()`, `.nullable()`, `.default()` 等）。

::note
使用 `afz` 工厂创建的 Schema 会自动拦截 Zod 的克隆方法，确保元数据在链式调用时不会丢失。
::

## API

### useAutoForm()

`useAutoForm(controls?: AutoFormControls): UseAutoFormReturn`{lang="ts-type"}

创建 AutoForm 工厂和控件管理器。

#### Parameters

::field-group
  ::field{name="controls" type="AutoFormControls"}
  自定义控件映射对象，用于扩展或覆盖默认控件。

  ::collapsible
    ```ts
    const { afz } = useAutoForm({
      myCustomInput: defineControl({
        component: CustomInputComponent,
        controlProps: { class: 'w-full' }
      })
    })
    ```
  ::
  ::
::

#### Returns

::field-group
  ::field{name="afz" type="TypedZodFactory"}
  类型化的 Zod 工厂对象，用于创建带元数据的 Schema。
  ::

  ::field{name="defineControl" type="Function"}
  定义控件的辅助函数。
  ::

  ::field{name="DEFAULT_CONTROLS" type="Object"}
  默认控件映射对象。
  ::

  ::field{name="controls" type="Object"}
  传入的自定义控件映射。
  ::

  ::field{name="getAutoFormMetadata" type="Function"}
  从 Schema 中提取自定义元数据的工具函数。
  ::
::

### afz 工厂方法

#### 基础类型

::field-group
  ::field{name="afz.string()" type="(meta?: string | AutoFormMeta) => ZodString"}
  创建字符串类型 Schema，默认映射到 `UInput` 组件。
  ::

  ::field{name="afz.number()" type="(meta?: string | AutoFormMeta) => ZodNumber"}
  创建数字类型 Schema，默认映射到 `UInputNumber` 组件。
  ::

  ::field{name="afz.boolean()" type="(meta?: string | AutoFormMeta) => ZodBoolean"}
  创建布尔类型 Schema，默认映射到 `UCheckbox` 组件。
  ::

  ::field{name="afz.file()" type="(meta?: string | AutoFormMeta) => ZodFile"}
  创建文件类型 Schema，默认映射到 `UFileUpload` 组件。
  ::

  ::field{name="afz.calendarDate()" type="<T = CalendarDate>(meta?: string | AutoFormMeta) => ZodType<T>"}
  创建日期类型 Schema，默认映射到 `DatePicker` 组件。
  ::
::

#### Zod v4 专用验证

::field-group
  ::field{name="afz.email()" type="(meta?: string | AutoFormMeta) => ZodEmail"}
  创建 Email 验证 Schema。推荐使用此方法代替 `afz.string().email()`（已在 Zod v4 中弃用）。
  ::

  ::field{name="afz.url()" type="(meta?: string | AutoFormMeta) => ZodUrl"}
  创建 URL 验证 Schema。
  ::

  ::field{name="afz.uuid()" type="(meta?: string | AutoFormMeta) => ZodUuid"}
  创建 UUID 验证 Schema。
  ::
::

#### 集合类型

::field-group
  ::field{name="afz.array()" type="(schema: ZodType, overwrite?: AutoFormMeta) => ZodArray"}
  创建数组类型 Schema。
  ::

  ::field{name="afz.tuple()" type="(schemas: [ZodType, ...ZodType[]], overwrite?: AutoFormMeta) => ZodTuple"}
  创建元组类型 Schema。
  ::

  ::field{name="afz.enum()" type="(values: any, overwrite?: AutoFormMeta) => ZodEnum"}
  创建枚举类型 Schema，默认映射到 `USelect` 组件。
  ::
::

#### 对象类型

::field-group
  ::field{name="afz.object()" type="(shape: ZodRawShape, meta?: AutoFormMeta) => ZodObject"}
  创建标准对象 Schema。支持柯里化写法以获得更好的类型推断。

  ::collapsible
    ```ts
    // 推荐：柯里化写法（更好的类型推断）
    const schema = afz.object<MyType>()({
      field: afz.string()
    })

    // 也可以：直接传参
    const schema = afz.object({
      field: afz.string()
    })
    ```
  ::
  ::

  ::field{name="afz.looseObject()" type="(shape: ZodRawShape, meta?: AutoFormMeta) => ZodObject"}
  创建宽松对象 Schema（允许额外字段）。
  ::

  ::field{name="afz.strictObject()" type="(shape: ZodRawShape, meta?: AutoFormMeta) => ZodObject"}
  创建严格对象 Schema（不允许额外字段）。
  ::
::

#### 布局系统

::field-group
  ::field{name="afz.layout()" type="<C extends IsComponent>(config: AutoFormLayoutConfig<C>) => ZodType"}
  创建布局字段，用于在表单中插入布局组件（如 `UFormGrid`, `UCard` 等）。

  ::collapsible
    ```ts
    const schema = afz.object({
      $layout: afz.layout({
        component: 'UFormGrid',
        props: { columns: 2 }
      }),
      firstName: afz.string(),
      lastName: afz.string()
    })
    ```
  ::
  ::
::

### 元数据选项

元数据可以是字符串（仅错误消息）或对象：

::field-group
  ::field{name="type" type="string"}
  控件类型，如 `'textarea'`, `'switch'`, `'slider'` 等。
  ::

  ::field{name="label" type="string"}
  字段标签文本。
  ::

  ::field{name="description" type="string"}
  字段描述文本。
  ::

  ::field{name="placeholder" type="string"}
  输入框占位符。
  ::

  ::field{name="controlProps" type="object"}
  传递给控件组件的 props。
  ::

  ::field{name="error" type="string"}
  自定义错误消息。
  ::
::

```ts
// 简化写法：仅错误消息
afz.string('这个字段是必填的')

// 完整写法：带控件配置
afz.string({
  type: 'textarea',
  label: '个人简介',
  placeholder: '请输入个人简介',
  controlProps: { rows: 4 }
})
```

## 默认控件映射

| Schema 类型 | 默认控件 | 说明 |
|------------|---------|------|
| `string` | `UInput` | 文本输入框 |
| `number` | `UInputNumber` | 数字输入框 |
| `boolean` | `UCheckbox` | 复选框 |
| `enum` | `USelect` | 下拉选择 |
| `file` | `UFileUpload` | 文件上传 |
| `calendarDate` | `DatePicker` | 日期选择器 |

### 扩展控件类型

通过 `type` 元数据可以使用以下扩展控件：

- `switch` - 开关组件 (`USwitch`)
- `textarea` - 多行文本 (`UTextarea`)
- `slider` - 滑块 (`USlider`)
- `pinInput` - PIN 码输入 (`UPinInput`)
- `inputTags` - 标签输入 (`UInputTags`)
- `selectMenu` - 下拉菜单 (`USelectMenu`)
- `inputMenu` - 输入菜单 (`UInputMenu`)
- `checkboxGroup` - 复选框组 (`UCheckboxGroup`)
- `radioGroup` - 单选框组 (`URadioGroup`)
- `withClear` - 带清除按钮的输入框
- `withPasswordToggle` - 密码显示切换
- `withCopy` - 带复制按钮
- `withCharacterLimit` - 字符计数限制
- `colorChooser` - 颜色选择器
- `starRating` - 星级评分

## Example

以下是一个完整的使用示例：

```vue
<script setup lang="ts">
const { afz } = useAutoForm()

// 创建复杂表单 Schema
const schema = afz.object({
  // 基础信息布局
  $basicLayout: afz.layout({
    component: 'UFormGrid',
    props: { columns: 2 }
  }),
  firstName: afz.string('请输入名字'),
  lastName: afz.string('请输入姓氏'),

  // Email 使用 Zod v4 专用验证
  email: afz.email('请输入有效的邮箱地址'),

  // 使用自定义控件类型
  bio: afz.string({
    type: 'textarea',
    label: '个人简介',
    controlProps: { rows: 4 }
  }),

  // 带密码切换的输入框
  password: afz.string({
    type: 'withPasswordToggle',
    label: '密码',
    placeholder: '请输入密码'
  }).min(8, '密码至少 8 位'),

  // 开关控件
  newsletter: afz.boolean({
    type: 'switch',
    label: '订阅邮件通知'
  }),

  // 数字滑块
  age: afz.number({
    type: 'slider',
    label: '年龄',
    controlProps: { min: 18, max: 100 }
  }),

  // 地址信息卡片布局
  $addressLayout: afz.layout({
    component: 'UCard',
    props: {
      title: '地址信息',
      class: 'mt-4'
    }
  }),
  street: afz.string('请输入街道地址'),
  city: afz.string('请输入城市'),

  // 日期选择
  birthdate: afz.calendarDate('请选择出生日期')
})

const formData = ref()

async function handleSubmit() {
  console.log('提交数据：', formData.value)
}
</script>

<template>
  <MAutoForm
    v-model="formData"
    :schema="schema"
    @submit="handleSubmit"
  />
</template>
```

## Caveats

### Zod v4 规范

从 Zod v4 开始，某些字符串验证方法已被弃用。使用 `afz` 时应遵循以下规范：

```ts
// ✅ 推荐：使用专用函数
afz.email('请输入邮箱')
afz.url('请输入 URL')
afz.uuid('请输入 UUID')

// ❌ 避免：已弃用的写法
afz.string().email()
afz.string().url()
afz.string().uuid()
```

### 元数据持久化

使用 `afz` 工厂创建的 Schema 会自动拦截以下克隆方法，确保元数据不丢失：

- `.optional()` - 设为可选
- `.nullable()` - 允许 null
- `.default()` - 设置默认值
- `.describe()` - 添加描述
- `.meta()` - 添加元数据
- `.refine()` - 添加自定义验证
- `.transform()` - 添加转换函数

```ts
// 元数据会在链式调用中自动传递
const schema = afz.string({
  type: 'withClear',
  label: '用户名'
})
  .optional()      // 元数据保留
  .default('')     // 元数据保留
```

### 自定义控件注册

当使用自定义控件时，需要通过 `defineControl` 辅助函数定义：

```ts
const { afz, defineControl } = useAutoForm({
  myInput: defineControl({
    component: MyCustomInput,
    controlProps: { class: 'w-full' }
  })
})

// 现在可以在 Schema 中使用
const schema = afz.string({
  type: 'myInput',
  controlProps: { variant: 'outline' }
})
```
