<script setup lang="ts">
import type { DeptCreateReq, DeptUpdateReq } from '~/api/modules/system/dept/types'

const { tree, pending, handleCreate, handleUpdate, handleDelete, getDetail } = useDeptTree()

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const parentIdForNew = ref<string | null>(null)

const form = ref<DeptCreateReq>({
  deptName: '',
  deptCode: '',
  orderNum: 0,
  status: 'ENABLED'
})

function openCreate(parentId?: string) {
  isEditing.value = false
  editingId.value = null
  parentIdForNew.value = parentId ?? null
  form.value = { deptName: '', deptCode: '', orderNum: 0, status: 'ENABLED' }
  isOpen.value = true
}

async function openEdit(id: string) {
  isEditing.value = true
  editingId.value = id
  const detail = await getDetail(id)
  form.value = {
    parentId: detail.parentId ?? undefined,
    deptName: detail.deptName,
    deptCode: detail.deptCode ?? '',
    orderNum: detail.orderNum,
    leaderUserId: detail.leaderUserId ?? undefined,
    phone: detail.phone ?? '',
    email: detail.email ?? '',
    status: detail.status
  }
  isOpen.value = true
}

async function handleSubmit() {
  if (isEditing.value && editingId.value) {
    await handleUpdate(editingId.value, form.value as DeptUpdateReq)
  } else {
    await handleCreate({
      ...form.value,
      parentId: parentIdForNew.value ?? undefined
    })
  }
  isOpen.value = false
}

const columns = [
  { key: 'deptName', label: '部门名称' },
  { key: 'deptCode', label: '部门编码' },
  { key: 'orderNum', label: '排序' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold">
        部门管理
      </h2>
      <UButton icon="i-lucide-plus" @click="openCreate()">
        新增部门
      </UButton>
    </div>

    <UTable
      :rows="tree"
      :columns="columns"
      :loading="pending"
    >
      <template #status-data="{ row }">
        <UBadge
          :color="row.status === 'ENABLED' ? 'success' : 'neutral'"
          variant="subtle"
        >
          {{ row.status === 'ENABLED' ? '启用' : '禁用' }}
        </UBadge>
      </template>

      <template #actions-data="{ row }">
        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" icon="i-lucide-plus" @click="openCreate(row.id)">
            添加子部门
          </UButton>
          <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openEdit(row.id)">
            编辑
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
    </UTable>

    <USlideover v-model:open="isOpen" :title="isEditing ? '编辑部门' : '新增部门'">
      <template #body>
        <div class="flex flex-col gap-4 p-4">
          <UFormField label="部门名称" required>
            <UInput v-model="form.deptName" placeholder="请输入部门名称" class="w-full" />
          </UFormField>
          <UFormField label="部门编码">
            <UInput v-model="form.deptCode" placeholder="请输入部门编码" class="w-full" />
          </UFormField>
          <UFormField label="排序">
            <UInput v-model.number="form.orderNum" type="number" class="w-full" />
          </UFormField>
          <UFormField label="状态">
            <USelect
              v-model="form.status"
              :items="[{ label: '启用', value: 'ENABLED' }, { label: '禁用', value: 'DISABLED' }]"
              class="w-full"
            />
          </UFormField>
          <UFormField label="联系电话">
            <UInput v-model="form.phone" placeholder="请输入联系电话" class="w-full" />
          </UFormField>
          <UFormField label="邮箱">
            <UInput v-model="form.email" placeholder="请输入邮箱" class="w-full" />
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
  </div>
</template>
