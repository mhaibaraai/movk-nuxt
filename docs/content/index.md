---
seo:
  title: Nuxt 4 模块化工程套件 — Schema 驱动表单、API 集成、UI 组件
  description: 基于 Zod v4 的 Schema 驱动自动表单生成、带认证与进度追踪的 API 集成系统、独立 UI 组件和通用 Composables 工具函数。
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
---
#top
:hero-background

#title
:::motion
Nuxt 4 模块化[工程套件]{.text-primary}
:::

#description
:::motion
---
transition: { duration: 0.6, delay: 0.3 }
---
基于 Nuxt UI 和 Zod v4 构建，把表单、表格、API、主题与交互四类高频需求收敛为开箱即用的模块能力：Schema 驱动的 AutoForm、功能完备的 DataTable、带认证与进度追踪的 API 系统，以及独立组件与通用 Composables。
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
  API 集成系统

  #description
  useApiFetch 三件套与上传/下载进度，内置多端点、认证、业务码校验与 Toast。
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
