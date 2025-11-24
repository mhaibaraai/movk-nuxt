---
seo:
  title: Movk Nuxt - 强大的 Nuxt 4 模块生态系统
  description: Movk Nuxt 是一个模块化的 Nuxt 4 扩展库，提供基于 Zod Schema 的自动表单生成、自动表格生成、常用 composables 工具等多组件生态系统。
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
强大的 Nuxt 4[模块生态系统]{.text-primary}
:::

#description
:::motion
---
transition: { duration: 0.6, delay: 0.3 }
---
Movk Nuxt 是一个基于 Nuxt 4 和 Nuxt UI 的模块化扩展库。提供基于 Zod Schema 的自动表单生成、自动表格生成、常用 composables 工具等多组件生态，打造完整的表单与数据处理解决方案。
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
:::motion{class="mx-auto"}
---
transition: { duration: 0.6, delay: 0.1 }
---
  ::::prose-pre
  ---
  code: |
    // AutoForm
    const formSchema = afz.object({
      username: afz.string().min(3),
      email: afz.email(),
      age: afz.number().min(18)
    })

    <MAutoForm :schema="formSchema" :state="form" />

    // AutoTable
    // const tableSchema = atz.object({...})
    // <MAutoTable :schema="tableSchema" />
  filename: MovkNuxtEcosystem.ts
  ---

  ```ts
  import { afz } from '@movk/nuxt/autoform'

  const formSchema = afz.object({
    username: afz.string().min(3),
    email: afz.email()
  })
  ```
  ::::
:::

::
