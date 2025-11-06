<script lang="ts" setup>
import type { z } from 'zod/v4'

const { afz } = useAutoForm()

const customSchema = afz.object({
  userName: afz.string().meta({ label: '用户名' }),
  nameLayout: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      firstName: afz.string().meta({ label: '名字' }),
      lastName: afz.string().meta({ label: '姓氏' })
    }
  }),
  bio: afz.string({ type: 'textarea' }).meta({ label: '个人简介' }).optional(),
  profileLayout: afz.layout({
    class: 'flex flex-row gap-10',
    fields: {
      avatar: afz.string().meta({ label: '头像URL' }),
      website: afz.string().meta({ label: '个人网站' }).optional()
    }
  }),
  settings: afz.object({
    settingsLayout: afz.layout({
      class: 'grid grid-cols-2 gap-3',
      fields: {
        notifications: afz.boolean().meta({ label: '启用通知' }),
        autoSave: afz.boolean().meta({ label: '自动保存' })
      }
    }),
    advanced: afz.object({
      advancedLayout: afz.layout({
        class: 'flex flex-col gap-2',
        fields: {
          debugMode: afz.boolean().meta({ label: '调试模式' }),
          logLevel: afz.string().meta({ label: '日志级别' })
        }
      }),
      cache: afz.object({
        enabled: afz.boolean().meta({ label: '启用缓存' }),
        ttl: afz.number().meta({ label: '缓存时间(秒)' })
      }).meta({ label: '缓存配置' }).optional()
    }).meta({ label: '高级设置' }).optional()
  }).meta({ label: '设置' }).optional()
})

type CustomSchema = z.output<typeof customSchema>

const customState = ref<Partial<CustomSchema>>({})
</script>

<template>
  <Navbar />
  <!-- 多布局测试 -->
  <UCard class="overflow-y-auto">
    <template #header>
      <div class="space-y-2">
        <h3 class="text-lg font-semibold">
          3. 多布局测试
        </h3>
        <p class="text-sm text-gray-500">
          同一对象中包含多个布局，使用任意键名
        </p>
        <ul class="text-xs text-gray-600 list-disc list-inside space-y-1">
          <li>userName - 独立字段（不在布局中）</li>
          <li>nameLayout - <code class="bg-gray-100 px-1 rounded">grid-cols-2</code>，包含 firstName、lastName</li>
          <li>bio - 独立字段（不在布局中）</li>
          <li>profileLayout - <code class="bg-gray-100 px-1 rounded">flex-col</code>，包含 avatar、website</li>
          <li>settings - 嵌套对象（带自己的布局）</li>
        </ul>
      </div>
    </template>
    <MAutoForm :schema="customSchema" :state="customState" />
    <template #footer>
      <details class="text-xs">
        <summary class="cursor-pointer font-semibold mb-2">
          调试信息
        </summary>
        <pre class="bg-gray-50 p-4 rounded overflow-auto">{{ {
          hasLayout: '__autoform_layout__' in (customSchema as any),
          layoutCount: (customSchema as any).__autoform_layout__?.length || 0,
          layoutClasses: (customSchema as any).__autoform_layout__?.map((l: any) => l.class),
          shapeKeys: Object.keys((customSchema as any).shape || {})
        } }}</pre>
      </details>
    </template>
  </UCard>
</template>
