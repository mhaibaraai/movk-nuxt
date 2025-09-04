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
- 类型推断与组件映射可使用 type 属性指定表单类型
- 定义元数据结构：对齐 UFormField 键，新增 `type|component|controlProps|controlUi`
- 确立控件优先级与合并：`meta.component > meta.type > 自动映射`；defaults ← 映射 ← meta
- 建立控件注册表：`type → { render, propsTypes }`，支持外部扩展
- 设计 UInputMenu/SelectMenu 协议：`items|itemsProvider|itemsRefKey`、`filter-fields|content|ui`、值类型一致性校验
- 设计插槽策略：推荐 S2 作用域插槽 `#field="{ path, render, index }"`，兼容直路径插槽
- 实现 schema 遍历：对象/对象数组/optional/default/enum/nativeEnum/union（union 需 meta 指派）
- 集成 UForm/UFormField：路径命名规范、`attach` 嵌套、错误映射与 `error > help`
- 明确已知约束：根级数组策略、`refine/superRefine` 缺键行为、SSR 与文件控件限制
- DX 增强：`controlProps` 类型提示、选择值-类型一致性校验、开发期告警与 devtools 标记
- 文档与示例：playground 覆盖嵌套/数组/选择/文件/插槽，并附 Nuxt UI 与 Zod 链接

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

### 事实对齐

