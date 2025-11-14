<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import { UAccordion, UTabs } from '#components'

const { afz } = useAutoForm()
const toast = useToast()

// 示例 1: 静态 fieldSlots 配置
const accordionSchema = afz.object({
  $accordion: afz.layout({
    component: UAccordion,
    props: {
      items: [
        { label: '基本信息', icon: 'i-lucide-user', slot: 'item-0' },
        { label: '详细信息', icon: 'i-lucide-file-text', slot: 'item-1' }
      ]
    },
    fieldSlots: {
      name: 'item-0',
      email: 'item-0',
      bio: 'item-1'
    },
    fields: {
      name: afz.string(),
      email: afz.email(),
      bio: afz.string({ type: 'textarea' }).optional()
    }
  })
})

// 示例 2: 响应式 fieldSlots 配置
const tabsSchema = afz.object({
  userType: afz.enum(['personal', 'company']).meta({ label: '用户类型' }),
  $tabs: afz.layout({
    component: UTabs,
    props: (ctx) => {
      const isCompany = ctx.state?.userType === 'company'
      return {
        items: isCompany
          ? [
              { label: '公司信息', slot: 'tab-0' },
              { label: '联系方式', slot: 'tab-1' },
              { label: '认证信息', slot: 'tab-2' }
            ]
          : [
              { label: '个人信息', slot: 'tab-0' },
              { label: '联系方式', slot: 'tab-1' }
            ]
      }
    },
    fieldSlots: (ctx) => {
      if (ctx.state?.userType === 'company') {
        return {
          companyName: 'tab-0',
          companyCode: 'tab-0',
          phone: 'tab-1',
          address: 'tab-1',
          license: 'tab-2'
        }
      }
      return {
        username: 'tab-0',
        age: 'tab-0',
        phone: 'tab-1',
        address: 'tab-1'
      }
    },
    fields: {
      // 个人字段
      username: afz.string().meta({ label: '姓名' }).optional(),
      age: afz.number().meta({ label: '年龄' }).optional(),
      // 公司字段
      companyName: afz.string().meta({ label: '公司名称' }).optional(),
      companyCode: afz.string().meta({ label: '统一社会信用代码' }).optional(),
      license: afz.file().meta({ label: '营业执照' }).optional(),
      // 共享字段
      phone: afz.string().meta({ label: '联系电话' }),
      address: afz.string().meta({ label: '地址', type: 'textarea' }).optional()
    }
  })
})

// 示例 3: 统一 fieldSlot 配置
const simpleSchema = afz.object({
  $accordion: afz.layout({
    component: UAccordion,
    props: {
      items: [
        { label: '全部字段', icon: 'i-lucide-list', slot: 'item-all' }
      ]
    },
    fieldSlot: 'item-all',
    fields: {
      title: afz.string().meta({ label: '标题' }),
      content: afz.string().meta({ label: '内容', type: 'textarea' }),
      tags: afz.string().meta({ label: '标签' }).optional()
    }
  })
})

type AccordionSchema = z.output<typeof accordionSchema>
type TabsSchema = z.output<typeof tabsSchema>
type SimpleSchema = z.output<typeof simpleSchema>

const accordionForm = ref<Partial<AccordionSchema>>({})
const tabsForm = ref<Partial<TabsSchema>>({ userType: 'personal' })
const simpleForm = ref<Partial<SimpleSchema>>({})

async function onSubmit(event: FormSubmitEvent<any>, title: string) {
  toast.add({
    title: `${title} 提交成功`,
    color: 'success',
    description: JSON.stringify(event.data, null, 2)
  })
}
</script>

<template>
  <Navbar />
  <div class="space-y-8">
    <!-- 示例 1: Accordion 静态配置 -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          示例 1: Accordion - 静态 fieldSlots 配置
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          使用 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">fieldSlots</code> 为每个字段指定固定插槽
        </p>
      </template>
      <MAutoForm :schema="accordionSchema" :state="accordionForm" @submit="(e) => onSubmit(e, '示例1')" />
      <template #footer>
        <details>
          <summary class="cursor-pointer text-sm font-medium mb-2">
            查看表单数据
          </summary>
          <pre class="text-xs">{{ accordionForm }}</pre>
        </details>
      </template>
    </UCard>

    <!-- 示例 2: Tabs 响应式配置 -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          示例 2: Tabs - 响应式 fieldSlots 配置
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          使用函数动态配置 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">props</code> 和
          <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">fieldSlots</code>，根据表单状态切换布局
        </p>
      </template>
      <MAutoForm :schema="tabsSchema" :state="tabsForm" @submit="(e) => onSubmit(e, '示例2')" />
      <template #footer>
        <details>
          <summary class="cursor-pointer text-sm font-medium mb-2">
            查看表单数据
          </summary>
          <pre class="text-xs">{{ tabsForm }}</pre>
        </details>
      </template>
    </UCard>

    <!-- 示例 3: 统一插槽配置 -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">
          示例 3: 使用 fieldSlot 统一配置
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          使用 <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">fieldSlot</code> 将所有字段放到同一个插槽
        </p>
      </template>
      <MAutoForm :schema="simpleSchema" :state="simpleForm" @submit="(e) => onSubmit(e, '示例3')" />
      <template #footer>
        <details>
          <summary class="cursor-pointer text-sm font-medium mb-2">
            查看表单数据
          </summary>
          <pre class="text-xs">{{ simpleForm }}</pre>
        </details>
      </template>
    </UCard>
  </div>
</template>
