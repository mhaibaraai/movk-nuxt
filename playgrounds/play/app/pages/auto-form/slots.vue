<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()

const formSlotSchema = afz.object({
  email: afz.email().meta({ label: '邮箱' }),
  password: afz.string({ type: 'withPasswordToggle' }).min(6).meta({ label: '密码' }),
  remember: afz.boolean({ type: 'switch', controlProps: { label: '记住登录状态' } }).default(true).meta({ label: '记住我' })
})
const formSlotState = reactive<Partial<z.output<typeof formSlotSchema>>>({})

async function onFormSlotSubmit() {
  await new Promise(resolve => setTimeout(resolve, 1200))
}

const genericSlotSchema = afz.object({
  username: afz.string().min(3).meta({ label: '用户名', hint: '至少 3 个字符' }),
  email: afz.email().meta({ label: '邮箱' }),
  role: afz.enum(['admin', 'user', 'guest']).meta({ label: '角色' }),
  active: afz.boolean({ controlProps: { label: '启用账户' } }).default(true).meta({ label: '状态' })
})
const genericSlotState = reactive<Partial<z.output<typeof genericSlotSchema>>>({})

const fieldSlotSchema = afz.object({
  username: afz.string().min(2).meta({ label: '用户名' }),
  password: afz.string({ type: 'withPasswordToggle' }).min(8).meta({ label: '密码' }),
  bio: afz.string({ type: 'textarea' }).default('一个简单的自我介绍').meta({ label: '简介' })
})
const fieldSlotState = reactive<Partial<z.output<typeof fieldSlotSchema>>>({})

const beforeAfterSchema = afz.object({
  settings: afz.object({
    notifications: afz.boolean({ type: 'switch', controlProps: { label: '接收通知' } }).default(true).meta({ label: '通知' }),
    digest: afz.enum(['daily', 'weekly', 'monthly']).default('weekly').meta({ label: '摘要频率' }),
    notes: afz.string({ type: 'textarea' }).default('保留默认字段渲染，只在前后插入 slot 内容。').meta({ label: '备注' })
  }).default({
    notifications: true,
    digest: 'weekly',
    notes: '保留默认字段渲染，只在前后插入 slot 内容。'
  }).meta({ label: '通知设置', collapsible: { defaultOpen: true } })
})
const beforeAfterState = reactive<Partial<z.output<typeof beforeAfterSchema>>>({})

const objectContentSchema = afz.object({
  profile: afz.object({
    displayName: afz.string().meta({ label: '显示名称' }),
    website: afz.url().meta({ label: '个人网站' }),
    bio: afz.string({ type: 'textarea' }).meta({ label: '简介' })
  }).default({
    displayName: 'Movk User',
    website: 'https://movk.dev',
    bio: '使用 field-content:profile 接管对象字段渲染。'
  }).meta({ label: '个人资料', collapsible: { defaultOpen: true } })
})
const objectContentState = reactive<Partial<z.output<typeof objectContentSchema>>>({})

const arrayContentSchema = afz.object({
  todos: afz.array(
    afz.object({
      title: afz.string().min(1).meta({ label: '标题' }),
      priority: afz.enum(['low', 'medium', 'high']).default('medium').meta({ label: '优先级' }),
      done: afz.boolean().default(false).meta({ label: '完成' })
    })
  ).default([
    { title: '整理 slot 示例', priority: 'high', done: false },
    { title: '验证 setValue 路径', priority: 'medium', done: false }
  ]).meta({ label: '待办列表', collapsible: { defaultOpen: true } })
})
const arrayContentState = reactive<Partial<z.output<typeof arrayContentSchema>>>({})

const priorityItems = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' }
]

