# 进入研究阶段
_Exported on 2025/9/4 at GMT+8 18:44:10 from Cursor (1.5.9)_

---

**User**

@TODO.md 
进入研究阶段

---

**Cursor**

我先快速审阅与 AutoForm 相关的关键文件与配置，确认当前实现与依赖状态，然后再汇总现状与需要澄清的信息。接下来我会读取核心文件并搜索注册/引用情况。

[MODE: RESEARCH]

已审阅 AutoForm 相关代码与 Nuxt 模块接入；确认组件现状、注册方式与 playground 使用情况；列出事实与需澄清点。

### 现状（基于代码）
- AutoForm 仅为占位，未实现任何逻辑
```1:6:src/runtime/components/auto-form/AutoForm.vue
<script lang="ts" setup>
</script>

<template>
  <UForm />
</template>
```
- 组件目录已通过模块自动注册，默认前缀为 `M`，因此标签名应为 `MAutoForm`
```16:23:src/module.ts
const moduleOptionsSchema = z.object({
  /**
   * 组件前缀
   * @default 'M'
   */
  prefix: z.string().default('M'),
  i18n: z.boolean().default(false),
})
```
```92:99:src/module.ts
addComponentsDir({
  path: resolve('runtime/components'),
  prefix: options.prefix,
  pathPrefix: false,
})

addImportsDir(resolve('runtime/composables'))
```
- Nuxt UI v4 作为模块依赖存在（无额外本地配置）
```38:47:src/module.ts
moduleDependencies: {
  '@nuxt/image': {
    version: '>=1.11.0',
  },
  '@nuxt/ui': {
    version: '>=4.0.0-alpha.0',
  },
  // ...
}
```
- playground 已启用该模块；页面使用了 `UAuthForm` 与 `UForm`，但未使用 `MAutoForm`
```1:4:playground/nuxt.config.ts
export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/i18n', '@vueuse/motion/nuxt'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
```
```73:81:playground/app/pages/login.vue
<template>
  <UAuthForm
    icon="i-lucide-user"
    :title="t('auth.loginDescription')"
    :providers="providers"
    :fields="fields"
    :schema="schema"
    :submit="{ label: t('auth.loginButton') }"
    @submit="onSubmit"
  >
```
- `src/runtime/components/auto-form/TODO.md` 仅记录目标与参考链接，无需求细化

### 当前缺失（纯事实）
- 无 props/slots/emits 设计；无 `schema` 到表单项映射逻辑
- 未定义字段类型支持矩阵（text/password/number/textarea/checkbox/radio/select/switch/enum/array/object 等）
- 无 zod 解析与错误映射；无 `modelValue` 双向绑定策略
- 无布局（行列、标签对齐、描述/帮助/校验呈现）与 UI 覆写机制
- 无 i18n 接入策略（直接字符串 vs key）
- playground 未示例 `MAutoForm` 使用
- 无单测与文档

### 需要澄清的问题
- 目标范围
  - 是否仅支持 zod？是否需要支持嵌套对象、数组、枚举、联合、可选与默认值？
  - 字段到 Nuxt UI 组件的映射表是否限定为 UForm + UInput/USelect/USwitch 等，还是允许外部注入自定义渲染器？
- API 设计
  - props：`schema`、`modelValue`、`fields`（覆盖/增强）、`ui`（组件 props/slots/attrs 覆写）分别如何定义？
  - 事件：是否需要 `update:modelValue`、`submit`、`change`、`error`、`validate`？
  - 校验策略：提交时校验、变更即校验、失焦校验，还是可配置？
- 布局与可用性
  - 标签/描述/校验信息的展示位置与顺序；网格列数与断点；字段分组与分节？
- i18n 与可访问性
  - 文案是否统一用 i18n key？是否需要 aria/label/description 的 a11y 语义支持？
- 命名与集成
  - 最终标签名维持 `MAutoForm`？是否需在 playground 增加示例页（如 `/auto-form`）？
- 性能与 SSR
  - 是否要求 SSR 友好、懒加载大型组件、去抖验证？

