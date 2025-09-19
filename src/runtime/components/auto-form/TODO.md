# 参考文档：

- [auto-form](https://www.shadcn-vue.com/docs/components/auto-form)
- [nuxt-auto-form](https://nuxt-auto-form.norbiros.dev/)

# 重要

- 不需要考虑兼容性

# [已完成] 补充 defaultControls 的组件映射（date 使用 UCalendar）

- 优先级：component > type > zodType

# zod 配置 FormField

```ts
z.string().meta({
  label: 'Name Value',
  description: 'Name Value',
  required: true,
  default: 'default name',
}).default('default name')
```

[已完成] label

- meta.label -> formField.label
- 未配置 -> 使用字段名称自动生成（camelCase -> "Camel Case"）
  ```ts
  z.object({
    nameValue: z.string(), // will be "Name Value"
  })
  ```

[已完成] description

- meta.description -> formField.description
- 优先级：meta.description > zod.describe -> formField.description

[已完成] required 默认值true

- meta.required -> formField.required
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

# 配置 Controls ， 构造函数参数

- if: boolean
- hidden: boolean
- type: string | keyof typeof DEFAULT_CONTROLS
- component: IsComponent
- props: ComponentProps<IsComponent>
- slots: ComponentSlots<IsComponent>

```ts
const { afz } = createAutoFormZ<State, typeof customControls>(customControls)
```

```ts
const { afz } = createAutoFormZ<State>()

afz.string({
  type: 'string',
  component: 'input',
  props: {
    class: 'w-md',
  },
  slots: {
    bbb: () => h('span', 'bbb'),
  },
})
```

[已完成] type

- meta.type -> formField.type
- 优先级：meta.type > control.type
- 组件初始化时自动设置

```ts
z.object({
  nameValue: z.string().meta({
    type: 'string',
  }),
})
```

[已完成] props、slots

- meta.props -> formField.props
- 优先级：meta.props > control.props
- 组件初始化时自动设置

```ts
z.object({
  nameValue: z.string({
    props: {
      class: 'w-md',
    },
  }),
})
```

# Scope API - 键约束的对象工厂

## 基础用法

```ts
const { afz, scope } = createAutoFormZ()
const s = scope<State>()  // State 是你的类型约束

// 三种对象工厂，行为差异：
const schema = s.object({...})        // strip: 允许额外键，解析时剥离
const schema = s.looseObject({...})   // loose: 允许额外键，解析时保留
const schema = s.strictObject({...})  // strict: 禁止额外键，解析时报错
```

## 键名提示与约束

- **参数侧键名提示**：`s.object({ /* 此处有 State 的键名提示 */ })`
- **提示性约束**：键约束作为智能提示，不阻止编译（避免 never）
- **形状推断**：参数类型完全由实参推断，保留字段补全

## 嵌套路径

```ts
interface State {
  name: string
  address: {
    city: string
    province: string
  }
}

const s = scope<State>()
const schema = s.object({
  name: afz.string(),
  address: s.path('address').object({  // 子作用域，有 city/province 提示
    city: afz.string(),
    province: afz.string(),
  }),
})

// 深层嵌套
const deep = s.path('address', 'geo', 'coordinates').object({...})
```

## 链式调用支持

```ts
const schema = s.looseObject({
  name: afz.string(),
  address: s.path('address').strictObject({
    city: afz.string(),
  }).optional(),
}).meta({
  label: '用户信息'
}).optional()

// 支持所有 Zod 方法：.optional(), .meta(), .default(), .nullable() 等
```

## 类型推断与补全

```ts
const schema = s.object({...})
type Input = z.input<typeof schema>  // 推荐使用，获得完整字段提示
// 避免使用 InferInput，在嵌套场景可能宽化为 Record<string, unknown>

const state = ref<z.input<typeof schema>>({
  name: '',        // 有提示
  address: {
    city: '',      // 有提示
    province: '',  // 有提示
  }
})
```

# 优化 AuthFormSlots 的类型 ✔️

参考以下类型代码：

```ts
type DynamicFieldSlots<T, F, SlotProps = { field: F, state: T }> = Record<string, (props: SlotProps) => any> & Record<`${keyof T extends string ? keyof T : never}-field`, (props: SlotProps) => any>
type DynamicFormFieldSlots<T> = Record<string, (props?: {}) => any> & Record<`${keyof T extends string ? keyof T : never}-${'label' | 'description' | 'hint' | 'help' | 'error'}`, (props?: {}) => any>
export type AuthFormSlots<T extends object = object, F extends AuthFormField = AuthFormField> = {
  header(props?: {}): any
  leading(props?: {}): any
  title(props?: {}): any
  description(props?: {}): any
  providers(props?: {}): any
  validation(props?: {}): any
  submit(props: { loading: boolean }): any
  footer(props?: {}): any
} & DynamicFieldSlots<T, F> & DynamicFormFieldSlots<T>
```

# field: any 的类型优化 ✔️

# buildSlotProps 的类型优化 ✔️

# 字对象 object 和数组 array 的组件处理方式

# 添加 submit 插槽及功能

# 思考如何动态控制字段是否渲染

# 思考如何动态控制组件布局
