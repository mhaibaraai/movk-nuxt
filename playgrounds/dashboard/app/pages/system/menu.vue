<script setup lang="ts">
import type { MenuCreateReq, MenuUpdateReq } from '~/api/modules/system/menu/types'
import type { MenuType } from '#shared/types/system'

const { tree, pending, handleCreate, handleUpdate, handleDelete, getDetail } = useMenuTree()

const isOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const parentIdForNew = ref<string | null>(null)

const form = ref<MenuCreateReq>({
  name: '',
  type: 'DIRECTORY',
  orderNum: 0,
  visible: true,
  status: 'ENABLED',
  isFrame: false,
  isCache: false
})

const typeOptions = [
  { label: '目录', value: 'DIRECTORY' },
  { label: '菜单', value: 'MENU' },
  { label: '按钮', value: 'BUTTON' }
]

const typeIconMap: Record<MenuType, string> = {
  DIRECTORY: 'i-lucide-folder',
  MENU: 'i-lucide-file',
  BUTTON: 'i-lucide-square-mouse-pointer'
}

function openCreate(parentId?: string) {
  isEditing.value = false
  editingId.value = null
  parentIdForNew.value = parentId ?? null
  form.value = {
    name: '',
    type: 'MENU',
    orderNum: 0,
    visible: true,
    status: 'ENABLED',
    isFrame: false,
    isCache: false
  }
  isOpen.value = true
}

async function openEdit(id: string) {
  isEditing.value = true
  editingId.value = id
  const detail = await getDetail(id)
  form.value = {
    parentId: detail.parentId ?? undefined,
    type: detail.type,
    name: detail.name,
    orderNum: detail.orderNum,
    path: detail.path ?? '',
    component: detail.component ?? '',
    permissionCode: detail.permissionCode ?? '',
    visible: detail.visible,
    status: detail.status,
    icon: detail.icon ?? '',
    isFrame: detail.isFrame,
    isCache: detail.isCache
  }
  isOpen.value = true
}

async function handleSubmit() {
  if (isEditing.value && editingId.value) {
    await handleUpdate(editingId.value, form.value as MenuUpdateReq)
  } else {
    await handleCreate({
      ...form.value,
      parentId: parentIdForNew.value ?? undefined
    })
  }
  isOpen.value = false
}

const columns = [
  { key: 'name', label: '菜单名称' },
  { key: 'type', label: '类型' },
  { key: 'permissionCode', label: '权限标识' },
  { key: 'orderNum', label: '排序' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold">
        菜单管理
      </h2>
      <UButton icon="i-lucide-plus" @click="openCreate()">
        新增菜单
      </UButton>
    </div>

    <UTable :rows="tree" :columns="columns" :loading="pending">
      <template #name-data="{ row }">
        <div class="flex items-center gap-2">
          <UIcon :name="typeIconMap[row.type as MenuType]" class="text-muted" />
          <span>{{ row.name }}</span>
        </div>
      </template>

      <template #type-data="{ row }">
        <UBadge variant="outline" color="neutral">
          {{ typeOptions.find(t => t.value === row.type)?.label }}
        </UBadge>
      </template>

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
          <UButton
            v-if="row.type !== 'BUTTON'"
            size="xs"
            variant="ghost"
            icon="i-lucide-plus"
            @click="openCreate(row.id)"
          >
            添加子项
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

    <USlideover v-model:open="isOpen" :title="isEditing ? '编辑菜单' : '新增菜单'">
      <template #body>
        <div class="flex flex-col gap-4 p-4">
          <UFormField label="菜单类型" required>
            <USelect v-model="form.type" :items="typeOptions" class="w-full" />
          </UFormField>
          <UFormField label="菜单名称" required>
            <UInput v-model="form.name" placeholder="请输入菜单名称" class="w-full" />
          </UFormField>
          <UFormField label="图标">
            <UInput v-model="form.icon" placeholder="如：i-lucide-home" class="w-full" />
          </UFormField>
          <UFormField label="排序">
            <UInput v-model.number="form.orderNum" type="number" class="w-full" />
          </UFormField>
          <template v-if="form.type !== 'BUTTON'">
            <UFormField label="路由地址">
              <UInput v-model="form.path" placeholder="如：/system/user" class="w-full" />
            </UFormField>
          </template>
          <template v-if="form.type === 'MENU'">
            <UFormField label="组件路径">
              <UInput v-model="form.component" placeholder="如：system/user" class="w-full" />
            </UFormField>
          </template>
          <UFormField label="权限标识">
            <UInput v-model="form.permissionCode" placeholder="如：system:user:list" class="w-full" />
          </UFormField>
          <UFormField label="状态">
            <USelect
              v-model="form.status"
              :items="[{ label: '启用', value: 'ENABLED' }, { label: '禁用', value: 'DISABLED' }]"
              class="w-full"
            />
          </UFormField>
          <UFormField v-if="form.type !== 'BUTTON'" label="是否显示">
            <UToggle v-model="form.visible" />
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