若需，我可拉取 Nuxt UI v4 `UForm`/`UFormGroup`/`UFormField` 的官方 API 以对齐字段渲染与校验的边界。请确认上述点或给出约束，再进入下一阶段。

```vue
<script lang="ts" setup>
</script>

<template>
  <UForm />
</template>
```

```typescript
const moduleOptionsSchema = z.object({
  /**
   * 组件前缀
   * @default 'M'
   */
  prefix: z.string().default('M'),
  i18n: z.boolean().default(false),
})
```

```typescript
addComponentsDir({
  path: resolve('runtime/components'),
  prefix: options.prefix,
  pathPrefix: false,
})

addImportsDir(resolve('runtime/composables'))
```

```typescript
moduleDependencies: {
  '@nuxt/image': {
    version: '>=1.11.0',
  },
  '@nuxt/ui': {
    version: '>=4.0.0-alpha.0',
  },
  // ...
}
```

```typescript
export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/i18n', '@vueuse/motion/nuxt'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
```

```vue
<template>
  <UAuthForm
    icon="i-lucide-user"
    :title="t('auth.loginDescription')"
    :providers="providers"
    :fields="fields"
    :schema="schema"
    :submit="{ label: t('auth.loginButton') }"
    @submit="onSubmit"
  >
```

---

**User**

研究阶段@TODO.md 

---

**Cursor**

我去拉取 Nuxt UI v4 的 UForm/UFormGroup/UFormField 官方 API 文档进行梳理，然后提炼关键属性、事件、插槽与用法要点。接下来先解析库 ID，再获取对应主题文档。

[MODE: RESEARCH]

已拉取并梳理 Nuxt UI v4 的表单相关文档与示例；总结 UForm/UFormField 的核心 API、校验与嵌套用法、事件与样式覆写边界。下面给出精炼要点，供 TODO.md 对齐。

### 重要命名校对
- v4 组件集合为：UForm、UFormField、UFieldGroup（注意：不是 UFormGroup）

### UForm（核心 API 边界）
- props
  - state: 任意对象，需与 schema 对齐
  - schema: zod 模式对象（支持 z.object / 嵌套 / 数组 / union / enum 等）
  - validate?: (state) => FormError[] 自定义校验函数（与/或 zod 并用）
  - attach?: boolean（嵌套表单时附着父级错误上下文）
- 事件
  - submit: (event: FormSubmitEvent<Schema>)（提交成功时触发）
- 暴露的方法（ref）
  - submit(), validate(), clear(), getErrors(), setErrors()
- 暴露的响应式状态（ref）
  - errors, disabled, dirty, dirtyFields, touchedFields, blurredFields
- 典型 zod 类型用法
  - 类型推断使用 z.output<typeof schema>（事件中的 `event.data` 与之对齐）

### UFormField（字段容器）
- props
  - name: string（与 state/schema 键一致，驱动错误定位）
  - label?: string
  - required?: boolean（自动在 label 显示星号）
  - description?: string（标签下的说明）
  - error?: string | boolean（在表单校验时自动注入，优先级高于 help）
  - help?: string（辅助信息，error 存在时被覆盖）
  - hint?: string
  - size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  - class?: any
  - ui?: { root?, wrapper?, labelWrapper?, label?, container?, description?, error?, hint?, help? }
- 用法规则
  - 置于 UForm 内；默认插槽放入具体输入控件（如 UInput 等）
  - 当 UForm 提供 schema/validate 时，错误会下发至对应 name 的 UFormField.error

### UFieldGroup（输入组，布局/连带交互）
- 用于把多个输入与操作（如按钮/tooltip）组合；不参与校验映射，仅负责结构与样式

### 嵌套与数组（关键实践）
- 嵌套对象：使用子 UForm，传入相同 state（或子对象）与子 schema，设置 attach
- 数组：对 `state.items` 使用 v-for 渲染多个子 UForm，每个子 UForm 绑定 itemSchema 并 attach
- 示例边界
  - attach 确保父级/子级错误上下文合并显示
  - label 可按索引条件显示以避免重复标签

