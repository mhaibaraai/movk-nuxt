import { useDeptApi } from '~/api/modules/system/dept'
import type { DeptCreateReq, DeptUpdateReq } from '~/api/modules/system/dept/types'

export function useDeptTree() {
  const deptApi = useDeptApi()

  const { data, pending, refresh } = useApiFetch<DeptResp[]>('/v1/system/depts/tree', {
    toast: false
  })

  const tree = computed(() => data.value ?? [])

  async function handleCreate(body: DeptCreateReq) {
    await deptApi.create(body)
    await refresh()
  }

  async function handleUpdate(id: string, body: DeptUpdateReq) {
    await deptApi.update(id, body)
    await refresh()
  }

  async function handleDelete(id: string) {
    await deptApi.remove(id)
    await refresh()
  }

  async function getDetail(id: string) {
    return deptApi.getById(id)
  }

  return {
    tree,
    pending,
    refresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    getDetail
  }
}
