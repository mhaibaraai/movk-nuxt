# Auto Form 组件开发规划

## 参考文档

- [auto-form](https://www.shadcn-vue.com/docs/components/auto-form)
- [nuxt-auto-form](https://nuxt-auto-form.norbiros.dev/)

## 架构概述

当前 AutoForm 组件基于以下核心架构：

### 核心组件
- **AutoForm.vue**: 主入口，负责 Schema 内省、状态管理、字段分类渲染
- **AutoFormFieldRenderer.vue**: 叶子字段渲染器，处理单个表单字段
- **AutoFormNestedRenderer.vue**: 嵌套对象渲染器，支持 UCollapsible 折叠功能

### 工作流程
1. **Schema 内省**: 通过 `introspectSchema` 解析 Zod schema 生成字段树
2. **字段分类**: 区分叶子字段和嵌套对象字段进行不同渲染
3. **控件映射**: 优先级 `component > type > zodType` 选择合适控件
4. **响应式处理**: 通过 `useAutoFormProvider` 管理字段上下文和状态更新
5. **插槽系统**: 支持全局、字段特定、路径特定多层级插槽

### 已实现功能
- ✅ 基础类型控件映射 (string/UInput, number/UInputNumber, boolean/USwitch, date/UCalendar)
- ✅ 响应式元数据 (label, description, required, hidden, if 等)
- ✅ 嵌套对象支持 (UCollapsible 包装，可配置)
- ✅ 柯里化 API (object/looseObject/strictObject 工厂)
- ✅ 类型安全和智能提示
- ✅ 插槽系统 (支持路径特定插槽如 `label:nestedObject.field`)
- ✅ 默认值自动初始化
- ✅ readonly 属性处理 (转换为 disabled)

## 功能增强

### P0 - 关键功能缺失

#### 更多内置控件支持
```ts
// 需要补充的控件类型
const EXTENDED_CONTROLS = {
  select: createAutoFormControl({ component: USelect }),
  textarea: createAutoFormControl({ component: UTextarea }),
  radio: createAutoFormControl({ component: URadio }),
  checkbox: createAutoFormControl({ component: UCheckbox }),
  file: createAutoFormControl({ component: UInput, controlProps: { type: 'file' } }),
  email: createAutoFormControl({ component: UInput, controlProps: { type: 'email' } }),
  password: createAutoFormControl({ component: UInput, controlProps: { type: 'password' } }),
  url: createAutoFormControl({ component: UInput, controlProps: { type: 'url' } }),
}
```

#### 数组字段支持
当前不支持数组类型字段，需要实现：
- 动态添加/删除数组项
- 数组项排序
- 嵌套数组支持

## 性能优化

- 事件监听器泄漏防护 [✅]

### 文档和示例
- 完整的 API 文档
- 常用场景示例库
- 最佳实践指南

> **注意**: 不需要考虑向后兼容性，可以进行破坏性变更以优化设计。
