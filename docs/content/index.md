---
seo:
  title: 构建在 Nuxt UI 之上的 UI 工程套件 — AutoForm、DataTable、Vue/Vite 通用
  description: Schema 驱动的 AutoForm（Zod v4）、功能完备的 DataTable、独立组件与 Composables；Nuxt 4 中含认证与进度追踪的 API 集成的完整能力，UI 层亦可经 Vite 插件用于纯 Vue + Vite（API 集成域仅 Nuxt）。
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
:::motion
构建在 Nuxt UI 之上的 [UI 工程套件]{.text-primary}
:::

#description
:::motion
---
transition: { duration: 0.6, delay: 0.3 }
---
基于 Nuxt UI 与 Zod v4 构建的 UI 工程套件：Schema 驱动的 AutoForm、功能完备的 DataTable、独立组件与 Composables。在 Nuxt 4 中获得含认证与进度追踪的 API 集成在内的完整能力；其 UI、表单、表格与主题亦可经 Vite 插件直接用于纯 Vue + Vite 项目（API 集成域仅 Nuxt）。
:::

#links
:::motion{class="flex flex-wrap gap-x-6 gap-y-3"}
---
transition: { duration: 0.6, delay: 0.5 }
---
  ::::u-button
  ---
  to: /docs/getting-started
  size: xl
  trailing-icon: i-lucide-arrow-right
  ---
  快速入门
  ::::

  ::::u-button
  ---
  icon: i-simple-icons-github
  color: neutral
  variant: outline
  size: xl
  to: https://github.com/mhaibaraai/movk-nuxt
  target: _blank
  ---
  查看源码
  ::::
:::

#default
:home
::

::u-page-section{class="dark:bg-neutral-950"}
#title
核心特性

#description
模块化设计，渐进式采用，从简单的工具函数到完整的自动化系统，满足各种开发需求。

#features
  :::u-page-feature{icon="i-lucide-zap"}
  #title
  AutoForm 表单引擎

  #description
  通过 Zod Schema 定义数据结构，自动生成完整的表单界面、验证逻辑与布局。
  :::

  :::u-page-feature{icon="i-lucide-table"}
  #title
  DataTable 数据表格

  #description
  数据列、特殊列、树形数据、行交互、外观定制与分页加载，声明式列配置驱动。
  :::

  :::u-page-feature{icon="i-lucide-cloud"}
  #title
  API 集成系统（仅 Nuxt）

  #description
  useApiFetch 三件套与上传/下载进度，内置多端点、认证、业务码校验与 Toast；依赖 Nuxt 服务端运行时。
  :::

  :::u-page-feature{icon="i-lucide-blocks"}
  #title
  Nuxt / Vue 双模式

  #description
  既是 Nuxt 模块，也提供 @movk/nuxt/vite + vue-plugin，让 UI 层在纯 Vue + Vite 项目中直接可用。
  :::

  :::u-page-feature{icon="i-lucide-package"}
  #title
  组件与 Composables

  #description
  DatePicker、PillGroup、SearchForm 等独立组件，搭配 useTheme、useMessageBox 等工具。
  :::

  :::u-page-feature{icon="i-lucide-shield-check"}
  #title
  类型安全

  #description
  完整的 TypeScript 类型推断，prop 回调与事件处理类型可索引访问派生。
  :::

  :::u-page-feature{icon="i-lucide-sparkles"}
  #title
  AI 友好

  #description
  内置 MCP Server 与 llms.txt，组件、composable 与文档可被 AI 智能体检索。
  :::
::

::u-page-section
---
orientation: horizontal
links:
  - label: 查看 AutoForm 文档
    to: /docs/auto-form
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
Schema 即表单

#description
用 Zod v4 描述数据结构，AutoForm 自动渲染控件、绑定校验、组织布局，并通过元数据精细控制每个字段的外观与条件显隐。

