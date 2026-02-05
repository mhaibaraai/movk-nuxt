---
seo:
  title: Movk Nuxt - Nuxt 4 模块化工程套件
  description: Movk Nuxt 是一个为 Nuxt 4 设计的模块化工程套件，提供 Schema 驱动的自动表单生成、API 集成系统、独立 UI 组件和通用工具函数。
---

::u-page-hero{class="dark:bg-gradient-to-b from-neutral-900 to-neutral-950"}
---
orientation: horizontal
ui:
  container: lg:py-20
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
基于 Nuxt 4 和 Nuxt UI 的模块化扩展库，提供 Schema 驱动的自动表单生成、API 集成系统、常用 composables 工具等完整的表单与数据处理解决方案。
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
  Schema 驱动

  #description
  通过 Zod Schema 定义数据结构，自动生成完整的表单界面和验证逻辑。
  :::

  :::u-page-feature{icon="i-lucide-cloud"}
  #title
  API 集成

  #description
  useApiFetch、useUploadWithProgress、useDownloadWithProgress 等完整的 API 请求方案。
  :::

  :::u-page-feature{icon="i-lucide-blocks"}
  #title
  模块化架构

  #description
  清晰的分层架构：Core Systems、API System、Standalone Components、Composables。
  :::

  :::u-page-feature{icon="i-lucide-package"}
  #title
  独立组件库

  #description
  10+ 个高质量 UI 组件，无需依赖 AutoForm 即可独立使用。
  :::

  :::u-page-feature{icon="i-lucide-shield-check"}
  #title
  类型安全

  #description
  完整的 TypeScript 类型推断，从 Schema 到数据全程类型安全。
  :::

  :::u-page-feature{icon="i-lucide-wrench"}
  #title
  通用工具函数

  #description
  useDateFormatter 等强大的 composables，提升开发效率。
  :::

::
