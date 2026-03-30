<script setup lang="ts">
import type { RoleCreateReq, RoleUpdateReq } from '~/api/modules/system/role/types'
import { ENABLED_DISABLED_COLOR, ENABLED_DISABLED_LABEL } from '~/constants/system'

const {
  roles, total, pending, query,
  handleDelete, handleDeleteBatch,
  handleCreate, handleUpdate, getDetail,
  handleAssignMenus, handlePageChange, handleSearch
} = useRoleList()

const { tree: menuTree } = useMenuTree()

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const selectedRows = ref<string[]>([])

const form = ref<RoleCreateReq>({
  code: '',
  name: '',
  roleSort: 0,
  status: 'ENABLED',
  roleType: 'CUSTOM',
  menuIds: []
})

const searchForm = ref({ code: '', name: '', status: undefined as string | undefined })

function openCreate() {
  isEditing.value = false
  editingId.value = null
  form.value = { code: '', name: '', roleSort: 0, status: 'ENABLED', roleType: 'CUSTOM', menuIds: [] }
  isOpen.value = true
}

async function openEdit(id: string) {
  isEditing.value = true
  editingId.value = id
  const detail = await getDetail(id)
  form.value = {
    code: detail.code,
    name: detail.name,
    roleSort: detail.roleSort,
    dataScope: detail.dataScope,
    status: detail.status,
    roleType: detail.roleType,
    menuIds: detail.menuIds,
    remark: detail.remark ?? ''
  }
  isOpen.value = true
}

async function handleSubmit() {
  if (isEditing.value && editingId.value) {
    const { code, ...updateBody } = form.value
    await handleUpdate(editingId.value, updateBody as RoleUpdateReq)
  } else {
    await handleCreate(form.value)
  }
  isOpen.value = false
}

function handleSearchSubmit() {
  handleSearch(searchForm.value)
}

const columns = [
  { key: 'select', label: '' },
  { key: 'code', label: '角色编码' },
  { key: 'name', label: '角色名称' },
  { key: 'roleType', label: '类型' },
  { key: 'roleSort', label: '排序' },
  { key: 'status', label: '状态' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'actions', label: '操作' }
]
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <UInput v-model="searchForm.code" placeholder="角色编码" class="w-40" />
      <UInput v-model="searchForm.name" placeholder="角色名称" class="w-40" />
      <USelect
        v-model="searchForm.status"
        :items="[{ label: '全部', value: undefined }, { label: '启用', value: 'ENABLED' }, { label: '禁用', value: 'DISABLED' }]"
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
        新增角色
      </UButton>
    </div>

    <UTable
      v-model:selected-rows="selectedRows"
      :rows="roles"
      :columns="columns"
      :loading="pending"
      row-key="id"
    >
      <template #roleType-data="{ row }">
        <UBadge
          :color="row.roleType === 'BUILT_IN' ? 'primary' : 'neutral'"
          variant="subtle"
        >
          {{ row.roleType === 'BUILT_IN' ? '内置' : '自定义' }}
        </UBadge>
      </template>

      <template #status-data="{ row }">
        <UBadge
          :color="ENABLED_DISABLED_COLOR[(row as any).status] ?? 'neutral'"
          variant="subtle"
        >
          {{ ENABLED_DISABLED_LABEL[(row as any).status] ?? (row as any).status }}
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
            color="error"
            icon="i-lucide-trash-2"
            @click="handleDelete(row.id)"
          >
            删除
          </UButton>
        </div>
      </template>
    </UTable>

    <div class="flex justify-end">
      <UPagination
        :total="total"
        :page="query.page! + 1"
        :page-size="query.size"
        @update:page="(p) => handlePageChange(p - 1)"
      />
    </div>

    <USlideover v-model:open="isOpen" :title="isEditing ? '编辑角色' : '新增角色'" class="w-[480px]">
      <template #body>
        <div class="flex flex-col gap-4 p-4">
          <UFormField label="角色编码" required>
            <UInput
              v-model="form.code"
              :disabled="isEditing"
              placeholder="如：admin"
              class="w-full"
            />
          </UFormField>
          <UFormField label="角色名称" required>
            <UInput v-model="form.name" placeholder="如：管理员" class="w-full" />
          </UFormField>
          <UFormField label="排序">
            <UInput v-model.number="form.roleSort" type="number" class="w-full" />
          </UFormField>
          <UFormField label="状态">
            <USelect
              v-model="form.status"
              :items="[{ label: '启用', value: 'ENABLED' }, { label: '禁用', value: 'DISABLED' }]"
              class="w-full"
            />
          </UFormField>
          <UFormField label="备注">
            <UTextarea v-model="form.remark" placeholder="备注信息" class="w-full" />
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