#features
  :::u-page-feature{icon="i-lucide-binary"}
  #title
  Schema 驱动

  #description
  afz 工厂在 Zod 之上扩展控件类型与元数据，一份 Schema 同时承载数据约束与界面定义。
  :::

  :::u-page-feature{icon="i-lucide-shield-check"}
  #title
  内建校验

  #description
  字段约束直接来自 Zod，提交即校验，错误信息可逐字段自定义。
  :::

  :::u-page-feature{icon="i-lucide-layout-panel-left"}
  #title
  布局与条件渲染

  #description
  layout 分组排版，meta.if 按表单状态联动显隐，复杂表单也保持声明式。
  :::

#default
  :::code-group{class="lg:[&_pre]:min-h-[362px]"}
  ```vue [AutoForm.vue]
  <script setup lang="ts">
  import type { z } from 'zod'

  const { afz } = useAutoForm()

  const schema = afz.object({
    username: afz.string('请填写用户名').min(3).max(20),
    age: afz.number().min(18, '年龄必须大于 18 岁').max(99),
    role: afz.enum(['管理员', '编辑', '访客'] as const)
      .meta({ label: '角色', placeholder: '选择角色' }),
    email: afz.email({ error: '请输入有效的邮箱地址' })
  })

  type Schema = z.output<typeof schema>

  const state = ref<Partial<Schema>>({})
  </script>

  <template>
    <MAutoForm :schema="schema" :state="state" />
  </template>
  ```
  :::
::

::u-page-section
---
orientation: horizontal
reverse: true
links:
  - label: 查看 DataTable 文档
    to: /docs/data-table
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
声明式数据表格

#description
用一份列配置描述表格的列、对齐、排序与单元格渲染，DataTable 负责选择列、固定列、列宽拖拽、树形数据与分页等完整能力。

#features
  :::u-page-feature{icon="i-lucide-columns-3"}
  #title
  列配置驱动

  #description
  accessorKey、header、size、align、cell 一处定义，数据列与特殊列统一描述。
  :::

  :::u-page-feature{icon="i-lucide-list-tree"}
  #title
  特殊列与树形

  #description
  内建选择列、展开列、序号列，支持树形数据与级联选择策略。
  :::

  :::u-page-feature{icon="i-lucide-move-horizontal"}
  #title
  交互能力

  #description
  排序、列固定、列宽拖拽、可见性控制与分页加载，按 prop 开关。
  :::

#default
  :::code-group
  ```vue [DataTable.vue]
  <script setup lang="ts">
  import type { DataTableColumn } from '@movk/nuxt'

  interface Member {
    id: string
    name: string
    role: string
    salary: number
  }

  const data = ref<Member[]>([])

  const columns: DataTableColumn<Member>[] = [
    { type: 'selection' },
    { accessorKey: 'name', header: '姓名', size: 120 },
    { accessorKey: 'role', header: '岗位', size: 140 },
    {
      accessorKey: 'salary',
      header: '薪资',
      align: 'right',
      cell: ({ getValue }) => `¥${getValue<number>().toLocaleString()}`
    }
  ]
  </script>

  <template>
    <MDataTable :columns="columns" :data="data" sortable pinable resizable />
  </template>
  ```
  :::
::

::u-page-section
---
orientation: horizontal
links:
  - label: 查看 API 文档
    to: /docs/api
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
开箱即用的 API 集成

#description
useApiFetch 在 Nuxt useFetch 之上封装多端点切换、认证注入、业务状态码校验、数据解包与统一 Toast，配置一次即可在全应用复用。

#features
  :::u-page-feature{icon="i-lucide-layers"}
  #title
  多端点

  #description
  按名称声明多个端点，各自独立配置 baseURL、认证、Toast 与响应规则。
  :::

  :::u-page-feature{icon="i-lucide-key-round"}
  #title
  认证与业务码

  #description
  请求自动注入 Token，响应自动校验业务状态码并解包数据。
  :::

  :::u-page-feature{icon="i-lucide-bell"}
  #title
  统一 Toast 与进度

  #description
  成功与错误提示统一处理，配套上传/下载进度 composable。
  :::

