import { useMenuApi } from '~/api/modules/system/menu'
import type { MenuCreateReq, MenuUpdateReq } from '~/api/modules/system/menu/types'

export function useMenuTree() {
  const menuApi = useMenuApi()

  // /menus/tree 返回服务端构建的树形结构
  const { data, pending, refresh } = useApiFetch<MenuResp[]>('/v1/system/menus/tree', {
    toast: false
  })

  const tree = computed(() => data.value ?? [])

  async function handleCreate(body: MenuCreateReq) {
    await menuApi.create(body)
    await refresh()
  }

  async function handleUpdate(id: string, body: MenuUpdateReq) {
    await menuApi.update(id, body)
    await refresh()
  }

  async function handleDelete(id: string) {
    await menuApi.remove(id)
    await refresh()
  }

  async function getDetail(id: string) {
    return menuApi.getById(id)
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
