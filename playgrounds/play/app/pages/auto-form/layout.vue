<script setup lang="ts">
import type { z } from 'zod'
import { UAccordion } from '#components'

const { afz } = useAutoForm()

const gridSchema = afz.object({
  $grid: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string().meta({ label: '名字' }),
      lastName: afz.string().meta({ label: '姓氏' }),
      email: afz.email().meta({
        class: 'col-span-2',
        label: '邮箱地址',
        description: '此字段占据两列宽度'
      }),
      phone: afz.string().meta({ label: '电话' }),
      age: afz.number().int().min(0).meta({ label: '年龄' })
    }
  })
})

const responsiveSchema = afz.object({
  $responsive: afz.layout({
    // 移动端 1 列，平板 2 列，桌面端 3 列
    class: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    fields: {
      title: afz.string().meta({
        class: 'col-span-full', // 所有屏幕尺寸都占满整行
        label: '标题'
      }),
      firstName: afz.string().meta({ label: '名字' }),
      lastName: afz.string().meta({ label: '姓氏' }),
      email: afz.email().meta({ label: '邮箱' }),
      phone: afz.string().meta({ label: '电话' }),
      age: afz.number().int().min(0).meta({ label: '年龄' }),
      description: afz.string({ type: 'textarea' }).meta({
        class: 'col-span-full',
        label: '描述'
      })
    }
  })
})

const layoutSchema = afz.object({
  $accordion: afz.layout({
    component: UAccordion,
    props: {
      type: 'multiple',
      ui: {
        content: 'space-y-4'
      },
      items: [
        { label: '基本信息', icon: 'i-lucide-user', slot: 'item-0' },
        { label: '详细信息', icon: 'i-lucide-square-pen', slot: 'item-1' }
      ]
    },
    fieldSlots: {
      name: 'item-0',
      email: 'item-0',
      bio: 'item-1'
    },
    fields: {
      name: afz.string().meta({ label: '姓名' }),
      email: afz.email().meta({ label: '邮箱' }),
      bio: afz.string({ type: 'textarea' }).meta({ label: '个人简介' }).optional()
    }
  })
})

const gridState = reactive<Partial<z.output<typeof gridSchema>>>({})
const responsiveState = reactive<Partial<z.output<typeof responsiveSchema>>>({})
const layoutState = reactive<Partial<z.output<typeof layoutSchema>>>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase title="字段网格布局" description="afz.layout() 注入 CSS Grid 容器，字段 class 控制跨列" :state="gridState">
      <MAutoForm :schema="gridSchema" :state="gridState" />
    </Showcase>

    <Showcase title="响应式网格布局" description="Tailwind 断点搭配字段 class，从移动端到桌面端按列适配" :state="responsiveState">
      <MAutoForm :schema="responsiveSchema" :state="responsiveState" />
    </Showcase>

    <Showcase title="组件化分组布局" description="afz.layout({ component: UAccordion }) 把字段挂到折叠面板插槽" :state="layoutState">
      <MAutoForm :schema="layoutSchema" :state="layoutState" />
    </Showcase>
  </div>
</template>
