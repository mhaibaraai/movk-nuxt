<script setup lang="ts">
import type { z } from 'zod'

const { afz } = useAutoForm()
const toast = useToast()

const loginSchema = afz.object({
  email: afz.email({ controlProps: { placeholder: 'demo@movk.dev' } }).meta({ label: '邮箱' }),
  password: afz.string({ type: 'withPasswordToggle' }).min(6).meta({ label: '密码' }),
  remember: afz.boolean({ type: 'switch' }).default(false).meta({ label: '记住我' })
})
const loginState = reactive<Partial<z.input<typeof loginSchema>>>({})

async function onLogin() {
  await new Promise(r => setTimeout(r, 1500))
  toast.add({ title: '登录成功', description: `欢迎 ${loginState.email}`, color: 'success' })
}

const registerSchema = afz.object({
  account: afz.object({
    username: afz.string().min(3).meta({ label: '用户名' }),
    password: afz.string({ type: 'withPasswordToggle' }).min(8).meta({ label: '密码' }),
    confirm: afz.string({ type: 'withPasswordToggle' }).min(8).meta({ label: '确认密码' })
  }).meta({ label: '账号信息' }),
  profile: afz.object({
    name: afz.string().meta({ label: '昵称' }),
    phone: afz.string({ type: 'asPhoneNumberInput' }).meta({ label: '手机' }),
    interests: afz.array(afz.string(), { type: 'inputTags' }).default([]).meta({ label: '兴趣标签' })
  }).meta({ label: '个人资料' }),
  agreement: afz
    .boolean()
    .refine(v => v === true, { message: '必须同意条款' })
    .meta({ label: '同意条款' })
}).refine(d => d.account?.password === d.account?.confirm, {
  message: '两次密码不一致',
  path: ['account', 'confirm']
})
const registerState = reactive<Partial<z.input<typeof registerSchema>>>({})

async function onRegister() {
  await new Promise(r => setTimeout(r, 1200))
  toast.add({ title: '注册成功', color: 'success' })
}

const fileSchema = afz.object({
  title: afz.string({ controlProps: { placeholder: '附件描述' } }).meta({ label: '标题' }),
  attachments: afz.array(afz.file()).default([]).meta({ label: '附件（多选）' })
})
const fileState = reactive<Partial<z.input<typeof fileSchema>>>({})

async function onFileSubmit() {
  await new Promise(r => setTimeout(r, 600))
  const count = fileState.attachments?.length ?? 0
  toast.add({ title: `已上传 ${count} 个文件`, color: 'success' })
}

const searchSchema = afz.object({
  keyword: afz.string({ controlProps: { placeholder: '输入关键字' } }).optional().meta({ label: '关键字' }),
  category: afz
    .enum(['全部', '前端', '后端', '运维'], { type: 'pillGroup' })
    .default('全部')
    .meta({ label: '分类' }),
  status: afz
    .enum(['active', 'archived'], { type: 'radioGroup' })
    .default('active')
    .meta({ label: '状态' })
})
const searchState = reactive<Partial<z.input<typeof searchSchema>>>({})
const searchRef = useTemplateRef('searchForm')

async function onSearch() {
  await new Promise(r => setTimeout(r, 300))
  toast.add({ title: '查询完成', description: JSON.stringify(searchState), color: 'info' })
}

function onSearchReset() {
  searchRef.value?.reset()
  toast.add({ title: '已重置', color: 'neutral' })
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
    <Showcase title="登录表单" description="使用邮箱、密码和记住我字段，loadingAuto 自动管理提交按钮 loading 状态" :state="loginState">
      <MAutoForm
        :schema="loginSchema"
        :state="loginState"
        :submit-button-props="{ block: true, label: '登 录' }"
        @submit="onLogin"
      />
    </Showcase>

    <Showcase title="嵌套对象注册" description="通过嵌套 object 分组账号与资料字段，并用 refine 校验两次密码一致" :state="registerState">
      <MAutoForm
        :schema="registerSchema"
        :state="registerState"
        :submit-button-props="{ label: '注 册' }"
        @submit="onRegister"
      />
    </Showcase>

    <Showcase title="文件上传" description="afz.array(afz.file()) 渲染多文件上传字段，并在异步提交后统计文件数量" :state="fileState">
      <MAutoForm
        :schema="fileSchema"
        :state="fileState"
        :submit-button-props="{ label: '上 传' }"
        @submit="onFileSubmit"
      />
    </Showcase>

    <Showcase title="搜索表单" description="globalMeta 横向排布筛选项，footer 插槽接管搜索和重置按钮" :state="searchState">
      <MAutoForm
        ref="searchForm"
        :schema="searchSchema"
        :state="searchState"
        :global-meta="{ orientation: 'horizontal', size: 'sm' }"
        :submit-button="false"
        @submit="onSearch"
      >
        <template #footer="{ loading }">
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="soft" size="sm" label="重置" @click="onSearchReset" />
            <UButton type="submit" size="sm" label="搜索" :loading="loading" />
          </div>
        </template>
      </MAutoForm>
    </Showcase>
  </div>
</template>