- UForm（表单容器）
  - props: `state`, `schema`, `validate(state): FormError[]`, `attach`
  - 事件: `@submit`
  - 暴露方法: `submit()`, `validate()`, `clear()`, `getErrors()`, `setErrors()`
  - 用法要点: 嵌套对象/数组用子 `UForm` + `attach` 合并错误上下文
  - 参考: [Form](https://ui4.nuxt.com/docs/components/form)
- UFormField（字段容器）
  - 核心 props: `name`, `label`, `description`, `hint`, `help`, `error`, `required`, `size`, `eagerValidation`, `validateOnInputDelay`, `class`, `ui`
  - 规则: `error` 优先于 `help`；`name` 必须与 `state/schema` 键一致；`size` 透传到控件
  - 参考: [FormField](https://ui4.nuxt.com/docs/components/form-field)
- UInputMenu（建议映射别名：`InputMenu`）
  - 值/数据: `v-model`, `items: Array<{ label, value, ... }>`
  - 过滤: `filter-fields: string[]`
  - 状态: `loading`, `placeholder`, `icon`
  - UI 定制: `ui`（含 `root/base/item/leading/trailing/...` 等），`content`（定位与浮层行为）
  - 插槽: `#leading`, `#item-label` 等
  - 参考: [InputMenu](https://ui4.nuxt.com/docs/components/input-menu)
- USelectMenu（建议映射别名：`SelectMenu`）
  - UI 定制: `ui`（`base/leading/trailing/value/placeholder/content/viewport/item/...` 全量键）
  - 用法近似 `InputMenu`，多用于下拉选择型场景
  - 参考: [SelectMenu](https://ui4.nuxt.com/docs/components/select-menu)
- UInputNumber（建议映射别名：`InputNumber`）
  - 范围与步进: `min`, `max`, `step`, `stepSnapping`, `formatOptions`, `locale`
  - 行为: `disableWheelChange`, `invertWheelChange`, `readonly`, `autofocus`, `autofocusDelay`
  - UI 定制: `ui: { root, base, increment, decrement }`
  - 典型事件: `update:modelValue`（并存在 `blur/change` 等原生语义）
  - 参考: [InputNumber](https://ui4.nuxt.com/docs/components/input-number)
- UFileUpload（建议映射别名：`FileUpload`）
  - 文件: `v-model="File|File[]"`, `multiple`, `accept`
  - 交互/布局: `dropzone`, `interactive`, `layout`, `position`
  - 视觉: `label`, `description`, `icon`, `color`, `highlight`, `ui`
  - 插槽: `#actions`, `#files-bottom`（可做“全清”“自定义触发”等）
  - 参考: [FileUpload](https://ui4.nuxt.com/docs/components/file-upload)
- 嵌套与数组
  - 子对象: 子 `UForm` 绑定子 schema 与相同 `state`（子集）并 `attach`
  - 数组: 对 `state.items` `v-for` 渲染多个子 `UForm`，itemSchema + `attach`，索引驱动 `name` 路径
  - 参考: [Form（嵌套示例）](https://ui4.nuxt.com/docs/components/form)
- Zod 元数据（v4）
  - 使用 `.meta()`/registry 绑定 UI 配置；实例不可变，需在最终实例上注册
  - 路径: 为每个叶子字段（含对象数组的子键）设置 meta；维护如 `address.street`、`items[].price`
  - 参考: [Zod Metadata & Registries](https://zod.dev/metadata)
- 控件决策与合并（已确认优先级）
  - 决策优先级: `meta.component > meta.type > 自动映射`
  - `InputMenu`/`SelectMenu` 数据与配置可由 `meta.controlProps` 提供（如 `items`, `filter-fields`, `content`, `ui`）
  - 错误呈现: 依 Nuxt UI 规则由 `UForm` 下发至匹配 `UFormField.name` 的 `error`

- 用于 `meta` 的键（与 `UFormField` 对齐，外加控件配置）
  - 字段级: `label`, `description`, `hint`, `help`, `error`, `required`, `size`, `eagerValidation`, `validateOnInputDelay`, `ui`
  - 控件级: `type`（如 `'UInputMenu'`/`'USelectMenu'`/`'UInputNumber'`/…），`component`（Vue 组件），`controlProps`, `controlUi`

- 注意事项
  - `UFormField.error > help`
  - 选择类控件的返回值类型需与 zod 字段一致（单选原值，多选数组）
  - 大型控件（文件上传）在 SSR/大表单中可考虑懒加载

- 参考文档
  - Form: https://ui4.nuxt.com/docs/components/form
  - FormField: https://ui4.nuxt.com/docs/components/form-field
  - InputMenu: https://ui4.nuxt.com/docs/components/input-menu
  - SelectMenu: https://ui4.nuxt.com/docs/components/select-menu
  - InputNumber: https://ui4.nuxt.com/docs/components/input-number
  - FileUpload: https://ui4.nuxt.com/docs/components/file-upload
  - Zod Metadata: https://zod.dev/metadata

## TODO

1. 在 `src/runtime/types/index.ts` 定义并导出 AutoForm 元数据类型：
   - `FieldMeta`（对齐 `UFormField` 键：`label|description|hint|help|error|required|size|eagerValidation|validateOnInputDelay|ui`）
   - 扩展控件键：`type|component|controlProps|controlUi|discriminant|items|itemsProvider|itemsRefKey`
   - `AutoFormRegistryMeta = FieldMeta`，`AutoFormOptions`（控件映射、优先级、日志级别）
2. 在 `src/runtime/components/auto-form/registry.ts` 新建注册表与接口：
   - `autoFormRegistry = z.registry<AutoFormRegistryMeta>()`
   - `getMeta(schema)`/`setMeta(schema, meta)`，同时兼容 `.meta()` 与 `.register()` 的读取策略
   - 避免重复 `id`，遵循 Zod v4 注册表语义
   - 参考文档：[Zod Metadata and registries](https://zod.dev/metadata)
3. 新建 `src/runtime/components/auto-form/utils.ts`（不修改 `src/runtime/utils/t.ts`）：
   - Zod 工具：`getZodType`, `isOptional`, `isDefault`, `unwrapOptionalDefault`, `isEnum`, `isNativeEnum`
   - Path 工具：`joinPath`, `stringifyPath`, `parsePath`, `stableItemKey`
   - 错误映射：`zodErrorsToFormErrors`（输出 `UForm` 兼容的 `FormError[]`）
4. 在 `src/runtime/components/auto-form/mapper.ts` 实现控件决策与合并：
   - 决策：`meta.component > meta.type > 自动映射`
   - 合并：`defaults ← 映射 ← meta.controlProps/controlUi`
5. 在 `src/runtime/components/auto-form/select.ts` 实现选择协议：
   - `items | itemsProvider(query, ctx) | itemsRefKey`，并做值类型一致性校验（单选标量/多选数组）
6. 在 `src/runtime/components/auto-form/introspect.ts` 实现 zod 遍历：
   - 覆盖对象/对象数组/optional/default/enum/nativeEnum/union（union 需 `meta.discriminant` 指派）
   - 遍历时融合 `autoFormRegistry` 与 `.meta()` 的最终元数据，路径与 `ZodError.path` 对齐
7. 在 `src/runtime/components/auto-form/useFieldTree.ts` 输出字段树：
   - `useFieldTree(schema, options)` 返回 path、label、控件描述、校验态；对齐 `UFormField.name`
8. 在 `src/runtime/components/auto-form/ArrayField.vue`：
   - 实现增/删/改，索引同步与 `stableItemKey`，提供 `v-model` 同步
9. 在 `src/runtime/components/auto-form/AutoForm.vue`：
   - 集成 `UForm`/`UFormField` 渲染
   - `validate(state): FormError[]` 使用 zod 校验 + `zodErrorsToFormErrors`
   - 嵌套对象/数组用子 `UForm` + `attach`
   - 插槽：`#field="{ path, render, index }"` 与直路径插槽
   - 大型控件（如 `UFileUpload`）客户端懒加载，SSR 安全
10. 在 `src/runtime/components/auto-form/union.ts`：
    - 判别式联合：`meta.discriminant` 切换分支与子 schema
11. 在 `src/runtime/components/auto-form/dev.ts`：
    - 开发期告警：未覆盖控件、值与 `items` 失配、`itemsProvider` 返回值不一致、`meta` 冲突
12. 在 `src/runtime/components/auto-form/index.ts`：
    - 统一导出：`AutoForm.vue`, `ArrayField.vue`, `useFieldTree`, `mapper`, `utils`, `registry`, `select`, `union`, 类型
13. 在 `src/module.ts`：
    - 自动注册 `AutoForm.vue` 与子组件，确保按需导入与类型导出
14. 在 `playground/app/pages/`：
    - 新增示例：基础、嵌套对象、对象数组、枚举/选择、联合、文件上传、插槽自定义；演示 `attach` 与错误映射
15. 在 `test/`：
    - 单测：`introspect`、选择协议一致性、数组稳定 key、`zodErrorsToFormErrors`
    - 快照与交互：`union` 分支切换、数组增删
16. 在 `test/fixtures/basic/`：
    - 示例 schema 与元数据，覆盖 `.meta()` 与 `.register()` 场景
17. 添加 `src/runtime/components/auto-form/README.md`：
    - 使用指南、选择协议、插槽说明、注意事项（严格遵循“事实对齐”）
18. 构建与类型检查：
    - `pnpm -C /Users/yixuanmiao/MOVK/movk-nuxt build`，修复反馈并提交
