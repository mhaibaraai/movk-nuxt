import { useRoleApi } from '~/api/modules/system/role'
import type { RoleListQuery, RoleCreateReq, RoleUpdateReq } from '~/api/modules/system/role/types'

export function useRoleList() {
  const roleApi = useRoleApi()

  const query = ref<RoleListQuery>({
    page: 0,
    size: 20
  })

  const { data, pending, refresh } = useApiFetch<PageResp<RoleResp>>(
    '/v1/system/roles',
    {
      query,
      watch: [query],
      toast: false
    }
  )

  const roles = computed(() => data.value?.content ?? [])
  const total = computed(() => data.value?.totalElements ?? 0)

  async function handleDelete(id: string) {
    await roleApi.remove(id)
    await refresh()
  }

  async function handleDeleteBatch(ids: string[]) {
    await roleApi.removeBatch(ids)
    await refresh()
  }

  async function handleCreate(body: RoleCreateReq) {
    await roleApi.create(body)
    await refresh()
  }

  async function handleUpdate(id: string, body: RoleUpdateReq) {
    await roleApi.update(id, body)
    await refresh()
  }

  async function getDetail(id: string) {
    return roleApi.getById(id)
  }

  async function handleAssignMenus(roleId: string, menuIds: string[]) {
    await roleApi.assignMenus(roleId, menuIds)
  }

  function handlePageChange(page: number) {
    query.value = { ...query.value, page }
  }

  function handleSearch(params: Partial<RoleListQuery>) {
    query.value = { ...query.value, ...params, page: 0 }
  }

  return {
    query: readonly(query),
    roles,
    total,
    pending,
    refresh,
    handleDelete,
    handleDeleteBatch,
    handleCreate,
    handleUpdate,
    getDetail,
    handleAssignMenus,
    handlePageChange,
    handleSearch
  }
}