### 典型输入组件与 v-model 形态（与 TODO 列表对齐）
- UInput（text、password、email、number as text）、UTextarea、UInputNumber、USelect、USelectMenu、URadioGroup、UCheckbox、UCheckboxGroup、USwitch、UInputTags、UPinInput、UColorPicker、UFileUpload、USlider 等
- 通用
  - v-model="state[field]"（底层为 `modelValue` + `update:modelValue`）
- 事件差异（例）
  - UInputNumber：blur(FocusEvent), change(Event), update:modelValue(number)
- 可通过各组件的 `ui` prop 精细覆写 slot 样式（如 base, leadingIcon 等）

### 校验与错误传播边界
- zod 校验：UForm 接收 schema；提交与变更时按内部策略触发；错误传至相应 name 的 UFormField
- 自定义校验：通过 `validate(state): FormError[]` 返回 `{ name, message }` 数组；与 zod 叠加
- 必填：UFormField.required=true 时自动渲染红色星号
- 错误优先级：UFormField.error > help（error 存在则覆盖 help）

### UI/主题覆写
- 组件 `:ui="{ slotName: 'classes' }"` 精细化样式；与全局 theme 配置协同
- 以 `UFormField` 的 `ui` 对字段容器各 slot 做 class 定制（label/description/error 等）

### 能力边界与约束
- 字段映射：UFormField.name 必须与 `state`/`schema` 键名一致，否则无法正确收集/显示错误
- 联合/枚举：需借助外层状态控制条件渲染对应输入（例如选择器切换不同分支的 UForm）
- SSR/性能：表单为通用组件，需按页面体量考虑懒加载大型子组件（如 UFileUpload）
- i18n：字段 label/描述/错误文案可直接传字符串或 i18n t() 结果

若需，我可以继续补充每个输入组件的关键 props/事件速查表（如 USelect/USelectMenu 的 items/keys、UCheckboxGroup 的 items/slots、UFileUpload 的 files/校验策略）以完善 TODO 文档的映射边界与清单。

---

**User**

研究阶段：
@https://www.shadcn-vue.com/docs/components/auto-form 
研究auto-form的实现原理

---

**Cursor**

[MODE: RESEARCH]

已通读 shadcn-vue AutoForm 文档与示例，按实现原理梳理关键机制如下（仅事实，含局限与边界）。

