<script setup lang="ts">
import type { UserCreateReq, UserUpdateReq, ResetPasswordReq } from '~/api/modules/system/user/types'
import { USER_STATUS_COLOR, USER_STATUS_LABEL } from '~/constants/system'

const {
  users, total, pending, query,
  handleDelete, handleDeleteBatch,
  handleCreate, handleUpdate, handleResetPassword,
  getDetail, handlePageChange, handleSearch
} = useUserList()

const { tree: deptTree } = useDeptTree()

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const selectedRows = ref<string[]>([])

const isResetOpen = ref(false)
const resetForm = ref<ResetPasswordReq>({ userId: '', newPassword: '' })

const form = ref<UserCreateReq & { password?: string }>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  gender: 'UNKNOWN',
  deptId: '',
  roleIds: [],
  postIds: [],
  status: 'ACTIVE',
  password: ''
})

const searchForm = ref({
  username: '',
  nickname: '',
  status: undefined as string | undefined
})

function openCreate() {
  isEditing.value = false
  editingId.value = null
  form.value = {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    gender: 'UNKNOWN',
    deptId: '',
    roleIds: [],
    postIds: [],
    status: 'ACTIVE',
    password: ''
  }
  isOpen.value = true
}

async function openEdit(id: string) {
  isEditing.value = true
  editingId.value = id
  const detail = await getDetail(id)
  form.value = {
    username: detail.username,
    nickname: detail.nickname ?? '',
    email: detail.email ?? '',
    phone: detail.phone ?? '',
    gender: detail.gender,
    deptId: detail.deptId ?? '',
    roleIds: detail.roleIds,
    postIds: detail.postIds,
    status: detail.status,
    remark: detail.remark ?? ''
  }
  isOpen.value = true
}

function openResetPassword(id: string) {
  resetForm.value = { userId: id, newPassword: '' }
  isResetOpen.value = true
}

async function handleSubmit() {
  if (isEditing.value && editingId.value) {
    const { username, password, ...updateBody } = form.value
    await handleUpdate(editingId.value, updateBody as UserUpdateReq)
  } else {
    await handleCreate(form.value as UserCreateReq)
  }
  isOpen.value = false
}

async function handleResetSubmit() {
  await handleResetPassword(resetForm.value)
  isResetOpen.value = false
}

function handleSearchSubmit() {
  handleSearch(searchForm.value)
}

const columns = [
  { key: 'select', label: '' },
  { key: 'username', label: '用户名' },
  { key: 'nickname', label: '昵称' },
  { key: 'deptName', label: '部门' },
  { key: 'phone', label: '手机号' },
  { key: 'status', label: '状态' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'actions', label: '操作' }
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2 flex-wrap">
      <UInput v-model="searchForm.username" placeholder="用户名" class="w-36" />
      <UInput v-model="searchForm.nickname" placeholder="昵称" class="w-36" />
      <USelect
        v-model="searchForm.status"
        :items="[
          { label: '全部', value: undefined },
          { label: '正常', value: 'ACTIVE' },
          { label: '禁用', value: 'DISABLED' },
          { label: '锁定', value: 'LOCKED' }
        ]"
        placeholder="状态"
        class="w-28"
      />
      <UButton icon="i-lucide-search" @click="handleSearchSubmit">
        搜索
      </UButton>
      <div class="flex-1" />
      <UButton
        v-if="selectedRows.length > 0"
        color="error"
        variant="soft"
        icon="i-lucide-trash-2"
        @click="handleDeleteBatch(selectedRows)"
      >
        批量删除
      </UButton>
      <UButton icon="i-lucide-plus" @click="openCreate">
        新增用户
      </UButton>
    </div>

    <!-- <UTable
      v-model:selected-rows="selectedRows"
      :rows="users"
      :columns="columns"
      :loading="pending"
      row-key="id"
    >
      <template #deptName-data="{ row }">
        {{ row.deptName ?? '-' }}
      </template>

      <template #status-data="{ row }">
        <UBadge
          :color="USER_STATUS_COLOR[(row as any).status] ?? 'neutral'"
          variant="subtle"
        >
          {{ USER_STATUS_LABEL[(row as any).status] ?? (row as any).status }}
        </UBadge>
      </template>

      <template #createdAt-data="{ row }">
        {{ new Date(row.createdAt).toLocaleDateString('zh-CN') }}
      </template>

      <template #actions-data="{ row }">
        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openEdit(row.id)">
            编辑
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-key-round"
            @click="openResetPassword(row.id)"
          >
            重置密码
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            @click="handleDelete(row.id)"
          >
            删除
          </UButton>
        </div>
      </template>
    </UTable> -->

    <!-- <div class="flex justify-end">
      <UPagination
        :total="total"
        :page="query.page! + 1"
        :page-size="query.size"
        @update:page="(p) => handlePageChange(p - 1)"
      />
    </div>

    <USlideover v-model:open="isOpen" :title="isEditing ? '编辑用户' : '新增用户'" class="w-[480px]">
      <template #body>
        <div class="flex flex-col gap-4 p-4">
          <UFormField label="用户名" required>
            <UInput
              v-model="form.username"
              :disabled="isEditing"
              placeholder="如：admin"
              class="w-full"
            />
          </UFormField>
          <UFormField v-if="!isEditing" label="密码" required>
            <UInput v-model="form.password" type="password" placeholder="请输入密码" class="w-full" />
          </UFormField>
          <UFormField label="昵称">
            <UInput v-model="form.nickname" placeholder="用户昵称" class="w-full" />
          </UFormField>
          <UFormField label="手机号">
            <UInput v-model="form.phone" placeholder="手机号码" class="w-full" />
          </UFormField>
          <UFormField label="邮箱">
            <UInput v-model="form.email" placeholder="电子邮箱" class="w-full" />
          </UFormField>
          <UFormField label="性别">
            <USelect
              v-model="form.gender"
              :items="[
                { label: '未知', value: 'UNKNOWN' },
                { label: '男', value: 'MALE' },
                { label: '女', value: 'FEMALE' }
              ]"
              class="w-full"
            />
          </UFormField>
          <UFormField label="部门">
            <USelect
              v-model="form.deptId"
              :items="deptTree.map(d => ({ label: d.deptName, value: d.id }))"
              placeholder="选择部门"
              class="w-full"
            />
          </UFormField>
          <UFormField label="状态">
            <USelect
              v-model="form.status"
              :items="[
                { label: '正常', value: 'ACTIVE' },
                { label: '禁用', value: 'DISABLED' }
              ]"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 p-4">
          <UButton variant="ghost" @click="isOpen = false">
            取消
          </UButton>
          <UButton @click="handleSubmit">
            保存
          </UButton>
        </div>
      </template>
    </USlideover>

    <UModal v-model:open="isResetOpen" title="重置密码">
      <template #body>
        <div class="flex flex-col gap-4 p-4">
          <UFormField label="新密码" required>
            <UInput
              v-model="resetForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 p-4">
          <UButton variant="ghost" @click="isResetOpen = false">
            取消
          </UButton>
          <UButton @click="handleResetSubmit">
            确认重置
          </UButton>
        </div>
      </template>
    </UModal> -->
  </div>
</template>
