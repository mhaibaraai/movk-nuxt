<script setup lang="ts">
import { z } from 'zod/v4'

// 定义测试 schema
const testSchema = z.object({
  // 基础字段
  name: z.string().meta({ label: '姓名' }),
  age: z.number().meta({ label: '年龄' }),

  // 嵌套对象字段
  address: z.object({
    street: z.string().meta({ label: '街道地址' }),
    city: z.string().meta({ label: '城市' }),
    country: z.string().meta({ label: '国家' }),
    postalCode: z.string().optional().meta({ label: '邮政编码' }),
  }).meta({
    label: '地址信息',
    collapsible: {
      title: '地址信息',
      icon: 'i-lucide-map-pin',
      defaultOpen: true,
    },
  }),

  // 另一个嵌套对象
  contact: z.object({
    email: z.string().email().meta({ label: '邮箱地址' }),
    phone: z.string().meta({ label: '手机号码' }),
    website: z.string().url().optional().meta({ label: '个人网站' }),
  }).meta({
    label: '联系方式',
    collapsible: {
      title: '联系方式',
      icon: 'i-lucide-phone',
      defaultOpen: false,
    },
  }),

  // 深层嵌套
  preferences: z.object({
    theme: z.enum(['light', 'dark']).meta({ label: '主题' }),
    notifications: z.object({
      email: z.boolean().meta({ label: '邮件通知' }),
      sms: z.boolean().meta({ label: '短信通知' }),
      push: z.boolean().meta({ label: '推送通知' }),
    }).meta({
      label: '通知设置',
      collapsible: {
        title: '通知设置',
        defaultOpen: true,
      },
    }),
  }).meta({
    label: '偏好设置',
    collapsible: {
      title: '偏好设置',
      icon: 'i-lucide-settings',
      defaultOpen: false,
    },
  }),
})

// 表单数据
const formData = ref({
  name: '',
  age: 0,
  address: {
    street: '',
    city: '',
    country: '',
    postalCode: '',
  },
  contact: {
    email: '',
    phone: '',
    website: '',
  },
  preferences: {
    theme: 'light' as const,
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  },
})

// 处理表单提交
function handleSubmit(event: any) {
  console.log('表单提交:', event.data)
  // eslint-disable-next-line no-alert
  alert('查看控制台输出')
}

// 处理表单错误
function handleError(event: any) {
  console.log('表单验证错误:', event)
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        HierarchicalAutoForm 测试
      </h1>
      <p class="text-gray-600">
        测试 object 字段的 UCollapsible 包装功能
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 表单区域 -->
      <div class="space-y-6">
        <div class="bg-white rounded-lg border p-6">
          <h2 class="text-xl font-semibold mb-4">
            层级化表单
          </h2>

          <MHierarchicalAutoForm
            v-model="formData"
            :schema="testSchema"
            class="space-y-4"
            @submit="handleSubmit"
            @error="handleError"
          >
            <UButton
              type="submit"
              label="提交表单"
              class="w-full mt-6"
            />
          </MHierarchicalAutoForm>
        </div>

        <!-- 对比：原始 AutoForm -->
        <div class="bg-gray-50 rounded-lg border p-6">
          <h2 class="text-xl font-semibold mb-4">
            原始 AutoForm（对比）
          </h2>

          <MAutoForm
            v-model="formData"
            :schema="testSchema"
            class="space-y-4"
            @submit="handleSubmit"
            @error="handleError"
          >
            <UButton
              type="submit"
              label="提交表单"
              variant="outline"
              class="w-full mt-6"
            />
          </MAutoForm>
        </div>
      </div>

      <!-- 数据预览区域 -->
      <div class="space-y-6">
        <div class="bg-white rounded-lg border p-6">
          <h2 class="text-xl font-semibold mb-4">
            表单数据预览
          </h2>

          <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>

        <div class="bg-white rounded-lg border p-6">
          <h2 class="text-xl font-semibold mb-4">
            功能说明
          </h2>

          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              <span>嵌套的 object 字段被包装在 UCollapsible 中</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              <span>支持自定义折叠标题和图标</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              <span>支持默认展开/折叠状态控制</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              <span>保持原有的字段渲染和验证逻辑</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              <span>支持深层嵌套的 object 结构</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-blue-500 mt-1">ℹ</span>
              <span>与原始 AutoForm 组件完全独立，保证向后兼容</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
