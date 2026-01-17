---
title: 可折叠字段
description: 使用折叠功能将嵌套字段组织成可展开/收起的部分，提高表单的整洁性和可读性。
---

## 基础用法

::tip
折叠功能基于 Nuxt UI 的 `UCollapsible` 组件实现，支持动画效果和响应式配置。
::

::component-example
---
name: 'auto-form-advanced-collapsible-example'
props:
  class: 'px-4'
---
::

## 配置选项

### `AutoFormNestedCollapsible`

`collapsible` 属性接受一个配置对象，支持以下选项：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean`{lang="ts-type"} | `true` | 是否启用折叠功能 |
| `defaultOpen` | `boolean`{lang="ts-type"} |  | 默认是否展开 |
| `open` | `boolean`{lang="ts-type"} |  | 控制展开/收起状态（受控模式） |
| `disabled` | `boolean`{lang="ts-type"} |  | 禁用折叠功能（始终展开） |
| `unmountOnHide` | `boolean`{lang="ts-type"} | `true` | 隐藏时卸载内容 |
| `as` | `string`{lang="ts-type"} | `'div'` | 渲染的元素类型 |
| `class` | `ClassNameValue`{lang="ts-type"} |  | CSS 类名 |
| `ui` | `{ root?: ClassNameValue; content?: ClassNameValue; }`{lang="ts-type"} |  | UI 样式配置 |

## 样式自定义

### 全局样式

通过 `app.config.ts` 自定义折叠面板的全局样式：

```ts [app.config.ts]
export default defineAppConfig({
  ui: {
    collapsible: {
      slots: {
        root: 'border border-gray-200 rounded-lg mb-4',
        content: 'p-4 space-y-4'
      }
    }
  }
})
```