### 总体架构
- **核心思想**：对 zod schema 做“类型遍历 + 元信息提取”，生成字段树；通过“字段→输入组件”映射渲染 UI，并将 zod 校验结果回填到对应字段的错误展示。[参考](https://www.shadcn-vue.com/docs/components/auto-form)
- **组成**：AutoForm 容器（负责 schema 解析、状态与提交）+ AutoFormField（字段渲染单元）+ 输入组件映射表（`INPUT_COMPONENTS`）+ 可选增强层（`fieldConfig`、`dependencies`、命名插槽/自定义组件）。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

### 类型推断与组件映射
- 根据 zod 基元/组合类型选择输入组件，内置支持：
  - boolean → checkbox/switch
  - date → date picker
  - enum/nativeEnum → select/radio group
  - number → number input
  - string → input/textarea
  - file → file upload
- 可通过扩展 `INPUT_COMPONENTS` 增加新类型/组件映射。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

### 字段配置层（fieldConfig）
- 因 zod schema 无法承载 UI 配置，提供 `fieldConfig` 以增强字段元信息：
  - `label`、`description`
  - `inputProps`：传递到具体输入组件的 props（含隐藏 label 等）
  - `component`：覆盖默认组件（字符串别名或自定义 Vue 组件）
- `zod.describe()` 可作为 label/说明的来源；未设置时使用字段名的“去驼峰化”。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

### 依赖引擎（dependencies）
- 声明式依赖数组，支持四类动作：
  - HIDES、DISABLES、REQUIRES、SETS_OPTIONS
- `when(sourceValue, targetValue)` 返回 true 时对目标字段生效；不自动执行反向动作（需 zod 侧默认配置配合）。依赖仅影响 UI，不改变 zod 校验本质，跨字段校验仍建议用 `refine`。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

### 嵌套与数组
- **子对象**：递归遍历 z.object，通常呈现为分组/手风琴段落；可用 `describe` 作为段落标题与说明。
- **数组**：支持“对象数组”，按项 schema 渲染可增删的子表单；根级数组不支持。默认值需与子项结构一致。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

### 校验与状态管理
- zod 全量验证（含 `refine`）；已知问题：当部分键缺失时 `refine/superRefine` 可能不执行（需注意建模方式与默认值）。[参考](https://www.shadcn-vue.com/docs/components/auto-form)
- 事件：`@submit` 返回已通过校验的数据。
- 受控模式：可与 `vee-validate` 结合（`useForm` + `toTypedSchema`）完全接管表单状态与方法；非受控模式下 AutoForm 内部管理状态并派发提交事件。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

### 标签/可选/默认值
- `optional()` → 非必填；不设置则默认必填。
- `default()` → 默认值（日期需先 `new Date(val)`）。
- `nativeEnum` 会以“标签”校验与返回值为主（与枚举值区分）。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

### 扩展性（自定义组件与插槽）
- `component` 可传入自定义字段组件，遵从 AutoFormField 期望的 props/插槽协议。
- 命名插槽：可包裹或替换某字段渲染（如自定义右侧按钮、并列操作等）。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

### 限制与注意
- 不支持根级数组 schema。
- `dependencies` 仅影响 UI 层，不自动“反设” zod 约束。
- `refine/superRefine` 在缺键时的执行行为需谨慎；必要时通过默认值/预处理保证键存在。[参考](https://www.shadcn-vue.com/docs/components/auto-form)

需要更深入的源码级细节（如 schema walker 的具体结构、`INPUT_COMPONENTS` 的类型约束、依赖解析执行时机与性能策略）可继续指定方向。链接出处：[shadcn-vue AutoForm 文档](https://www.shadcn-vue.com/docs/components/auto-form)

---

**User**

研究阶段@TODO.md 
设计当前AutoForm组件

---

**Cursor**

[MODE: RESEARCH]

以下为围绕 AutoForm 的“当前组件设计要点（调研版）”，仅陈述事实与需确认项，不给出实现方案。

- 现状（代码与目录）
  - `src/runtime/components/auto-form/AutoForm.vue` 仅占位，无逻辑。
  - 模块已自动注册 `runtime/components`，默认组件前缀为 `M`（标签名应为 `MAutoForm`）。
  - playground 未使用 `MAutoForm`，但已大量使用 Nuxt UI v4 表单组件。

- 参考实现（shadcn-vue/AutoForm 的核心原理）
  - 基于 zod 对 schema 做遍历，生成“字段树”；按“字段类型→输入组件”映射渲染；将 zod 校验结果映射到对应字段错误。[文档](https://www.shadcn-vue.com/docs/components/auto-form)
  - 字段类型内置映射：boolean/number/string/date/enum/file；可扩展 `INPUT_COMPONENTS` 增加类型/组件。[文档](https://www.shadcn-vue.com/docs/components/auto-form)
  - UI 配置通过 `fieldConfig` 承载（label、description、inputProps、component 覆盖）；`z.describe()` 作为 label/描述补充。[文档](https://www.shadcn-vue.com/docs/components/auto-form)
  - 依赖系统 `dependencies`：HIDES、DISABLES、REQUIRES、SETS_OPTIONS；仅影响 UI，不改变 zod 规则，亦不会自动“反设”约束。[文档](https://www.shadcn-vue.com/docs/components/auto-form)
  - 嵌套对象支持；数组支持“对象数组”，根级数组不支持；默认值需与 schema 结构一致。[文档](https://www.shadcn-vue.com/docs/components/auto-form)
  - 已知边界：部分键缺失时 `refine/superRefine` 可能不触发（需注意默认值/键完整性）。[文档](https://www.shadcn-vue.com/docs/components/auto-form)

- 与 Nuxt UI v4 的 API 边界（对齐点）
  - UForm：`state`、`schema`、`validate(state): FormError[]`、`attach`、`@submit`；ref 方法：`submit/validate/clear/getErrors/setErrors`；状态：`errors/dirty/...`。[文档](https://ui4.nuxt.com/docs/components/form)
  - UFormField：`name/label/required/description/error/help/hint/size/ui`；错误由 UForm 校验下发到同名字段。[文档](https://ui4.nuxt.com/docs/components/form-field)
  - 组合与嵌套：子对象用子 UForm 绑定子 schema 并 `attach`；对象数组以 v-for 渲染多个子 UForm；字段名需与 `state/schema` 键一致。[文档](https://ui4.nuxt.com/docs/components/form)
  - 输入组件族（样例）：UInput、UTextarea、UInputNumber、USelect/USelectMenu、URadioGroup、UCheckbox/UCheckboxGroup、USwitch、UInputTags、UPinInput、UColorPicker、UFileUpload、USlider；均以 `v-model` 驱动，事件与 `ui` 覆写按各自文档。

- 目标范围与差异点（结合 TODO）
  - 仅支持 zod；需支持嵌套/数组/枚举/联合/可选/默认值（与 shadcn 一致或更强）。
  - 通过 `type` 指定输入组件（对应 Nuxt UI 组件名，如 `UCheckbox` 等），与 shadcn 的“组件映射/覆盖”理念一致，但命名与族群来自 Nuxt UI。
  - 注意 Nuxt UI 为 v4：有 `UFieldGroup`，而非 `UFormGroup`。

- 风险与约束（事实）
  - `refine/superRefine` 键缺失问题；需要默认值或受控填充规避（参考上文）。
  - 根级数组在参考实现中不支持；如需支持需明确策略。
  - 文件/图片维度校验需异步校验链路（示例显示可通过 zod + FileReader 实现，注意 SSR 环境差异）。
  - 依赖系统仅 UI 层生效；与 zod 规则需协同设计。
  - i18n 文案：可直接传字符串或 t() 结果；错误文案优先级高于 help（Nuxt UI 规则）。

- 需要确认（决定后续设计边界）
  - 字段配置承载方式：是否采用 `fieldConfig` 式集中配置？键名与 schema 路径（如嵌套/数组项）的映射规范？
  - `type` 的来源与优先级：zod 推断 vs `fieldConfig.type` 强制覆盖 vs 自动映射策略？
  - 依赖系统是否纳入（HIDES/DISABLES/REQUIRES/SETS_OPTIONS），与 zod 的交互边界如何定义？
  - 数组支持范围：是否仅“对象数组”？是否支持根级数组？数组项的增删 UI 与最小项数/最大项数？
  - 事件与受控模式：是否提供 `@submit` 为主；是否支持受控 `modelValue`/外部 `state` 接管？
  - 插槽与自定义组件：是否允许命名插槽包装字段（如操作按钮区），以及以自定义 Vue 组件完全替换字段渲染？
  - UI 覆写能力：是否提供字段级 `ui`（转发到 UFormField 与输入组件），与全局 theme 的关系？
  - 校验触发策略：提交时、输入时、失焦时、可配置的组合策略？
  - 国际化：是否一律传 key，由组件内部调用 `t()`，或在调用侧先 `t()`？
  - 性能与 SSR：大体量控件（如 `UFileUpload`）的懒加载策略；SSR 兼容的校验与文件 API 使用边界。

需要更多文档细化可指向具体组件族（如 USelect/USelectMenu 的 items/keys、UFileUpload 的 files/校验与插槽等）进行补充。

---

**User**

- 字段配置承载方式通过@https://zod.dev/metadata zod 的meta属性注册实现
- type 强制覆盖 vs 自动映射策略
- 允许命名插槽包装字段
- 不考虑国际化

---

**Cursor**

[MODE: RESEARCH]

基于既定约束，逐条汇总可行性与边界（仅事实与需确认点），并给出权威出处。

### 字段配置承载方式：使用 Zod v4 的 meta/registry
- 可行性
  - Zod v4 提供 `z.globalRegistry` 与 `.meta()`/`.register()` 用于强类型元数据注册，适合承载 UI 配置（label、description、type、component、ui、options 等）。来源：[Zod Metadata & Registries](https://zod.dev/metadata)
- 关键边界
  - 元数据绑定在“具体 schema 实例”上，任何返回新实例的方法（如 `.refine()`/`.transform()`）不会自动保留原 meta；需在最终实例上注册或使用 registry 关联。来源：[Zod .meta() 行为](https://zod.dev/metadata)
  - 嵌套与数组：应为每个叶子字段（含数组元素子对象的每个键）单独设置 meta；路径解析需在 schema walker 中维护（如 `address.street`、`items[].price`）。
  - 全局 registry 的 `id` 唯一性会被检查；如使用 `id` 字段需避免重复。来源：[Zod 特殊处理 id](https://zod.dev/metadata)

### type 强制覆盖 vs 自动映射策略
- 自动映射（默认）
  - 按 Zod 类型推断输入组件（与 shadcn-vue AutoForm 类似）：boolean→checkbox/switch、number→number input、string→input/textarea、enum/nativeEnum→select/radio、date→date picker、file→file upload。来源：[shadcn-vue AutoForm](https://www.shadcn-vue.com/docs/components/auto-form)
- 强制覆盖（优先级更高）
  - 通过每个字段的 meta 承载 `type` 或 `component` 字段以覆盖默认映射；对于 union/复杂场景（如 number 但希望用 `USelectMenu`）依赖该覆盖实现。
- 典型边界
  - union/optional：自动映射可能存在二义性，需要 meta 强制指派；未指派时只能退化为基础输入。
  - enum/nativeEnum：默认 select/radio；如需自定义 items/label/value 需通过 meta 提供选项数据。
  - number：区分 `UInput(type=number)` 与 `UInputNumber` 的行为差异（步进/滚轮/本地化），应允许 meta 指明具体组件。Nuxt UI 组件能力参见其文档片段（如 `UInputNumber` 的 emits/props）。来源：[Nuxt UI Form 与 Number Field 片段](https://ui4.nuxt.com/docs/components/form)

### 允许命名插槽包装字段
- 可行性
  - 与 shadcn-vue AutoForm 一致，允许以“命名插槽 = 字段路径”的约定包装或替换某字段的渲染，用于加入并列按钮、图标、额外描述区块等。来源：[shadcn-vue AutoForm 插槽示例](https://www.shadcn-vue.com/docs/components/auto-form)
- 边界
  - 插槽命名与字段路径的映射需要明确约定（如 `#address.street`、数组项是否允许 `#items[n].price` 或使用作用域插槽传入索引）。
  - 插槽包裹但仍需将校验/错误回传到对应 `UFormField`（包裹层必须将 name 保持一致）。

### 不考虑国际化
- 直接以 meta/常量字符串作为 label/description/help/error 文案来源，不内置 `t()`。
- 错误展示遵循 Nuxt UI v4 的行为（`UForm` 下发错误到匹配 `name` 的 `UFormField.error`，error 优先级高于 help）。来源：[Nuxt UI FormField](https://ui4.nuxt.com/docs/components/form-field)

需要确认
- 元数据键名是否统一为：`label`、`description`、`type`、`component`、`ui`、`options`、`placeholder`、`required`、`help`、`hint`？是否需要保留扩展空间（如 `validateOnInputDelay` 等控制行为）。
- 覆盖优先级是否为：meta.component > meta.type > 自动映射；当 meta 与推断冲突时是否直接以 meta 为准。
- 命名插槽命名规范：是否采用“完整字段路径作为插槽名”，数组场景是否使用作用域插槽参数（传入 index/path）而非在插槽名中编码索引。
- union 选择策略：是否强制要求 meta 显式指定当前分支或提供 selector 字段，否则仅渲染兼容子集输入。

- 影响
  - 采用 zod meta 可让“字段配置”紧随 schema，减少额外映射层；但需谨慎处理实例不可变导致的 meta 丢失问题（在最终实例上调用 `.meta()` 或使用 `.register(registry, ...)`）。来源：[Zod 实例不可变性](https://zod.dev/metadata)

- 引用
  - Zod v4 Metadata & Registries: https://zod.dev/metadata
  - shadcn-vue AutoForm: https://www.shadcn-vue.com/docs/components/auto-form
  - Nuxt UI Form & FormField: https://ui4.nuxt.com/docs/components/form

- 小结
  - 用 zod `.meta()` 承载 UI 配置可行，但要注意实例不可变与嵌套/数组路径的解析；type 覆盖建议优先于自动映射；允许按字段路径命名的插槽包装；国际化不纳入考虑时，所有文案由 meta/常量直接提供。

---

**User**

- 元数据键名需对齐@https://ui4.nuxt.com/docs/components/form-field#props ，另外补充必需的type、component、、、（思考type为UInputMenu时，UInputMenu本身的props如何用户配置）
- meta.component > meta.type > 自动映射
其余的我已确认
进入创新阶段

---

**Cursor**

[MODE: INNOVATE]

基于“用 Zod v4 元数据承载字段配置”“meta.component > meta.type > 自动映射”“允许命名插槽包装字段”“不考虑国际化”的前提，提出高层设计选项与取舍。

### 元数据结构（两种建模思路）
- 方案 A：扁平 + 控件命名空间
  - 字段级直连 `UFormField` 的键：`label | description | hint | help | required | size | ui`
  - 控件选择：`type?: string`（如 `'UInputMenu'`）、`component?: Component`
  - 控件配置：`controlProps?: Record<string, unknown>`
  - 样式覆写：`controlUi?: Record<string, ClassNameValue>`
  - 优点：直观、与 Nuxt UI FormField 的 props 1:1 映射，迁移成本低
  - 缺点：`controlProps` 缺乏类型约束，需靠注册表补齐
- 方案 B：显式命名空间
  - `field: { label, description, hint, help, required, size, ui }`
  - `control: { type?: string, component?: Component, props?: object, ui?: object }`
  - 优点：语义清晰，便于后续扩展（如行为策略、校验策略）
  - 缺点：书写稍冗长
- 参考与对齐
  - `UFormField` 可用键见官方 props 文档，需保持同名对齐以避免歧义。[来源](https://ui4.nuxt.com/docs/components/form-field#props)
  - Zod v4 `.meta()`/registry 可强类型注册元数据，但注意“实例不可变”，应在最终 schema 实例上注册。[来源](https://zod.dev/metadata)

### 控件选择优先级与合并策略
- 优先级：`meta.component > meta.type > 自动映射`
  - `component`：直接渲染该 Vue 组件
  - `type`：走内置映射（`'UInput'|'USelect'|'UInputMenu'|...`）
  - 自动映射：按 zod 基元/组合类型推断（boolean→checkbox/switch、enum→select/radio、string→input/textarea、number→number input、date→date picker、file→upload）[参考](https://www.shadcn-vue.com/docs/components/auto-form)
- 合并规则
  - 控件 props：`defaults` ← `映射层建议值` ← `meta.controlProps`（最后覆盖）
  - 样式 ui：`theme` ← `映射层 ui` ← `meta.controlUi`
  - 字段容器 ui：`theme` ← `meta.ui`（覆盖）

### UInputMenu 的 props 配置（可扩展模式）
- 目标：让用户在 `meta.controlProps` 中按 3 种来源配置 items 与行为
  - 静态列表：`items: Array<{ label, value, ... }>`，配合 `labelKey`、`valueKey`、`descriptionKey`、`filterFields`
  - 异步提供者：`itemsProvider: () => Promise<Array<...>>`，支持 `lazy`、`key`、`transform`、`cacheTTL`；SSR 场景需标注“仅客户端”或提供占位状态
  - 引用式：`itemsRefKey: string`，由调用侧在上下文（pinia/composable）提供
- 值映射与类型一致性
  - 单选：zod 字段应为 `z.string()`/`z.number()` 等，输出来自 `valueKey`
  - 多选：zod 字段应为 `z.array(z.string()|z.number())`
  - 提供 `valueTransform?: (selected: any) => any` 以做最终适配（如对象→原始值）
- 体验增强
  - 过滤字段：`filterFields: string[]`
  - 自定义行展示：通过命名插槽（见下）或 `controlProps.itemSlots` 的标识与 AutoForm 转译
  - 性能：可选 `virtual`、`debounce`、`minSearchLength`

### 命名插槽包装字段（两种映射策略）
- 方案 S1：直接用“字段完整路径”作为插槽名
  - 例：`#address.street`、`#profile.emails[0]`（数组项通过作用域参数更稳妥，见下）
  - 简洁，但数组索引在插槽名中不稳定
- 方案 S2：统一一个作用域插槽，按 path 分发
  - 例：`#field="{ path, name, index, render }"`；调用侧判断 `path==='address.street'` 决定包装
  - 稳定、可批量处理数组项；需要轻薄的运行时分发
- 与校验集成
  - 包装层需保留 `UFormField` 的 `name`，或由 `render()` 提供“已绑定 name 的控件”供包裹，确保错误映射不丢失。[FormField 行为参考](https://ui4.nuxt.com/docs/components/form-field#props)

### 嵌套与数组的元数据标注
- 嵌套对象：对子字段 schema 逐一 `.meta()`；路径解析基于 walker 维护（如 `address.street`）
- 数组
  - 对“对象数组”项的子字段 `.meta()`（如 `items[].price`）
  - “根级数组”不推荐；若支持需定义提交数据包装策略
- 注意：`.refine()` 后的实例不会继承原 meta，需在最终链路末端设置。[来源](https://zod.dev/metadata)

### 类型安全与 DX（可选增强）
- 控件注册表
  - 以 `type` 为 key 的字典，附带“控件 props 类型”约束，驱动 `meta.controlProps` 的类型提示
  - 扩展第三方控件时，允许注册新 `type` 与其 props 接口
- 输出约束
  - 针对选择类控件（UInputMenu/USelect），校验“zod 字段输出类型”与“items value 类型”一致，提前报错

### 行为策略（可选开关）
- 校验触发：沿用 UForm 的 `eagerValidation`、`validateOnInputDelay`，由字段 meta 直传到 `UFormField`（保持一致体验）[参考](https://ui4.nuxt.com/docs/components/form-field#props)
- 只读/禁用：走 `controlProps.disabled/readonly` 传给控件

### 关键取舍总结
- 元数据键名对齐 `UFormField`，并新增：
  - `type | component | controlProps | controlUi`
- UInputMenu 通过 `items | itemsProvider | itemsRefKey` 供数；用 `valueKey/labelKey/...` 与 `valueTransform` 保障 zod 类型一致
- 插槽推荐 S2（统一作用域插槽按 path 分发），兼容 S1（直路径命名）以照顾直观场景
- 明确实例不可变带来的 `.meta()` 链路约束（在最终实例上注册）

参考文档：
- Zod v4 Metadata & Registries（.meta、registry、实例不可变）: https://zod.dev/metadata
- Nuxt UI v4 FormField（props/ui/验证行为）: https://ui4.nuxt.com/docs/components/form-field#props
- shadcn-vue AutoForm（类型映射、可覆盖、数组/嵌套、插槽思路）: https://www.shadcn-vue.com/docs/components/auto-form

---

**User**

将上述研究内容写入todo清单

---

**Cursor**

我将把研究要点整理成高层 TODO 条目，便于后续规划与实现。接下来写入任务列表。

- 已根据研究要点创建 10 条 TODO，覆盖元数据结构、控件优先级/注册表、UInputMenu 设计、插槽策略、schema 遍历、校验与错误展示、已知约束、DX 增强与文档链接。
- 下一步可指定其中任一任务进入实现或细化。