#default
  :::code-group
  ```ts [component.vue]
  // SSR + CSR，首屏直出数据
  const { data, status, error } = await useApiFetch<User[]>('/users')

  // 切换端点 + 数据解包
  const { data: profile } = await useApiFetch('/profile', {
    endpoint: 'admin'
  })
  ```

  ```ts [nuxt.config.ts]
  export default defineNuxtConfig({
    movk: {
      api: {
        endpoints: {
          default: { baseURL: '/api' },
          admin: {
            baseURL: '/admin-api',
            auth: { tokenType: 'Bearer' }
          }
        }
      }
    }
  })
  ```
  :::
::

::u-page-section
---
orientation: horizontal
reverse: true
links:
  - label: 浏览组件
    to: /docs/components/date-picker
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
  - label: 浏览 Composables
    to: /docs/composables/use-theme
    color: neutral
    variant: ghost
    trailingIcon: i-lucide-arrow-right
---
#title
组件与 Composables

#description
DatePicker、SearchForm、PillGroup、SlideVerify 等独立组件即取即用，搭配 useTheme、useMessageBox、useDateFormatter 等命令式工具覆盖常见交互场景。

#features
  :::u-page-feature{icon="i-lucide-blocks"}
  #title
  独立组件

  #description
  日期选择、颜色选择、滑动验证、星级评分与输入增强，无需额外封装。
  :::

  :::u-page-feature{icon="i-lucide-square-function"}
  #title
  命令式工具

  #description
  useMessageBox 弹窗、useTheme 读写主题、useDateFormatter 格式化日期。
  :::

  :::u-page-feature{icon="i-lucide-palette"}
  #title
  运行时主题

  #description
  颜色、圆角、字体、图标集与明暗模式可在运行时切换，配套 ThemePicker。
  :::

#default
  :::code-group
  ```vue [Components.vue]
  <template>
    <MDatePicker v-model="date" />
    <MColorChooser v-model="color" />
    <MSlideVerify v-model="verified" />
  </template>
  ```

  ```ts [composables.ts]
  // 命令式弹窗
  const { confirm } = useMessageBox()
  await confirm({ type: 'warning', title: '确认删除？' })

  // 读写运行时主题
  const { primary, mode } = useTheme()
  ```
  :::
::

::u-page-section
---
links:
  - label: 配置 MCP Server
    to: /docs/getting-started/ai/mcp
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
  - label: 了解 llms.txt
    to: /docs/getting-started/ai/llms-txt
    color: neutral
    variant: ghost
    trailingIcon: i-lucide-arrow-right
---
#title
为 AI 智能体而生

#description
模块内置 MCP Server 与 llms.txt，组件 API、composable 与文档都能被 AI 智能体检索与调用，让 AI 辅助开发更精准。

#features
  :::u-page-feature{icon="i-lucide-plug"}
  #title
  MCP Server

  #description
  通过 Model Context Protocol 暴露组件、composable 与示例，供智能体实时查询。
  :::

  :::u-page-feature{icon="i-lucide-file-text"}
  #title
  llms.txt

  #description
  生成结构化的 llms.txt，让大模型快速理解模块能力与文档结构。
  :::

  :::u-page-feature{icon="i-lucide-search"}
  #title
  可检索文档

  #description
  组件、composable 与示例统一编入索引，AI 辅助开发引用更准确。
  :::
::

::u-page-c-t-a
---
class: dark:bg-neutral-950
links:
  - label: Star on GitHub
    to: https://github.com/mhaibaraai/movk-nuxt
    target: _blank
    icon: i-lucide-star
    color: neutral
  - label: 快速入门
    to: /docs/getting-started
    color: neutral
    variant: outline
    trailingIcon: i-lucide-arrow-right
---
#title
开始构建你的下一个 Nuxt 应用

#description
从一份 Schema 到完整的表单、表格与 API 集成，Movk Nuxt 帮你把高频需求收敛为开箱即用的模块能力。
::
