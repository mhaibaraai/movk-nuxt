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

# v-if 和 v-show 添加过渡效果 ✔️

- 添加 enableTransition 属性

# [已完成] object 字段的 UAccordion 包装功能

- [UAccordion 源码](https://raw.githubusercontent.com/nuxt/ui/refs/heads/v4/src/runtime/components/Accordion.vue)

## 实现目标：

- ✅ 用户可以自定义是否进行包装
- ✅ 根据字段是否包含对象字段以及是否启用包装，在AutoForm的最外层自动包装一个 UAccordion，通过items注入折叠项
- ✅ 保留 UAccordion 的默认功能（slot，emit，props）
- ✅ 用户可以覆盖某个字段的 UAccordion 默认功能

## 实现架构：

### 1. 类型定义扩展 (`types/auto-form.ts`)

```typescript
// 新增类型定义
interface AccordionItem {
  label?: string
  icon?: string
  trailingIcon?: string
  content?: string
  value?: string
  disabled?: boolean
  slot?: string
  ui?: Record<string, any>
}

interface AccordionBaseProps {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  trailingIcon?: string
  [key: string]: any
}

interface AccordionConfig {
  enabled?: boolean                           // 是否启用包装
  props?: AccordionBaseProps                  // UAccordion 原生属性
  itemGenerator?: (field: AutoFormField) => AccordionItem  // 自定义生成器
  fieldOverrides?: Record<string, Partial<AccordionItem>>  // 字段级覆盖
  onlyForObjectFields?: boolean               // 仅对包含对象字段的表单启用
}

// 扩展 AutoFormProps
interface AutoFormProps {
  accordion?: AccordionConfig
}
```

### 2. 核心工具函数 (`utils/auto-form.ts`)

```typescript
// 字段类型检测
export function isObjectField(field: AutoFormField): boolean
export function isLeafField(field: AutoFormField): boolean

// 字段处理
export function flattenFields(fields: AutoFormField[]): AutoFormField[]
export function groupFieldsByType(fields: AutoFormField[])
export function collectTopLevelObjectFields(fields: AutoFormField[]): AutoFormField[]

// UAccordion 相关
export function hasObjectFields(fields: AutoFormField[]): boolean
export function generateAccordionItems(objectFields: AutoFormField[], config?: AccordionConfig): AccordionItem[]
export function shouldEnableAccordion(fields: AutoFormField[], config?: AccordionConfig): boolean
```

### 3. 组件架构重构

#### 主组件 (`AutoForm.vue`)
```typescript
// 智能字段处理逻辑
const processedFields = computed(() => {
  if (enableAccordionWrapper.value) {
    // UAccordion 模式：保持字段结构用于分组
    return groupFieldsByType(visibleFields.value)
  } else {
    // 普通模式：展平所有字段，只显示叶子节点
    const flattened = flattenFields(visibleFields.value)
    return { objectFields: [], regularFields: flattened }
  }
})

// 收集顶级对象字段（不包括嵌套的）
const topLevelObjectFields = computed(() =>
  enableAccordionWrapper.value ? collectTopLevelObjectFields(visibleFields.value) : []
)
```

#### 嵌套渲染器 (`AutoFormNestedRenderer.vue`)
```vue
<!-- 专门处理嵌套对象字段的递归组件 -->
<template>
  <!-- 渲染普通字段 -->
  <TransitionGroup v-if="fieldGroups.regularFields.length > 0">
    <AutoFormFieldRenderer v-for="field in fieldGroups.regularFields" />
  </TransitionGroup>

  <!-- 递归渲染嵌套对象字段 -->
  <UAccordion v-if="shouldUseNestedAccordion" :items="nestedAccordionItems">
    <template v-for="objectField in fieldGroups.objectFields" #[`content-${objectField.path}`]>
      <!-- 递归调用自身处理更深层嵌套 -->
      <AutoFormNestedRenderer
        v-if="objectField.children"
        :fields="objectField.children"
        :accordion="accordion"
      />
    </template>
  </UAccordion>
</template>
```

## 解决的核心问题：

### 问题1: 嵌套对象处理
**现象**: `nestedObject.address` 被错误地作为同级折叠面板显示
**解决方案**:
- 创建 `collectTopLevelObjectFields` 只收集顶级对象字段
- 使用 `AutoFormNestedRenderer` 递归处理嵌套结构
- 每层嵌套独立管理自己的 UAccordion

### 问题2: 普通表单对象字段渲染错误
**现象**: `[AutoForm] 控件未映射: nestedObject` 错误
**解决方案**:
- 使用 `flattenFields` 递归展平对象字段
- 区分容器字段（对象）和叶子字段（有控件）
- 普通模式下只渲染叶子节点字段

## 使用示例：

```vue
<MAutoForm
  :schema="schema"
  :accordion="{
    enabled: true,
    onlyForObjectFields: true,
    props: {
      type: 'multiple',
      collapsible: true
    },
    fieldOverrides: {
      'nestedObject': {
        label: '用户信息',
        icon: 'i-lucide-user'
      },
      'nestedObject.address': {
        label: '详细地址',
        icon: 'i-lucide-map-pin'
      }
    }
  }"
/>
```

## 实现特性：

- ✅ **向后兼容**: 不影响现有功能，可选启用
- ✅ **智能检测**: 自动识别对象字段，决定是否启用包装
- ✅ **递归嵌套**: 正确处理多层嵌套对象（如 user.address.details）
- ✅ **字段展平**: 普通模式下自动展平，避免渲染错误
- ✅ **灵活配置**: 支持全局配置和字段级覆盖
- ✅ **透传功能**: 保留 UAccordion 的所有原生功能
- ✅ **自定义能力**: 支持自定义 item 生成逻辑

## 功能修正

UAccordion 的源码如下：

```ts
<AccordionHeader as="div" :class="ui.header({ class: [props.ui?.header, item.ui?.header] })">
  <AccordionTrigger :class="ui.trigger({ class: [props.ui?.trigger, item.ui?.trigger], disabled: item.disabled })">
    <slot name="leading" :item="item" :index="index" :open="open">
      <UIcon v-if="item.icon" :name="item.icon" :class="ui.leadingIcon({ class: [props.ui?.leadingIcon, item?.ui?.leadingIcon] })" />
    </slot>

    <span v-if="get(item, props.labelKey as string) || !!slots.default" :class="ui.label({ class: [props.ui?.label, item.ui?.label] })">
      <slot :item="item" :index="index" :open="open">{{ get(item, props.labelKey as string) }}</slot>
    </span>

    <slot name="trailing" :item="item" :index="index" :open="open">
      <UIcon :name="item.trailingIcon || trailingIcon || appConfig.ui.icons.chevronDown" :class="ui.trailingIcon({ class: [props.ui?.trailingIcon, item.ui?.trailingIcon] })" />
    </slot>
  </AccordionTrigger>
</AccordionHeader>
```

leading
{ item: AccordionItem; index: number; open: boolean; }

default
{ item: AccordionItem; index: number; open: boolean; }

trailing
{ item: AccordionItem; index: number; open: boolean; }

渲染为 UFormField 组件

- afz.object({
  a: afz.string()
}).meta({
  hidden: true,
  ...其余属性,
})
