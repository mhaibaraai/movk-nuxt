这份文档旨在帮助开发者从零开始理解、使用并掌握 `AutoForm` 系统。

-----
# AutoForm 文档大纲

## 1\. 核心概念 (Core Concepts)

  * **Schema 定义 (`useAutoForm`)**:
      * 核心对象 `afz` 的介绍（它是 Zod 的增强版封装）。
      * 为什么使用 `afz` 而不是原生的 `z`？（解释元数据注入和链式调用）。
  * **元数据配置 (`.meta()`)**:
      * 如何设置 `label`, `description`, `hint`, `placeholder`。
      * `.meta()` 方法的使用规范。
  * **表单渲染 (`<MAutoForm>`)**:
      * 组件的基本 Props (`schema`, `state`, `action`).

## 2\. 字段类型详解 (Field Types)

  * **基础类型**: String, Number, Boolean (Checkbox/Switch).
  * **日期与时间**: DatePicker 使用与格式化 (`iso`, `timestamp` 等).
  * **选择类**: Enum, SelectMenu, RadioGroup, InputMenu.
  * **文件上传**: File Upload (单文件/多文件).
  * **复杂结构**:
      * Object (嵌套对象).
      * Array (动态数组/列表).
      * Typed Object (配合 TypeScript 接口).

## 3\. 布局系统 (Layout System)

  * **基础布局**: 默认的垂直堆叠。
  * **网格布局 (Grid)**: 使用 `afz.layout` 实现多列排版 (`grid-cols-*`).
  * **嵌套布局**: 在对象内部使用布局。
  * **交互式布局**:
      * Accordion (手风琴折叠).
      * Tabs (标签页分组).
      * FieldSlot (将多个字段聚合到一个插槽中).

## 4\. 进阶功能 (Advanced)

  * **条件渲染 (Conditional Fields)**: 使用 `if` 和 `hidden` 动态显示/隐藏字段。
  * **依赖联动 (Dependencies)**: 一个字段的值如何改变另一个字段的属性（如：选择了“其他”才显示输入框）。
  * **异步验证 (Async Validation)**: 使用 `.refine()` 进行服务端校验（如用户名查重）。
  * **响应式属性 (Reactive Props)**: 如何在 Schema 中使用 `computed` 或 `ref` 动态更新配置。
  * **默认值处理**: `default()` 方法与初始数据的合并逻辑。

## 5\. 自定义与扩展 (Customization)

  * **插槽系统 (Slots)**:
      * 表单级插槽 (`header`, `footer`, `submit`).
      * 字段级插槽 (`field-label`, `field-error`, `field-content` 等).
      * 特定字段插槽 (`field-*:path`).
  * **自定义控件 (Custom Controls)**:
      * 如何注册新的全局控件。
      * 如何在 Schema 中临时指定 `component: MyComponent`。
  * **全局元数据 (Global Meta)**: 统一配置所有字段的大小、样式类名等。

## 6\. 组件参考 (Components Reference)

  * **Form Components**:
      * `MAutoForm`
      * `MAutoFormRenderer*` (内部渲染器说明)
  * **Input Enhancements** (内置增强组件):
      * `MWithCopy`
      * `MWithClear`
      * `MWithPasswordToggle`
      * `MWithCharacterLimit`
      * `MColorChooser`
      * `MStarRating`
      * `MDatePicker`

-----

## 三、 关键章节撰写要点 (基于源码分析)

### 1\. `useAutoForm` 与 `afz` 的解释

**关键点**：必须解释清楚 `afz` 是一个工厂函数。

  * **源码引用**: `src/runtime/composables/useAutoForm.ts`
  * **解释**: `afz` 代理了 Zod 的方法，自动拦截并注入 `AUTOFORM_META`。如果用户直接使用 `import { z } from 'zod'`，虽然能验证数据，但可能无法正确传递 UI 配置（如 `label`）。
  * **代码示例**:
    ```ts
    const { afz } = useAutoForm()
    // ✅ 正确: 包含 UI 元数据
    const schema = afz.string().meta({ label: '用户名' })
    // ❌ 警告: 原生 Zod 可能丢失 UI 配置，除非手动处理
    // const schema = z.string()...
    ```

### 2\. 布局系统 (`$layout`)

**关键点**：这是该库的一大特色，非 Zod 标准功能。

  * **源码引用**: `src/runtime/utils/schema-introspector.ts` 和 `AutoFormRendererLayout.vue`
  * **解释**: 库内部识别特定的 key（如 `$layout` 或带有 `AUTOFORM_META.LAYOUT_KEY` 的字段）来渲染容器而非输入框。
  * **写法**:
    ```ts
    afz.object({
      $personal: afz.layout({
        class: 'grid grid-cols-2',
        fields: { ... }
      })
    })
    ```

### 3\. 动态数组与 CRUD

**关键点**：展示如何无需写 `v-for` 就能实现增删改查。

  * **参考文件**: `playground/app/pages/auto-form/advanced/dynamic-arrays.vue`
  * **内容**: 介绍默认的 UI（折叠面板风格），以及如何通过 `addButtonProps` 自定义添加按钮。

### 4\. 增强型组件 (Input Enhancements)

**关键点**：这些是库附带的高级 UI 组件，不仅用于 AutoForm，也可独立使用。

  * **参考目录**: `src/runtime/components/input/` 和 `playground/app/pages/components/`
  * **列表**:
      * **WithPasswordToggle**: 自动带眼睛图标的密码框。
      * **WithCopy**: 带复制功能的只读/输入框。
      * **DatePicker**: 基于 `@internationalized/date` 的强大日期选择器，支持 ISO 字符串回填。

### 5\. 插槽 (Slots) 的命名规则

**关键点**：动态插槽是自定义的核心。

  * **源码引用**: `src/runtime/types/auto-form.ts` (类型定义非常清晰)
  * **规则**:
      * `field-label`: 覆盖所有 label。
      * `field-label:username`: 仅覆盖 `username` 字段的 label。
      * `field-content:profile`: 接管整个 profile 对象的渲染。

-----

## 四、 示例代码片段库 (用于文档填充)

在撰写文档时，直接引用 Playground 中的文件作为最佳实践：

  * **基础验证**: 引用 `playground/.../getting-started/validation.vue`。
  * **条件显示**: 引用 `playground/.../advanced/conditional.vue` (展示 `hidden` 回调函数)。
  * **复杂布局**: 引用 `playground/.../examples/profile.vue` (展示 Grid 和 Group 的混合使用)。
  * **API交互**: 引用 `playground/.../field-types/object.vue` (展示 `selectMenu` 配合 API 数据加载)。

## 五、 常见问题 (FAQ) 预设

基于代码逻辑，预判用户可能遇到的问题：

1.  **Q: 为什么我的 label 不显示？**
      * A: 检查是否使用了 `afz.string()` 而不是 `z.string()`，或者是否忘记调用 `.meta({ label: '...' })`。
2.  **Q: 如何手动触发表单验证？**
      * A: 使用 `formRef.value.validate()` (源自 Nuxt UI `UForm` 的能力)。
3.  **Q: 日期选择器返回的是对象还是字符串？**
      * A: 默认是 `CalendarDate` 对象。如果需要字符串，请使用 `.transform()` 或在 `controlProps` 中配置。