function createTodo() {
  return { title: '', priority: 'medium' as const, done: false }
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase title="表单级插槽" description="header、footer、submit 可读取 loading、errors、state 并接管表单外层区域" :state="formSlotState">
      <MAutoForm
        :schema="formSlotSchema"
        :state="formSlotState"
        :submit-button="false"
        @submit="onFormSlotSubmit"
      >
        <template #header="{ loading }">
          <UAlert
            color="info"
            variant="soft"
            icon="i-lucide-log-in"
            title="登录表单"
            description="header slot 位于所有字段之前，可展示说明或状态"
          >
            <template v-if="loading" #actions>
              <UBadge color="info" variant="subtle">
                提交中
              </UBadge>
            </template>
          </UAlert>
        </template>

        <template #footer="{ errors, state }">
          <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <UBadge :color="errors.length ? 'error' : 'success'" variant="subtle">
              {{ errors.length ? `${errors.length} 个错误` : '校验通过' }}
            </UBadge>
            <UBadge color="neutral" variant="subtle">
              {{ state.remember ? '保持登录' : '本次登录' }}
            </UBadge>
          </div>
        </template>

        <template #submit="{ errors, loading }">
          <div class="mt-4 flex gap-2">
            <UButton type="submit" icon="i-lucide-send" :loading="loading" :disabled="errors.length > 0">
              登录
            </UButton>
            <UButton variant="outline" color="neutral" :disabled="loading">
              创建账号
            </UButton>
          </div>
        </template>
      </MAutoForm>
    </Showcase>

    <Showcase title="通用字段插槽" description="field-label、field-hint、field-error 统一接管所有字段的标签、提示和错误展示" :state="genericSlotState">
      <MAutoForm :schema="genericSlotSchema" :state="genericSlotState" :validate-on="['input', 'blur']">
        <template #field-label="{ label, path }">
          <span class="inline-flex items-center gap-2">
            <UBadge color="primary" variant="subtle" size="xs">
              {{ label }}
            </UBadge>
            <span class="text-xs text-muted">
              {{ path }}
            </span>
          </span>
        </template>

        <template #field-hint="{ hint }">
          <span class="inline-flex items-center gap-1 text-xs text-muted">
            <UIcon name="i-lucide-info" class="size-3" />
            <span>{{ hint || '通用 hint slot' }}</span>
          </span>
        </template>

        <template #field-error="{ error }">
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :description="String(error)"
            class="mt-2"
          />
        </template>
      </MAutoForm>
    </Showcase>

    <Showcase title="指定字段插槽" description="通过 field-default:bio、field-help:password 等命名插槽只覆盖指定字段" :state="fieldSlotState">
      <MAutoForm :schema="fieldSlotSchema" :state="fieldSlotState">
        <template #field-label:username="{ label }">
          <UBadge icon="i-lucide-user" color="success" variant="subtle" size="xs">
            {{ label }}
          </UBadge>
        </template>

        <template #field-help:password>
          <UAlert
            color="warning"
            variant="subtle"
            icon="i-lucide-shield-check"
            description="密码至少 8 位。这个提示只来自 password 字段的 help slot。"
            class="mt-2"
          />
        </template>

        <template #field-default:bio="{ setValue, value }">
          <UTextarea
            :model-value="value"
            :rows="5"
            placeholder="field-default:bio 完全替换默认 textarea"
            class="ring-2 ring-primary/30 rounded w-full"
            @update:model-value="setValue"
          />
        </template>
      </MAutoForm>
    </Showcase>

    <Showcase title="字段前后插槽" description="field-before:settings 与 field-after:settings 在对象字段默认渲染前后插入内容" :state="beforeAfterState">
      <MAutoForm :schema="beforeAfterSchema" :state="beforeAfterState">
        <template #field-before:settings="{ path }">
          <UAlert
            color="neutral"
            variant="subtle"
            icon="i-lucide-settings"
            title="渲染前插入"
            :description="`field-before:${path} 不接管子字段，只在默认内容前追加说明。`"
            class="mb-4"
          />
        </template>

        <template #field-after:settings="{ value }">
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <UBadge :color="value?.notifications ? 'success' : 'neutral'" variant="subtle">
              {{ value?.notifications ? '通知开启' : '通知关闭' }}
            </UBadge>
            <UBadge color="info" variant="subtle">
              {{ value?.digest || '未选择摘要频率' }}
            </UBadge>
            <span class="text-xs text-muted">
              field-after 保留默认字段交互，只追加汇总状态。
            </span>
          </div>
        </template>
      </MAutoForm>
    </Showcase>

    <Showcase title="对象 content 插槽" description="field-content:profile 接管对象字段，通过 setValue('key', value) 更新子字段" :state="objectContentState">
      <MAutoForm :schema="objectContentSchema" :state="objectContentState">
        <template #field-content:profile="{ path, value, setValue }">
          <div class="space-y-4 rounded-md border border-default p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">
                  自定义个人资料
                </p>
                <p class="text-sm text-muted">
                  每个控件都通过相对 key 更新 profile 子字段
                </p>
              </div>
              <UBadge color="info" variant="subtle">
                object
              </UBadge>
            </div>

            <UFormField label="显示名称" :name="`${path}.displayName`" required>
              <UInput
                :model-value="value?.displayName"
                icon="i-lucide-user"
                placeholder="显示名称"
                @update:model-value="setValue('displayName', $event)"
              />
            </UFormField>

            <UFormField label="个人网站">
              <UInput
                :model-value="value?.website"
                icon="i-lucide-link"
                placeholder="https://movk.dev"
                @update:model-value="setValue('website', $event)"
              />
            </UFormField>

            <UFormField label="简介">
              <UTextarea
                :model-value="value?.bio"
                :rows="4"
                placeholder="简介"
                @update:model-value="setValue('bio', $event)"
              />
            </UFormField>
          </div>
        </template>
      </MAutoForm>
    </Showcase>

    <Showcase title="数组 content 插槽" description="field-content:todos 接管数组字段，通过 setValue([...]) 与 setValue('[0].title', value) 更新列表" :state="arrayContentState">
      <MAutoForm :schema="arrayContentSchema" :state="arrayContentState">
        <template #field-content:todos="{ value, setValue }">
          <div class="space-y-3">
            <div
              v-for="(todo, index) in value || []"
              :key="index"
              class="rounded-md border border-default p-4 space-y-3"
            >
              <div class="flex items-center justify-between gap-3">
                <UBadge color="neutral" variant="subtle">
                  #{{ index + 1 }}
                </UBadge>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="setValue((value || []).filter((_, current) => current !== index))"
                />
              </div>

              <UFormField label="标题">
                <UInput
                  :model-value="todo?.title"
                  placeholder="任务标题"
                  @update:model-value="setValue(`[${index}].title`, $event)"
                />
              </UFormField>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <UFormField label="优先级">
                  <USelect
                    :model-value="todo?.priority"
                    :items="priorityItems"
                    @update:model-value="setValue(`[${index}].priority`, $event)"
                  />
                </UFormField>

                <UFormField label="完成状态">
                  <USwitch
                    :model-value="todo?.done"
                    :label="todo?.done ? '已完成' : '进行中'"
                    @update:model-value="setValue(`[${index}].done`, $event)"
                  />
                </UFormField>
              </div>
            </div>

            <UButton
              icon="i-lucide-plus"
              color="info"
              variant="soft"
              size="sm"
              @click="setValue([...(value || []), createTodo()])"
            >
              添加任务
            </UButton>
          </div>
        </template>
      </MAutoForm>
    </Showcase>
  </div>
</template>
