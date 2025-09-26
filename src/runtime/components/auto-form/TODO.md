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

[已完成] controlProps、controlSlots

- meta.mapped 是对应后control的默认值属性
- meta.controlProps -> meta.mapped.controlProps
- 优先级：meta.controlProps > meta.mapped.controlProps
- 组件初始化时自动设置

```ts
z.object({
  nameValue: z.string({
    controlProps: {
      class: 'w-md',
    },
  }),
})
```

# 柯里化 API - 键约束的对象工厂

## 基础用法

```ts
const { afz } = createAutoFormZ()

// 三种对象工厂，行为差异：
const schema = afz.object<State>()({...})        // strip: 允许额外键，解析时剥离
const schema = afz.looseObject<State>()({...})   // loose: 允许额外键，解析时保留
const schema = afz.strictObject<State>()({...})  // strict: 禁止额外键，解析时报错
```

## 键名提示与约束

- **参数侧键名提示**：`afz.object<State>()({ /* 此处有 State 的键名提示 */ })`
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

const afz = createAutoFormZ()
const schema = afz.object<State>()({
  name: afz.string(),
  address: afz.object<State['address']>()({  // 子作用域，有 city/province 提示
    city: afz.string(),
    province: afz.string(),
  }),
})

// 深层嵌套
const deep = afz.object<State['address']['geo']['coordinates']>()({...})
```

## 链式调用支持

```ts
const schema = afz.looseObject<State>()({
  name: afz.string(),
  address: afz.object<State['address']>()({
    city: afz.string(),
    province: afz.string(),
  }).optional(),
}).meta({
  label: '用户信息'
}).optional()

// 支持所有 Zod 方法：.optional(), .meta(), .default(), .nullable() 等
```

## 类型推断与补全

```ts
const schema = afz.object<State>()({...})
type _State = z.output<typeof schema>  // 推荐使用，获得完整字段提示

const state = ref<z.output<typeof schema>>({
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
type DynamicFormFieldSlots<T> = Record<string, (props?: object) => any> & Record<`${keyof T extends string ? keyof T : never}-${'label' | 'description' | 'hint' | 'help' | 'error'}`, (props?: object) => any>
export type AuthFormSlots<T extends object = object, F extends AuthFormField = AuthFormField> = {
  header: (props?: object) => any
  leading: (props?: object) => any
  title: (props?: object) => any
  description: (props?: object) => any
  providers: (props?: object) => any
  validation: (props?: object) => any
  submit: (props: { loading: boolean }) => any
  footer: (props?: object) => any
} & DynamicFieldSlots<T, F> & DynamicFormFieldSlots<T>
```

# field: any 的类型优化 ✔️

# buildSlotProps 的类型优化 ✔️

# object 字段的 UAccordion 包装功能

- [UAccordion 源码](https://raw.githubusercontent.com/nuxt/ui/refs/heads/v4/src/runtime/components/Accordion.vue)

## 困惑点：

```ts
const schema = afz.object<State>()({
  visibleTest: afz.boolean(),
  nestedObject: afz.object<State['nestedObject']>()({
    firstName: afz.string().default('default name').optional(),
    lastName: afz.string().meta({
      label: ({ state }) => `动态字段: ${state.nestedObject?.firstName}`,
      required: ({ state }) => state.visibleTest,
      hidden: ({ state }) => state.visibleTest,
    }),
    userAge: afz.number(),
    address: afz.object<State['nestedObject']['address']>()({
      province: afz.string(),
      city: afz.string(),
      district: afz.string(),
    }),
  }).optional().meta({
    hidden: ({ state }) => state.visibleTest, // 不生效
    label: '用户信息',
  }),
  nameValue: afz.string().meta({
    // if: ({ state }) => state.visibleTest,
  }),
})
```

- 当前 AuthFormSlots 插槽如下：

  ```ts
  export type DynamicFormSlots<T>
  = Record<string, (props: AutoFormFieldContext<T>) => any>
    & Record<`${DynamicFieldSlotKeys}`, (props: AutoFormFieldContext<T>) => any>
    & Record<`${DynamicFieldSlotKeys}:${NestedKeys<T>}`, (props: AutoFormFieldContext<T>) => any>
  ```

  对于 nestedObject 字段的渲染，默认使用 UAccordion 包装，UAccordion 的 default 插槽默认渲染 AutoFormFieldRenderer 组件（属性从 meta 中获取）, UAccordion 的 content 插槽默认渲染 AutoFormNestedRenderer 组件（遍历 children 字段）。
  <template #nestedObject>
    222
  </template>
  这种情况下，整个 nestedObject 字段会渲染成 222，而不是 UAccordion 的渲染。（如果该功能是合理的，DynamicFormSlots 中的 object 应该去除 DynamicFieldSlotKeys 的前缀？）

- 属性的获取方式

  是否推荐在 meta 的属性中增加 UAccordion 的属性，例如：
  ```ts
  meta: {
    hidden: ({ state }) => state.visibleTest,
    label: '用户信息',
    accordion: {
      disabled: true,
    },
  },
  ```

# 处理 submit 事件
